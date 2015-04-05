  /*!
  * njTabs - v2.0
  * nejikrofl@gmail.com
  * Copyright (c) 2015 N.J.
 */
 ;(function(window, document, undefined){
'use strict';
var $ = window.jQuery || window.j;

if(!$) {
	throw new Error('njTabs\'s requires jQuery or "j" library (https://github.com/Nejik/j)')
	return false;
}


//constructor
window.njTabs = function(opts) {
	opts = opts || {};

	if(!(this instanceof njTabs)) {//when we call njTabs not as a contructor, make instance and call it
		return new njTabs(opts);
	}

	var o = this.o = $.extend(true, {}, njTabs.defaults, opts),
		that = this;

	this._o = {};//inner options

	this.activeTab = {};
	this.prevTab = {};

	this.active = null;

	this.v = {//object with cached variables
		tabsWrap: $(o.tabs)
	};
	if(!this.v.tabsWrap.length) return;

	//remember instance in element
	this.v.tabsWrap[0].njTabs = this;

	//gather option from data-attributes from element
	this._gatherData(this.v.tabsWrap);


	this.v.contentWrap = $($(o.content)[0]);
	if(!this.v.contentWrap.length) return;

	this.v.tabEls = this.v.tabsWrap.find(o.tabSelector);
	
	this.v.contentEls = this.v.contentWrap.find(o.contentSelector)
											.addClass(o.contentClass)
											.css({'display':'none'});

	this.v.tabsWrap.delegate(o.tabSelector, o.triggerEvent, function (e) {
		o.e = e;
		var target = e.target || e.srcElement;

		// if(!$(target).hasClass('no-tab')) {
			that.show(target);
			o.e.preventDefault()
		// }
	})

	this.show(true);
};
var njt = njTabs.prototype;

















njt.show = function (elem) {
	if(this._o.anim) return;

	var o = this.o,
		that = this,
		index,
		tab,
		tabContentSelector,
		tabContent;

	
	//update variables for case, if developer generate new tabs, we support adding tabs dynamically
	this.v.tabEls = this.v.tabsWrap.find(o.tabSelector);
	this.v.contentEls = this.v.contentWrap.find(o.contentSelector);

	//detect tab element
	if(typeof elem === 'number') {//set active tab via zero-based index

		if(elem < 0) {
			elem = 0;
		} else if(elem > this.v.tabEls.length - 1) {
			elem = this.v.tabEls.length - 1;
		}

		tab = $(this.v.tabEls[elem]);
	} else if(elem === true) {
		tab = this.v.tabsWrap.find('.active').find(o.tabSelector);

		if(!tab.length) tab = $(this.v.tabEls[0])//there is no tab matched as active
	} else {//not number and not boolean, means that it is dom element
		tab = $(elem).closest(o.tabSelector);
	}
	
	if(!tab.length) return;

	//set active class to link, or to nearest specified element
	if(o.presentation && o.presentation !== o.tabSelector) {
		this.v.tabEls.closest(o.presentation).removeClass('active')
		tab.closest(o.presentation).addClass('active')
	} else {
		this.v.tabEls.removeClass('active');
		tab.addClass('active');
	}

	//find index of current tab, among other tabs
	this.v.tabEls.each(function (i) {
		if(this === tab[0]) {
			index = i;
			return false;
		}
	})
	



	//find needed content element

	var href = function () {//check href
		var href = tab.attr('href');

		if(href !== '#' && href !== '#!' && !(/^(?:javascript)/i).test(href)) {//we check if href not fake attr
			return href;
		} else {
			return false;
		}
	}();
	tabContentSelector = href || tab.data('njtTarget') || index;



	if(typeof tabContentSelector === 'string') {
		tabContent = $(tabContentSelector);
	} else if(typeof tabContentSelector === 'number') {
		tabContent = $(this.v.contentEls[tabContentSelector]);
	}

	this.prevTab = this.activeTab;
	//remember info about current tab
	this.activeTab = {
		tab: tab[0],
		index: index,
		content: tabContent[0]
	}

	if(!tabContent.length) return;//if there is no tab content element, return
	if(this.active === index) return;//don't change slide if it is active slide

	this._changeSlide();

	this.active = index;
};






















njt._changeSlide = function () {
	var o = this.o,
		that = this,
		oldTab = $(this.prevTab.content),
		newTab = $(this.activeTab.content);


	$(this.activeTab.tab).trigger('njt_show', [this]);
	if($(this.prevTab.tab).length) $(this.prevTab.tab).trigger('njt_hide', [this]);

	if(typeof this.o.anim === 'string') {
		this._o.anim = true;//flag that shows animation in action, we can't change tabs, while previous animation not finished

		//make content wrapper relative, if it is not, used for animations
		if(o.anim && o.makeRelative && this.v.contentWrap.css('position') === 'static') {
			this.v.contentWrap.css('position', 'relative');
		}

		this.v.contentWrap.addClass('njt-anim-'+this.o.anim);

		//hide old tab
		oldTab.removeClass('active njt-active-init');
		oldTab.addClass('njt-hide-init');
		newTab[0].clientHeight;
		oldTab.addClass('njt-hide');

		if(that._getMaxTransitionDuration(oldTab[0])) {//if there is no transition duration, even with null setTimeout, "display none" applies after new content el apply "display block", and it flickers a little
			setTimeout(function(){
				oldTab.removeClass('njt-hide-init njt-hide').css('display','none');
				if($(that.prevTab.tab).length) $(that.prevTab.tab).trigger('njt_hidden', [that]);
			}, that._getMaxTransitionDuration(oldTab[0]))
		} else {
			oldTab.removeClass('njt-hide-init njt-hide').css('display','none');
		}
		




		//show new tab
		newTab.css({'display':'block'});
		newTab.addClass('njt-active-init');
		newTab[0].clientHeight;
		newTab.addClass('active');
		
		setTimeout(function(){
			newTab.removeClass('njt-active-init');
			$(that.activeTab.tab).trigger('njt_shown', [that]);
		}, that._getMaxTransitionDuration(newTab[0]))



		setTimeout(function(){
			that.v.contentWrap.removeClass('njt-anim-'+that.o.anim);
			that._o.anim = false;

		}, Math.max(that._getMaxTransitionDuration(oldTab[0]), that._getMaxTransitionDuration(newTab[0])))//choose maximum transition time, because we can have different transition duration on show/hide elements

	} else {
		oldTab.removeClass('active').css('display','none');
		if($(this.prevTab.tab).length) $(this.prevTab.tab).trigger('njt_hidden', [this]);
		newTab.addClass('active').css({'display':'block'})
	}
}

njt._gatherData = function (el) {
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

	this.o = $.extend(this.o, dataMeta);
}

njt._getMaxTransitionDuration = function (el) {
	var el = $(el),
	    str,
	    arr;

	if(!($(el).length)) return 0;

	str = el.css('transitionDuration');

	if (!str || str == undefined) str = '0s';
	
	arr = str.replace(/s/gi,'').split(', ');

	return Math.max.apply(Math, arr)*1000;
}

njTabs.defaults = {
	tabs:                   '.njTabs',//(selector) default tabs wrapper selector
	tabSelector:            'a',//(selector) default tabs selector
	presentation:           'li',//(selector) closest element for adding active class (for ul>li>a structure)

	contentSelector:        'div',//(selector) selector of tabs content (used when no target at tabs)

	anim:                   false,//(false || string) name of animation (see animation section)
	triggerEvent:           'click',//(event) event for change slide

	contentClass:           'njTabs-el',//(classname) class that will be given to every tab content element (used for animations)

	makeRelative:           true,//(boolean) should we make content wrapper relative? if it has static position, of course
}
})(window, document);





//autobind
$(document).on('DOMContentLoaded', function () {
	setTimeout(function(){
		$(njTabs.defaults.tabs).each(function () {
			njTabs({
				tabs: $(this)
			})
		})
	}, 20)//set minimal timeout for purpose, if user will set handler to events with using DOMContentLoaded
})



//jQuery, j plugin
$.fn.njTabs = function( options ) {
	
	return this.each(function () {
		if(typeof options === 'number') {
			if(this.njTabs) {
				this.njTabs.show(options);
			}
		} else {
			var opts = $.extend({}, options);
			opts.tabs = $(this);
			njTabs(options);
		}
	})

};