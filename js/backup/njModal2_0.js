  /*!
  * njModal - v2.0
  * nejikrofl@gmail.com
  * Copyright (c) 2014 N.J.
 */
;(function(window, document, undefined){
'use strict';
var $ = window.jQuery || window.j;
if(!$) return false;

//constructor
window.njModal = function(opts) {
	opts = opts || {};

	if(!(this instanceof njModal)) {//when we call njModal not as a contructor, make instance and call it
		return new njModal(opts).show();
	}

	var o = this.o = $.extend(true, {}, njModal.defaults, opts);

	if(o.e) {
		o.elem = o.e.target || o.e.srcElement;
		o.$elem = $(o.elem);
	}

	o.that = this;

	this._o = {//internal info
		// status: 'idle'
	};

	this.v = {//cached elements
		w: $(window),
		d: $(document),
		h: $('html'),
		b: $('body')
	};

	this.v.prependTo = $(o.prependTo);
};


njModal.g = {};//global info for all instances
njModal.instances = {length:0};//we make array like object with all active instances of plugin
njModal.instances = {length:0};//we make array like object with all active instances of plugin

njModal.last = function () {//public function that returns last instance of popup
	return njModal.instances[njModal.instances.length - 1];
}

njModal.hideLast = function (status) {//public function that close last instance of popup
	if(njModal.instances.length) njModal.instances[njModal.instances.length - 1].hide(status || 'hideLast');
}
var njm = njModal.prototype;
njm.getLast = njModal.getLast;//just shortcut
njm.hideLast = njModal.hideLast;//just shortcut

njm.setSettings = function (opts,init) {
	if(!opts) return;

	var o = this.o;

	if(opts.content) o.type = null;//reset old type, because of new content

	if(opts.e) {
		o.elem = o.e.target || o.e.srcElement;
		o.$elem = $(o.elem);
	}

	//delete some options only if is custom function call, not call from show method
	if(!init) {
		//settings that cannot be overriden via this method
		var deleteOpts = ['position','modal','prependTo','hideScrollbar']
		for (var i = 0, l = deleteOpts.length; i < l ;i++) {
			delete opts[deleteOpts[i]]
		}
	}
	

	this.o = $.extend(true, this.o, opts);

	return this;
};

njm.show = function (opts) {
	if(typeof opts === 'object') {
		this.setSettings(opts, true);
	}

	if(this._cb_start() === false) return;

	var o = this.o,
		that = this;

	//stop default link click behavior, if we clicked on "a" element
	if(o.e) {
		o.e.preventDefault ? o.e.preventDefault() : (o.e.returnValue=false);//for normal browsers and ie <9
	}

	this.v.prependTo = $(o.prependTo);


	// if(o.position === 'fixed' && (this.v.prependTo[0] !== this.v.b[0])) {
	// 	o.position = 'absolute_inner'
	// }

	// if(o.position === 'absolute_inner') {
	// 	this.v.h.addClass('njm_absolute');
	// 	// o.hideScrollbar = false;
	// }


	if(o.modal) {
		o.outside = false;
		o.close = false;
	}
	//\finish init settings


	//get document width/height, window width/height for absolute positioning
	this._getEnvironmentValues();

	//show overlay
	if(o.overlay) {
		this._overlay('show');
	}
	// return;

	//should be before inserting overlay
	if (o.hideScrollbar) {
		this._scrollbar('hide');
	}
	
	//create popup markup
	this.v.container = $('<div class="njm_container">\
							<div class="njm_table">\
								<div class="njm_cell">\
									<div class="njm_content" tabindex="-1"></div>\
								</div>\
							</div>\
						 </div>');

	this.v.table = this.v.container.find('.njm_table');
	this.v.cell = this.v.container.find('.njm_cell');
	this.v.content = this.v.container.find('.njm_content');
	this.v.prependTo.append(this.v.container);



	//insert content(first slide)
	this.setActive(o);

	//remember instance id in this set, for deleting it when close (todo)
	this._o.instanceID = njModal.instances.length;
	//write instance to global set of all instances
	this._push(njModal.instances, this);
	return this;
};








njm.setActive = function (opts) {//slide - slide opts
	if(!opts) opts = this.o;

	if(this.slide) this.prevSlide = this.slide;

	this.slide = this._normalizeOptions(opts);
	this.slide.div = $('<div class="njm"></div>');

	switch(this.slide.type) {
	case 'ajax':
		// if (this._getContent_ajax()) this._insertContent__ajax();
	break;
	case 'function':
		// if (this._insertContent__function) this._insertContent__function();
	break;
	default:
		this._getContent();
	break;
	}
	
}


njm._normalizeOptions = function (initOpts) {
	initOpts = initOpts || {};

	var o = this.o,
		slideOpts = {};

	slideOpts.content = initOpts.content;

	//set type
	slideOpts.type = initOpts.type;
	if(!slideOpts.type || slideOpts.type == 'auto') slideOpts.type = this._type(slideOpts.content);//detect content type

	return slideOpts;
}

njm._type = function (content) {//detect content type
	if(typeof content === 'object') {
		if((window.jQuery && content instanceof window.jQuery) || (window.j && content instanceof window.j)) {
			return 'jQuery';
		}
	} else if(typeof content === 'string') {
		content = content.trim();
		if (content.charAt(0) === "<" && content.charAt( content.length - 1 ) === ">" && content.length >= 3 ) {// Assume that strings that start and end with <> are HTML
			return 'html';
		} else if(content.charAt(0) === "." || content.charAt(0) === "#" && content.length >= 2) {
			return 'selector';
		} else {
			return 'string';
		}
	} else {
		return 'html';
	}
};










njm._getContent = function (opts) {
	var o = this.o,
		that = this,
		content = this.slide.content,
		place = this.slide.div;


	switch(this.slide.type) {
	case 'jQuery':
		jQueryInsert();
	break;
	
	case 'selector':
		jQueryInsert();
	break;

	case 'html':
		place.html(content);
	break;

	case 'string':
		place.text(content);
	break;
	}

	function jQueryInsert() {
		content = $(content).css('display','block');
		place.append(content);
	}

	this._insertSlideToPage();
}

njm._insertSlideToPage = function (slide) {
	var o = this.o;

	//todo
	// if(o.position === 'absolute_inner') {
	// 	this._setPosition(index);
	// }


	this.v.content.append(this.slide.div);
	this._cb_beforeShow();
};













njm.hide = function () {
	
};




















































njm._scrollbar = function (type) {
	var o = this.o;
	switch(type) {
	case 'hide':
		if(this.v.prependTo[0] === this.v.b[0]) {
			var sb = (document.documentElement.scrollHeight || document.body.scrollHeight) > document.documentElement.clientHeight;//check for scrollbar existance

			//don't add padding to html tag if no scrollbar (simple short page) or popup already opened
			if(!this.v.h.hasClass('njm_hideScrollbar') && (sb || this.v.h.css('overflowY') === 'scroll' || this.v.b.css('overflowY') === 'scroll')) {
				this.v.h.css('paddingRight', parseInt(this.v.h.css('paddingRight')) + njModal.g.scrollbarSize + 'px');
			}
			this.v.h.addClass('njm_hideScrollbar');
		} else {
			this.v.prependTo.addClass('njm_hideScrollbar');
		}
	break;

	case 'show':
		if(thi(s.v.prependTo[0] === this.v.b[0]) && o.v.h.hasClass('njm_hideScrollbar')) {
				this.v.h.css('paddingRight', parseInt(this.v.h.css('paddingRight')) - njModal.g.scrollbarSize + 'px');
				this.v.h.removeClass('njm_hideScrollbar');
		} else {
			if(this.v.prependTo.hasClass('njm_hideScrollbar')) {
				this.v.prependTo.removeClass('njm_hideScrollbar');
			}
		}
	break;
	}	
};

njm._overlay = function (type) {
	var o = this.o,
		that = this;

	switch(type) {
	case 'show':
		this.v.overlay = $('<div class="njm_overlay"></div>');
		//insert overlay div
		this.v.prependTo.append(this.v.overlay);
		this.v.overlay[0].clientHeight;
		setTimeout(function(){//i don't know why, but this prevent page from scrolling in chrome while background transition is working..
			that.v.overlay.addClass('visible');
		}, 0)

		

		if(o.position === 'absolute_inner') this.v.overlay.css('height', (this._o.elHeight || this._o.docHeight)+'px').css('width', (this._o.elWidth || this._o.docWidth)+'px')
	break;

	case 'hide':
		if(!this._o.overlayVisible) return;
		this.v.overlay.remove();
		this._o.overlayVisible = false;
	break;
	}
}

njm._init = function () {
	//calculate scrollbar width
	var scrollDiv = document.createElement("div");
	scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -99px;';
	document.body.appendChild(scrollDiv);
	njModal.g.scrollbarSize = (scrollDiv.offsetWidth - scrollDiv.clientWidth) || 0;
	document.body.removeChild(scrollDiv);
	//end calculate scrollbar width



	//-------------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------------



	//trim polyfill
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, ''); 
	  }
	}



	//-------------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------------------



	//detect css3 support
	var	h = njModal.g;

	h.transition = styleSupport('transition');
	h.transitionDuration = styleSupport('transitionDuration');
	h.transform = styleSupport('transform');
	h.animation = styleSupport('animation');

	function styleSupport(prop) {
		var vendorProp, supportedProp,
			prefix,	prefixes = ["Webkit", "Moz", "O", "ms"],
			capProp = prop.charAt(0).toUpperCase() + prop.slice(1),// Capitalize first character of the prop to test vendor prefix
			div = document.createElement("div");

			document.body.insertBefore(div, null);

		if (prop in div.style) {
			supportedProp = prop;// Browser supports standard CSS property name
			prefix = null;
		} else {
			for (var i = 0; i < prefixes.length; i++) {// Otherwise test support for vendor-prefixed property names
				vendorProp = prefixes[i] + capProp;

				if (vendorProp in div.style) {
					prefix = prefixes[i];
					break;
				} else {
					vendorProp = undefined;
				}

			}
		}

		var support = {
			js:  supportedProp || vendorProp,
			css: writePrefixes(prop, prefix)
		}
		
		if(prop === 'transform') {//detect transform3d
			if(div.style[support.js] !== undefined) {
				div.style[support.js] =  "translate3d(1px,1px,1px)";
				var has3d = window.getComputedStyle(div)[support.js];
			}
			support['3d'] = (has3d !== undefined && has3d.length > 0 && has3d !== "none");
		}

		document.body.removeChild(div);
		return support;
	}

	function writePrefixes(prop, prefix) {
		if(prefix === null) {
			return prop;
		}

		switch(prefix) {
		case 'Webkit':
			return '-webkit-' + prop;
		break;
		case 'Moz':
			return '-moz-' + prop;
		break;					
		case 'ms':
			return '-ms-' + prop;
		break;
		case 'O':
			return '-o-' + prop;
		break;
		}
	}
	//end of CSS3 support
	if(!h.animation.js) $('html').addClass('no-animation');
};
njm._init();





























njm._getEnvironmentValues = function () {
	var o = this.o,
		that = this;

	this._o.scrollTop = this.v.w.scrollTop();

	//height of document
	this._o.docHeight = Math.max(
								 window.innerHeight, (
													  document.body.clientHeight
													  + parseInt(this.v.b.css('marginTop'))
													  + parseInt(this.v.b.css('marginBottom'))
													  + parseInt(this.v.b.css('paddingTop'))
													  + parseInt(this.v.b.css('paddingBottom'))
													  )
								 );

	//width of document
	this._o.docWidth = Math.max(window.innerWidth - njModal.g.scrollbarSize, document.body.scrollWidth);


	//window sizes
	this._o.winWidth = window.innerWidth;
	this._o.winHeight = window.innerHeight;


	//also if we insert popup into custom element, calculate element's width/height/scrolltop
	if(this.v.prependTo[0] !== this.v.b[0]) {
		this._o.elWidth = this.v.prependTo[0].scrollWidth;
		this._o.elHeight = this.v.prependTo[0].scrollHeight;
		this._o.elScrollTop = this.v.prependTo.scrollTop();
		this._o.elScrollLeft = this.v.prependTo.scrollLeft();

	}
};

njm._push = function (obj, el) {
	Array.prototype.push.call(obj, el);
}

njm._getMaxTransitionDuration = function (el) {
	var el = $(el),
		str,
		arr;

	if(!($(el).length) || !njModal.g.transitionDuration.css) return 0;

	str = el.css(njModal.g.transitionDuration.css);

	if (!str || str == undefined) str = '0s';
	
	arr = str.replace(/s/gi,'').split(', ');

	return Math.max.apply(Math, arr)*1000;
};























njm._cb_start = function () {
	var o = this.o;

	this.v.d.triggerHandler('njm_start', [this]);

	if (o.$elem) {o.$elem.triggerHandler('njm_start', [this])};
	if(o.onStart && o.onStart.call(this) === false) return false;
};

njm._cb_beforeShow = function () {
	var o = this.o,
		that = this,
		callBackResult;

	//set close button
	if(o.close) {
		this.v.close = $('<a href="#!" class="njm_close njm_closeSystem"></a>');

		if(o.close === 'outside') {
			// this.v.cell.append(this.v.close);
			this.v.container.append(this.v.close);
		} else if(o.close === 'inside') {
			this.v.content.append(this.v.close);
		}
	}

	
	this.v.d.triggerHandler('njm_beforeShow', [this]);
	if (o.$elem) {o.$elem.triggerHandler('njm_beforeShow', [this])};
	if(o.onBeforeShow) callBackResult = o.onBeforeShow.call(this);
	
	if(callBackResult !== false) {
		if(o.anim_show) {
			this.v.content.addClass('njm_'+o.anim_show+'_init');
			this.v.content[0].clientHeight;
			this.v.content.addClass('njm_'+o.anim_show);
		}
	}

	//detect maximum transition time on slide element
	if(!o.show_delay) o.show_delay = this._getMaxTransitionDuration(this.v.content[0]);


	setTimeout(function(){
		that._cb_afterShow();
	}, o.show_delay)
};

njm._cb_afterShow = function () {
	var o = this.o,
		forFocus;

	this.v.content.focus();//focus to modal container, to prevent issues with focus on clicked element under popup

	//focus elements after popup shown
	if(typeof o.focus === 'string') {
		forFocus = this.slide.div.find(o.focus);
	} else if((window.jQuery && o.focus instanceof window.jQuery) || (window.j && o.focus instanceof window.j)) {
		forFocus = o.focus;
	}
	forFocus.not(o.focus_not).focus();

	//todo
	// this.v.prependTo[0].scrollTop = this._o.scrollTop;//fix for firefox when position absolute;

	this.v.d.triggerHandler('njm_afterShow', [this]);
	if (o.$elem) {o.$elem.triggerHandler('njm_afterShow', [this])};
	if(o.onAfterShow) o.onAfterShow.call(this);
};

njModal.defaults = {
	//global options
	prependTo              : 'body',//(jQuery selector) where we should insert popup
	position               : 'fixed',//(fixed/absolute)
	overlay                : true,//we need overlay?
	outside                : true,//close popup on click outside popup?
	modal                  : false,//just shortcut for outside: false and hide close button
	hideScrollbar          : true,//we need hide scrollbar?
	close                  : 'inside',//(inside || outside || boolean false) add close button inside or outside popup or don't add at all

	//headerGlobal
	//footerGlobal

	content                : 'njModal plugin: meow, put some content here...',//default content
	// type                : undefined,//type of main content. Plugin use autodetect of content type, but if you want specify it manually use one of this values: jQuery, selector, ajax, hmtl, string, function, iframe, embed. If you want emulate standart dialog types like "alert, prompt, confirm", use this types, they not included in autodetect and can be specified only manual(in this case use "content" option to define dialog string)
	// header              : null,//(string || inherit) content of header part, plugin uses .html() method to insert
	// footer              : null,//(string || inherit) content of footer part, plugin uses .html() method to insert
	// inheritHeader          : false,//need we inherit header to all slides?
	// inheritFooter          : false,//need we inherit footer to all slides?
	// titleAttr              : 'title',//(string) attribute from which plugin takes slide title
	// title                  : null,//title for first slide



	// data                   : '.njmData',//(boolean false || css selector) closest element from which we should gather data properties(used for galleries, when we want to use data attributes for popup control), all options gathered, except: content, type, header, footer, title, because this is slide individual properties

	//gallery options
	// galleryAttr            : 'rel',//(rel || data-*) for example data-gallery
	// galleryWrap            : '.njmGallery',//(boolean false || css selector)
	// start                  : 0,//(number)slide number, from which we should start

	anim_show              : 'scale',//show animation name
	// anim_hide           : '',// for default it uses show_anim name. If show_animation is function ot hide_animation with name as show_animation not exist, use for default "scale" for browsers that support transition and "fadejQuery" for others.
	// show_delay             : '',//(ms)time for show animation
	// hide_delay             : '',//(ms)time for hide animation


	// autoheightImg          : true,//fit modal to screen height with image
	// autoheightContent      : false,//fit modal to screen height with content
	
	// ajaxHandler            : '',//(function)//function, that can be used to process ajax request
	//not used // ajaxType               : null,//(string) set type of content, that returns from server
	// abort                  : true,//(boolean) can we abort loading ajax while click on loading spinner?

	focus                  : 'input, select, textarea, button, a',//(boolean, selector) if true - focus on first (input, select, textarea, button, a) element after popup show or use jQuery selector to focus targeted element after popup is opened, if boolean false, no autofocus at all
	focus_not              : '.njm_closeSystem',//(jQuery selector) what elements we not focus while autofocus

	esc                    : true,//close popup when esc button pressed
	// enter                  : true,//(only with dialog buttons) submit action when keyboard enter pressed

	// preloader              : true, //show preloader when ajax/images loading?
	// cancelRequest          : true,//cancel ajax request or image download when preloader clicked
	// timeout                : 20000000,//ajax timeout setting
	// responsiveVideo        : true,//should we make videos reponsive?
		

	text                   : {
		close                   : 'Close popup',//close button title
		prev                    : 'Previous slide',//prev slide button title
		next                    : 'Next slide',//next slide button title
		titlePreloader          : 'Loading...',//title on preloader
		ok                      : 'ok',//text on 'ok' button when dialog modal(alert,prompt,confirm)
		cancel                  : 'cancel',//text on 'cancel' button when dialog modal(alert,prompt,confirm)

		ajaxError               : 'Smth goes wrong, ajax failed or ajax timeout (:',//text when ajax failed
		imageError              : '<a href="%url%">This image</a> can not be loaded.',
		tplError                : 'There is no such type - %type%'
	},

	// tpl                         : {
	// 	'alert'  : '<div class="njm_header">%content%</div><div class="njm_footer"><button class="njm_ok">ok</button></div>',
	// 	'confirm':'<div class="njm_header">%content%</div><div class="njm_footer"><button class="njm_ok">ok</button><button class="njm_cancel">cancel</button></div>',
	// 	'prompt' :'<div class="njm_header">%content%</div><input type="text" placeholder="" /><div class="njm_footer"><button class="njm_ok">ok</button><button class="njm_cancel">cancel</button></div>'
	// },
	// placeholder            : '',//input placeholder for prompt type


	// rel                    : 'rel',//attribute from which collect relative items for gallery
	
	//callbacks
	// onStart                : function(){},//callback
	// onAfterLoad            : function(){},//callback after loading content
	// onBeforeShow           : function(){},
	// onAfterShow            : function(){},//callback when modal show animations ends
	// onBeforeClose          : function(){},//callback before modal closed
	// onClose                : function(){},//callback when modal close animation ends
	// onAllClose             : function(){},//callback when all modals closed

	// onDialog               : function(){},//callback when ok/cancel buttons clicked(buttons with classes njModal_ok, njModal_cancel), and esc/enter when dialog mode(alert,prompt,confirm)
	// onOk                   : function(){},//callback when ok button(button with class njmodal_ok) clicked or enter in dialog mode(alert,prompt,confirm)
	// onCancel               : function(){}//callback when cancel button(button with class njmodal_cancel) clicked or esc in dialog mode(alert,prompt,confirm)
}
})(window, document);