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

	this.v = {
		tabsWrap: $(o.tabs)
	};//object with cached variables

	//gather option from data-attributes from element
	this._gatherData(this.v.tabsWrap);


	this.v.contentWrap = $(o.content).first();
	if(!this.v.contentWrap.length) return;//don't do anything, if we have no container with content

	this.v.tabEls = this.v.tabsWrap.find(o.tabSelector);
	this.v.contentEls = this.v.contentWrap.find(o.contentSelector);


	this.v.tabsWrap.delegate(o.trigger, o.triggerEvent, function (e) {
		o.e = e;
		that.setActive(e.target || e.srcElement);

		// e.preventDefault();
	})

	this.setActive(true);
};
var njt = njTabs.prototype;

njt.setActive = function (elem) {
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

	//find index of current tab, among other tabs
	this.v.tabEls.each(function (i) {
		if(this === tab[0]) {
			index = i;
			return false;
		}
	})

	//select proper tab content element
	tabContent = $(this.v.contentEls[index]);
	if(!tabContent.length) return;//if there is no tab content element, return


	if(o.e) o.e.preventDefault();


	//set active class to active tab
	this.v.tabEls.removeClass(o.tabClass);
	tab.addClass(o.tabClass)

	//set active class to content el
	this.v.contentEls.removeClass(o.contentClass);
	tabContent.addClass(o.contentClass);


	//set instance in element
	this.v.tabsWrap[0].njTabs = this;
};

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


njTabs.defaults = {
	tabs:            '.njTabs',
	content:         '.njTabs-content',

	tabSelector:     'li',
	contentSelector: 'div',

	trigger:         'li',


	triggerEvent:    'click',
	tabClass:        'active',
	contentClass:    'active'
}
})(window, document);


//autobind
$(document).on('DOMContentLoaded', function () {

	$(njTabs.defaults.tabs).each(function () {
		new njTabs({
			tabs: $(this)
		})
	})

})