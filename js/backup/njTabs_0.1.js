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

	this.setActive(5);
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
	} else if(typeof elem === 'boolean') {
		$elem = this.v.tabsWrap.find('.active');
		tab = checkEl($elem);
	} else {
		tab = checkEl($elem);
	}
	if(!tab.length) tab = $(this.v.tabEls[0])//something goes wrong, select first tab as active



	console.log(tab[0])



	function checkEl(elem) {
		if(elem.is(o.tabSelector)) {
			return  elem;
		} else {
			return elem.closest(o.tabSelector);
		}
	}

	//  else {
	// 	if($elem.is(o.tabSelector)) {
	// 		tab = $elem;
	// 	} else {
	// 		tab = $elem.closest(o.tabSelector);
	// 	}
	// }
	// console.log(tab)
	// if(!$(el).length) el = $(this.v.triggerEls[0])//if we don't have any active class on tabs or index is wrong, select first tab

	

	

	


	
	// //detect tab element
	// if(typeof elem === 'number') {//set active tab via zero-based index
	// 	el = $(this.v.triggerEls[elem]);
	// }
	// if(!$(el).length) el = $(this.v.triggerEls[0])//if we don't have any active class on tabs or index is wrong, select first tab

	// console.log(el)
};
// njt.setActive = function (elem, first) {
// 	var o = this.o,
// 		el = elem,
// 		index,
// 		tab,
// 		tabContent;

// 	//detect tab element
// 	if(typeof elem === 'number') {//set active tab via zero-based index
// 		el = $(this.v.triggerEls[elem]);
// 	}
// 	if(!$(el).length) el = $(this.v.triggerEls[0])//if we don't have any active class on tabs or index is wrong, select first tab

// 	console.log(el)
// 	// //find tabActive El
// 	// if(o.tabActiveEl) {
// 	// 	tab = $(o.tabActiveEl);
// 	// } else {
// 	// 	tab = el;
// 	// }


// 	// // index = 
// 	// // tabContent
// 	// console.log(1)
// 	// if(first) {
		
// 	// } else {
		
// 	// }
	


// };

njt.setSettings = function () {
	
};



njTabs.defaults = {
	tabs:            '.njTabs',
	content:         '.njTabs-content',

	tabSelector:     'li',
	contentSelector: 'div',

	triggerOn:       'li',


	triggerEvent:    'click',
	tabClass:        'active',
	contentClass:    'content-active',
	
	// activeClassTo:   null,//find closest element and set active class to it
	tabActiveEl:     null,//(selector) selector of parent element, where we should add active tab class, and from this el we got tab index
	// contentActive:   null
}
})(window, document);