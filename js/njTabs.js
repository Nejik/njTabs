  /*!
  * njTabs - v0.1
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

	var o = this.o = $.extend(true, {}, njTabs.defaults, opts);

	var that = this;


	this.v = {
		tabsWrap: $(o.tabs)
	};//object with cached variables

	//gather option from data-attributes from element
	this._gatherData(this.v.tabsWrap);


	this.v.contentWrap = $(o.content).first();
	


	if(!this.v.contentWrap.length) return;//don't do anything, if we have no container with content

	if(o.makeRelative && this.v.contentWrap.css('position') == 'static') {
		this.v.contentWrap.css('position', 'relative');
	}

	this.v.tabEls = this.v.tabsWrap.find(o.tabSelector);
	this.v.contentEls = this.v.contentWrap.find(o.contentSelector);
	this.v.contentEls.addClass(o.contentClass).css({'display':'none'});


	this.v.tabsWrap.delegate(o.trigger, o.triggerEvent, function (e) {
		o.e = e;
		var target = e.target || e.srcElement;
		that.setActive(target);

		if(!$(target).hasClass('not-tab')) o.e.preventDefault();
	})


	this.setActive(true);
};
var njt = njTabs.prototype;

















njt.setActive = function (elem) {
	if(this.anim) return;
	var o = this.o,
		that = this,
		$elem = $(elem),
		index,
		tab,
		tabContent;

	

	//update variables for case, if developer generate new tabs
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
		$elem = this.v.tabsWrap.find('.active');
		tab = checkEl($elem);
	} else {
		tab = checkEl($elem);
	}

	if(!tab.length) tab = $(this.v.tabEls[0])//something goes wrong and we can't detect active tab, select first tab as active

	function checkEl(elem) {
		if(elem.is(o.tabSelector)) {
			return  elem;
		} else {
			return elem.closest(o.tabSelector);
		}
	}

	//find index of current tab, among other tabs
	this.v.tabEls.each(function (i) {
		if(this === tab[0]) {
			index = i;
			return false;
		}
	})

	//select proper tab content element
	tabContent = $(this.v.contentEls[index]);
	// if(!tabContent.length) return;//if there is no tab content element, return

	if(this.active === index) return;//don't change slide if it is active slide
	


	
	//set active class to active tab
	this.v.tabEls.removeClass(o.activeTabClass);
	tab.addClass(o.activeTabClass);

	//anim function
	// if(typeof o.anim === 'function') {
	// 	o.anim.call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);
	// } else if(typeof o.anim === 'string' && typeof njTabs.anim[o.anim] === 'function') {
	// 	njTabs.anim[o.anim].call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);
	// } else {
	// 	njTabs.anim[njTabs.defaults.anim].call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);
	// }
	// njTabs.anim[o.anim].call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);

	this._changeSlide(this.v.contentEls[this.active], tabContent[0], this.active, index);

	this.active = index;


	//remember instance in element
	this.v.tabsWrap[0].njTabs = this;
};





njt._changeSlide = function (oldTab, newTab, oldIndex, newIndex) {
	var o = this.o,
		that = this,
		$oldTab = $(oldTab),
		$newTab = $(newTab);


	if(typeof this.o.anim === 'string') {
		this.anim = true;//flag that shows animation in action, we can't change tabs, while previous animation not finished
		this.v.contentWrap.addClass('njt-anim-'+this.o.anim);

		//hide old tab
		$oldTab.removeClass('active njt-active-init');
		$oldTab.addClass('njt-hide-init');
		newTab.clientHeight;
		$oldTab.addClass('njt-hide');

		if(that._getMaxTransitionDuration(oldTab)) {//if there is no transition duration, even with null setTimeout, "display none" applies after new content el apply "display block", and it flickers a little
			setTimeout(function(){
				$oldTab.removeClass('njt-hide-init njt-hide').css('display','none');
			}, that._getMaxTransitionDuration(oldTab))
		} else {
			$oldTab.removeClass('njt-hide-init njt-hide').css('display','none');
		}
		




		//show new tab
		newTab.clientHeight;
		$newTab.css({'display':'block'});
		$newTab.addClass('njt-active-init');
		newTab.clientHeight;
		$newTab.addClass('active');
		
		setTimeout(function(){
			$newTab.removeClass('njt-active-init');
		}, that._getMaxTransitionDuration(newTab))



		setTimeout(function(){
			that.v.contentWrap.removeClass('njt-anim-'+that.o.anim);
			that.anim = false;
		}, Math.max(that._getMaxTransitionDuration(oldTab), that._getMaxTransitionDuration(newTab)))//choose maximum transition time, because we can have different transition duration on show/hide elements

	} else {
		$oldTab.removeClass('active').css('display','none');
		$newTab.addClass('active').css({'display':'block'})
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

			dataMeta[shortNameLowerCase] = dataO[p];
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
	tabs:                   '.njTabs',

	tabSelector:            'li',
	contentSelector:        'div',

	anim:                   false,
	trigger:                'li',
	triggerEvent:           'click',

	activeTabClass:         'active',
	activeContentClass:     'active',

	contentClass:           'njt-el',//class that will be given to every tab content element
	makeRelative:    true//should we make content wrapper relative? if it has static position, of course
}
})(window, document);


//autobind
$(document).on('DOMContentLoaded', function () {
	$(njTabs.defaults.tabs).each(function () {
		njTabs({
			tabs: $(this)
		})
	})
})