/*!
* njTabs - v2.0
* nejikrofl@gmail.com
* Copyright (c) 2015 N.J.
*/
;(function(window, document, undefined){
'use strict';
var $ = window.jQuery || window.j;

if(!$) {
	throw new Error('njTabs\'s requires jQuery or "j" library (https://github.com/Nejik/j)');
	return false;
}


//constructor
window.njTabs = function(opts) {
	opts = opts || {};

	if(!(this instanceof njTabs)) {//when we call njTabs not as a contructor, make instance and call it
		return new njTabs(opts);
	}

	this._init(opts);
	return this;
};

njTabs.forElement = function (elem) {//return instance

	return $(elem)[0].njTabs;
}

var proto = njTabs.prototype;

proto._init = function (opts) {
	opts = opts || {};
	var o = this.o = $.extend(true, {}, njTabs.defaults, opts),
		that = this;

	this._o = {};//inner options

	this.prevTab = {};
	this.activeTab = {};

	this.v = {//object with cached variables
		tabs: $(o.tabs).first()
	};

	if(!this.v.tabs.length) return;
	
	//gather option from data-attributes of tabs element
	this._gatherData(this.v.tabs);

	this.v.content = $(o.content);
	if(!this.v.content.length) return;


	//set instance in element
	this.v.tabs[0].njTabs = this;


	//set to default, if we reinit
	if(this._o.makeRelative) {
		delete this._o.makeRelative;
		this.v.content.css('position', '');
	}
	//make content wrapper relative, if it is not, used for animations
	if(o.anim && o.makeRelative && this.v.content.css('position') === 'static') {
		this._o.makeRelative = true;
		this.v.content.css('position', 'relative');
	}

	this.v.tabEls = this.v.tabs.find(o.tabSelector).not(o.not);

	this.v.contentEls = this.v.content.find(o.contentSelector)
											.addClass(o.contentClass)
											.css({'display':'none'});
	

	this.v.tabs.off(o.triggerEvent+'.njTabs').on(o.triggerEvent+'.njTabs', o.tabSelector, function (e) {
		o.e = e;
		var target = e.target || e.srcElement;

		if(!$(target).closest(o.not).length) {
			that.show(target);
			e.preventDefault()
		}
	})

	this.show(true);
};

proto.show = function (elem) {
	if(this._o.anim) return;

	var o = this.o,
		that = this,
		newIndex,
		tab,
		tabContentSelector,
		tabContent;


	//detect tab element
	if(typeof elem === 'number') {//set active tab via zero-based index
		if(elem < 0) {
			elem = 0;
		} else if(elem > this.v.tabEls.length - 1) {
			elem = this.v.tabEls.length - 1;
		}
		newIndex = elem;
		tab = $(this.v.tabEls[elem]);
	} else if(elem === true) {//initial show
		//detect active tab
		newIndex = 0;
		if(o.start) newIndex = o.start;

		var activeEl = this.v.tabs.find('.' + this.o.active).first();
		if(activeEl.length) {
			if(o.presentation && activeEl.is(o.presentation)) {
				newIndex = activeEl.index();
			} else if(!o.presentation) {
				newIndex = activeEl.index();
			}
		}

		tab = $(this.v.tabEls[newIndex]);
	} else {//not number and not boolean, means that it is dom element
		tab = $(elem).closest(o.tabSelector);

		//find index of current tab, among other tabs
		this.v.tabEls.each(function (i) {
			if(this === tab[0]) {
				newIndex = i;
				return false;
			}
		})
	}
	if(!tab.length) return;



	//find needed content element
	var href = function () {//check href
		var href = tab.attr('href');

		if(href && href !== '#' && href !== '#!' && !(/^(?:javascript)/i).test(href)) {//we check if href not fake attr
			return href;
		} else {
			return false;
		}
	}();
	tabContentSelector = href || tab.data('njtTarget') || newIndex;

	

	if(typeof tabContentSelector === 'string') {
		tabContent = $(tabContentSelector);
	} else if(typeof tabContentSelector === 'number') {
		tabContent = $(this.v.contentEls[tabContentSelector]);
	}
	if(!tabContent.length) return;//return if we have no content for tab



	this.prevTab = this.activeTab;
	//remember info about current tab
	this.activeTab = {
		tab: tab[0],
		index: newIndex,
		content: tabContent[0]
	}
	if(!tabContent.length) return;//if there is no tab content element, return

	//set active class to link, or to nearest specified element
	this.v.tabs.find('.' + this.o.active).removeClass(this.o.active);//remove active class
	if(o.presentation) {
		tab.closest(o.presentation).addClass(this.o.active);
	} else {
		tab.addClass(this.o.active);
	}



	if(this.active === newIndex) return;//don't change slide if it is active slide

	this._changeSlide();

	this.active = newIndex;
}

proto.destroy = function () {
	var o = this.o;

	this.v.tabs.trigger('njt_destroy', [this]);
	this.v.tabs.off('.njTabs');

	this.v.tabs[0].njTabs = null;

	this.v.tabEls.closest(o.presentation).removeClass(o.active);

	if(this._o.makeRelative) {
		delete this._o.makeRelative;
		this.v.content.css('position', '');
	}

	
	this.v.contentEls.removeClass(o.contentClass)
					 .removeClass(o.activeContent)
					 .css('display','');

	this.v.tabs.trigger('njt_destroyed', [this]);
}

proto._changeSlide = function () {
	var o = this.o,
		that = this,
		oldTab = $(this.prevTab.content),
		newTab = $(this.activeTab.content);

	this._cb_hide(this.prevTab.tab);
	this._cb_show(this.activeTab.tab);

	if(oldTab[0] === newTab[0]) {//don't change if we have one content tab for old and new tab
		this._cb_hidden(this.prevTab.tab);
		this._cb_shown(this.activeTab.tab);
		return;
	}

	if(typeof this.o.anim === 'string') {
		this._o.anim = true;//flag that shows animation in action, we can't change tabs, while previous animation not finished

		this.v.content.addClass('njt-anim-'+this.o.anim);

		//hide old tab
		oldTab.removeClass(o.activeContent+' njt-active-init');
		oldTab.addClass('njt-hide-init');
		newTab[0].clientHeight;//force relayout
		oldTab.addClass('njt-hide');

		if(that._getMaxTransitionDuration(oldTab[0])) {//if there is no transition duration, even with null setTimeout, "display none" applies after new content el apply "display block", and it flickers a little
			setTimeout(function(){
				oldTab.removeClass('njt-hide-init njt-hide').css('display','none');
				that._cb_hidden(that.prevTab.tab);
			}, that._getMaxTransitionDuration(oldTab[0]))
		} else {
			oldTab.removeClass('njt-hide-init njt-hide').css('display','none');
			this._cb_hidden(this.prevTab.tab);
		}

		//show new tab
		newTab.css({'display':'block'});
		newTab.addClass('njt-active-init');
		newTab[0].clientHeight;
		newTab.addClass(o.activeContent);
		
		setTimeout(function(){
			newTab.removeClass('njt-active-init');
			that._cb_shown(that.activeTab.tab);
		}, that._getMaxTransitionDuration(newTab[0]))



		setTimeout(function(){
			that.v.content.removeClass('njt-anim-'+that.o.anim);
			that._o.anim = false;

		}, Math.max(that._getMaxTransitionDuration(oldTab[0]), that._getMaxTransitionDuration(newTab[0])))//choose maximum transition time, because we can have different transition duration on show/hide elements

	} else {
		oldTab.removeClass('active').css('display','none');
		this._cb_hidden(this.prevTab.tab);
		newTab.addClass('active').css({'display':'block'})
		this._cb_shown(this.activeTab.tab)
	}
}

proto._cb_hide = function (el) {//cb - callback
	var $el = $(el);
	if($el.length) $el.trigger('njt_hide', [this]);
}
proto._cb_hidden = function (el) {
	var $el = $(el);
	if($el.length) $el.trigger('njt_hidden', [this]);
}
proto._cb_show = function (el) {
	var $el = $(el);
	if($el.length) $el.trigger('njt_show', [this]);
}
proto._cb_shown = function (el) {
	var $el = $(el);
	if($el.length) $el.trigger('njt_shown', [this]);
}





proto._gatherData = function (el) {
	var o = this.o,
		$el = $(el),
		dataO = el.data(),//original data
		dataMeta = {};

	for (var p in dataO) {//use only data properties with njt prefix
		if (dataO.hasOwnProperty(p) && /^njt[A-Z]+/.test(p) ) {
			var shortName = p.match(/^njt(.*)/)[1],
				shortNameLowerCase = shortName.charAt(0).toLowerCase() + shortName.slice(1);

			dataMeta[shortNameLowerCase] = checkval(dataO[p]);
		}
	}


	function checkval(val) {
		//make boolean from string
		if(val === 'true') {
			return true;
		} else if(val === 'false') {
			return false;
		} else {
			return val;
		}
	}

	//we can't redefine tabs options
	delete dataMeta.tabs;

	this.o = $.extend(this.o, dataMeta);
}

proto._getMaxTransitionDuration = function (el) {
	var el = $(el),
	    str,
	    arr;

	if(!$(el).length) return 0;

	str = el.css('transitionDuration');

	if (!str || str == undefined) str = '0s';
	
	arr = str.replace(/s/gi,'').split(', ');

	return Math.max.apply(Math, arr)*1000;
}


// data-njt-target to tabs
njTabs.defaults = {
	tabs:                   '.njTabs',//(selector) default tabs wrapper selector
	content:                '',//(selector) wrapper of content divs

	tabSelector:            'a',//(selector) default tabs selector
	presentation:           'li',//(selector) closest element for adding active class (for ul>li>a structure)

	start:                  false,//(number) index (start from 0) of tab that we should show after plugin init
	active:                 'active',//(classname),!space not allowed! classname of active tab
	activeContent:          'active',//(classname),!space not allowed! classname of active tab content
	not:                    '.not-tab',//(selector) elements with this class will not trigger (for example simple link among tabs)

	contentSelector:        'div',//(selector) selector of tabs content (used when no target at tabs)

	anim:                   false,//(false || string) name of animation (see animation section)
	triggerEvent:           'click',//(event) event for change slide

	contentClass:           'njTabs-el',//(classname) class that will be given to every tab content element (used for animations)

	makeRelative:           true,//(boolean) should we make content wrapper relative? if it has static position, of course
}
})(window, document);

//autobind
// $(document).on('DOMContentLoaded', function () {
// 	setTimeout(function(){
// 		$(njTabs.defaults.tabs).each(function () {
// 			njTabs({
// 				tabs: $(this)
// 			})
// 		})
// 	}, 50)//set minimal timeout for purpose, if user will set handler to events with using DOMContentLoaded
// })



//jQuery, j plugin
$.fn.njTabs = function( options ) {
	var args = arguments;

	if(!args.length) {//if we have no arguments at all
		if(this[0].njTabs) {//if tabs inited on this element, return instance
			return this[0].njTabs;
		} else {//if tabs not inited on this element, try to init(maybe we have data attributes)
			this.each(function () {
				var opts = $.extend({}, options);
				opts.tabs = $(this);
				njTabs(options);
			})
			return this[0].njTabs;
		}
	} else if(typeof options === 'string') {
		if(options[0] !== '_') {
			var returns;

			this.each(function () {
				var instance = this.njTabs;

				if (instance instanceof njTabs && typeof instance[options] === 'function') {
				    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
				}
			})
		} else {
			throw new Error('njTabs plugin does not permit private methods.');
		}

		return returns !== undefined ? returns : this;
	} else {//if we have arguments
		return this.each(function () {
			if(typeof options === 'object') {//we have options passed in arguments, init tabs with this options
				var opts = $.extend({}, options);
				opts.tabs = $(this);
				njTabs(options);
			} else if(typeof options === 'number') {//we have number in arguments, it is shortcut for .show(number) method
				if(this.njTabs) {
					this.njTabs.show(options);
				}
			}
		});
	}


	 



	 



};