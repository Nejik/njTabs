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
		return new njTabs(opts)();
	}

	var o = this.o = $.extend(true, {}, njTabs.defaults, opts);

	var that = this;

	this.v = {//object with cached variables
		tabsWrap: $(o.tabs),
		contentWrap: $(o.content)
	}

	this.v.tabEls = this.v.tabsWrap.find(o.tabSelector);
	this.v.contentEls = this.v.contentWrap.find(o.contentSelector);


	this.v.tabsWrap.delegate(o.triggerOn, o.triggerEvent, function (e) {
		that.setActive(e.target || e.srcElement);

		e.preventDefault();
		return false;
	})

	this.setActive(true);
	// this.setActive(2, true);
};
var njt = njTabs.prototype;

njt.setActive = function (elem, first) {
	var o = this.o,
		$elem = $(elem),
		index,
		tab,
		tabContent;

	//update variables for case, if developer generate new tabs
	this.v.tabEls = this.v.tabsWrap.find(o.tabSelector);
	this.v.contentEls = this.v.contentWrap.find(o.contentSelector);


	//detect tab element
	if(typeof elem === 'number' && elem > 0) {//set active tab via zero-based index
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
	
	//set active class to active tab
	this.v.tabEls.removeClass(o.tabClass);
	tab.addClass(o.tabClass)

	//find index of current tab, among other tabs
	this.v.tabEls.each(function (i) {
		if(this === tab[0]) {
			index = i;
			return false;
		}
	})

	//select proper tab content element
	tabContent = $(this.v.contentEls[index]);

	//show proper tab content element
	this.v.contentEls.removeClass(o.contentClass);
	tabContent.addClass(o.contentClass);


	this.v.tabsWrap[0].njTabs = this;
};



njTabs.defaults = {
	tabs:            '.njTabs',
	// content:         '.njTabs-content',

	tabSelector:     'li',
	contentSelector: 'div',

	triggerOn:       'li',


	triggerEvent:    'click',
	tabClass:        'active',
	contentClass:    'active',
	
	// activeClassTo:   null,//find closest element and set active class to it
	tabActiveEl:     null,//(selector) selector of parent element, where we should add active tab class, and from this el we got tab index
	// contentActive:   null
}
})(window, document);