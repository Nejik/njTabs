(function () {
	//you can't create elements with this function
	window.j = function(selector) {
		selector = selector || '';
		return new j.fn.init(selector);
	};
	if(!window.$) window.$ = window.j;

	j.match = function (el, selector) {
		var matchesSelector = el.matches 
				|| el.matchesSelector
				|| el.oMatchesSelector 
				|| el.mozMatchesSelector 
				|| el.webkitMatchesSelector 
				|| el.msMatchesSelector;

		return matchesSelector.call(el, selector);
	}

	j.fn = j.prototype;

	j.fn.init = function (selector) {
		var query;
		if(typeof selector === 'string' && selector.length > 0) {
			//detect html input
			if(selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">") {
				(j.str2dom) ? query = j.str2dom(selector) : query = [];
			} else {
				query = document.querySelectorAll(selector);
			}
		} else if(selector instanceof Array || selector instanceof NodeList || selector instanceof HTMLCollection || (selector.j && !selector.window)) {
			query = selector;
		} else if((window.Node && selector instanceof Node) || selector == selector.window) {
			query = [selector];
		} else {
			query = [];
		}

		//save selector length
		this.length = query.length;
		this.j = true;//flag shows that this is j collection

		for (var i = 0, l = this.length; i < l ;i++) {
			this[i] = query[i];
		}
		
		// Return as object
		return this;
	}
	j.fn.init.prototype = j.fn;//maked for using instenceOf operator(example: j('#test') instanceOf j)


	j.fn.each = function (callback) {
		for (var i = 0, l = this.length; i < l ;i++) {
			if (callback.call(this[i], i, this[i]) === false) break;
		}
		return this;
	}
}());


/////////////////////////////////////////////////////////////////////////
//methods that can be removed
/////////////////////////////////////////////////////////////////////////



//extend function from jQuery
j.isArray = function(a){return j.type(a)==="array"};
j.isFunction = function(a){return j.type(a)=="function"};
j.isPlainObject = function(f){var b,c={},a={}.hasOwnProperty;if(!f||j.type(f)!=="object"||f.nodeType||j.isWindow(f)){return false}try{if(f.constructor&&!a.call(f,"constructor")&&!a.call(f.constructor.prototype,"isPrototypeOf")){return false}}catch(d){return false}if(c.ownLast){for(b in f){return a.call(f,b)}}for(b in f){}return b===undefined||a.call(f,b)};
j.isWindow = function(a){return a!=null&&a==a.window};
j.type = function(c){var a=a={"[object Array]":"array","[object Boolean]":"boolean","[object Date]":"date","[object Error]":"error","[object Function]":"function","[object Number]":"number","[object Object]":"object","[object RegExp]":"regexp","[object String]":"string"},b=a.toString;if(c==null){return c+""}return typeof c==="object"||typeof c==="function"?a[b.call(c)]||"object":typeof c};

j.extend = function(){//for extend function we need: j.isArray, j.isFunction, j.isPlainObject, j.isWindow, j.type
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !j.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( j.isPlainObject(copy) || (copyIsArray = j.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && j.isArray(src) ? src : [];

					} else {
						clone = src && j.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = j.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


j.fn.attr = function (name, value) {
	if(typeof name === 'object') {
		return this.each(function () {
			for (var key in name) {
				this.setAttribute(key, name[key]);
			}
		})
	} else {
		if(value) {
			return this.each(function () {
				this.setAttribute(name, value);
			});
		} else {
			return this[0].getAttribute(name) || undefined;
		}
	}
}

//Get the value of a style property for the first element in the set of matched elements or set one CSS property for every matched element.
j.fn.css = function (prop, value) {
	if(typeof prop === 'object') {
		return this.each(function () {
			for (var key in prop) {
				this.style[key] = prop[key];
			}
		})
	} else {
		if(value) {
			return this.each(function () {
				this.style[prop] = value;
			});
		} else {
			// r = (window.getComputedStyle ? getComputedStyle(this, '')[prop] : this.currentStyle[prop]) || undefined;
			return getComputedStyle(this[0], null)[prop] || undefined;
		}
	}
}

//Get the descendants of each element in the current set of matched elements
j.fn.find = function (selector) {
	var newArray = [],
		tq;//temporary query

	this.each(function (i) {
		tq = Array.prototype.slice.call(this.querySelectorAll(selector),'')
		if(tq.length) {
			newArray = newArray.concat(tq);
		}
	})
	return j(newArray);
}

//el sholud be dom element
j.inArray = function (arr, el) {
	if(!el) return this;

	for (var i = 0, l = arr.length; i < l ;i++) {
		if(arr[i] === el) {
			return i;
			break
		}
	}
	return -1;
}
//for closest method we need j.inArray
j.fn.closest = function (selector) {
	var closestArr = [],
		parent;

	for (var i = 0, l = this.length; i < l ;i++) {
		if(j.match(this[i], selector)) {
			closestArr.push(this[i])
		} else {
			parent = this[i].parentNode;

			while( parent.tagName !== 'HTML') {
				if(j.match(parent, selector) && j.inArray(closestArr, parent) === -1) closestArr.push(parent);
				parent = parent.parentNode;
			}

		}
	}

	return j(closestArr);
}


















//data methods
//Store arbitrary data associated with the matched elements or return the value at the named data store for the first element in the set of matched elements.
j._toDashed = function (str) {
	return str.replace(/([A-Z])/g, function(u) {
		return "-" + u.toLowerCase();
	});
}
j._toCamel = function (str) {
	return str.replace(/-+(.)?/g, function(match, chr){ 
		return chr ? chr.toUpperCase() : '' 
	})
}
//need methods: j._toDashed, j._toCamel
j.fn.data = function (name, value) {
	var mode,
		r = this,
		elem = document.createElement('div'),
		dataSupport;

	if(!name && !value) {
		mode = false
	} else if(value) {
		mode = 'set'
		name = j._toCamel(name);
	} else if(name) {
		mode = 'get'
		name = j._toCamel(name);
	} 

	

	elem.setAttribute("data-a-b", "c");
	dataSupport = !!(elem.dataset && elem.dataset.aB === "c");

	//return all data attributes
	if(!mode) {
		var atr = {};
		if(dataSupport) {
			atr = this[0].dataset;
		} else {
			var atributes = this[0].attributes;
			for (var i = 0, l = atributes.length; i < l ;i++) {
				if(/^data-/.test(atributes[i].name)) {
					atr[j._toCamel(atributes[i].name.replace(/data\-/,''))] = atributes[i].value;
					
				}
			}
		}
		return atr;
	}


	if (dataSupport) {
		if(mode === 'set') {
			this.each(function () {
				this.dataset[name] = value;
			})
		} else {
			r = this[0].dataset[name];
		}

		//remove
		// delete node.dataset[name];
	} else {
		if(mode === 'set') {
			this.each(function () {
				this.setAttribute('data-' + j._toDashed(name), value);
			})
		} else {
			r = this[0].getAttribute('data-' + j._toDashed(name));
		}
	}
	return r;
}




j.fn.addClass = function (classes) {
	var classListExist = !!('classList' in document.createElement('p'))
	var arr = classes.split(' ');

	if(classListExist) {
		this.each(function() {
			for (var i = 0, l = arr.length; i < l ;i++) {
				this.classList.add(arr[i]);
			}
		});
	} else {//for ie9
		this.each(function () {
			for (var i = 0, l = arr.length; i < l ;i++) {
				this.className += ' '+arr[i];
			}
		})
	}
	return this;
}

j.fn.removeClass = function (classes) {
	var classListExist = !!('classList' in document.createElement('p'));
	var arr = classes.split(' ');
	var origClasses;

	if(classListExist) {
		this.each(function(i) {
			for (var i = 0, l = arr.length; i < l ;i++) {
				this.classList.remove(arr[i]);
			}
		});
	} else {//for ie9
		this.each(function () {
			origClasses = this.className;
			
			for (var i = 0, l = arr.length; i < l ;i++) {
				origClasses = origClasses.replace(new RegExp(' ?'+ arr[i]), '')
			}
			this.className = origClasses;
		})
	}
	
	return this;
}











j.fn.on = function (type, fn) {
	return this.each(function () {
		
		var obj = {
			handleEvent: function (e) {
				e = e || window.event;
				var args;

				if(e.data && e.data.length) {
					args = e.data.slice(0)
					args.unshift(e);
				} else {
					args = [e];
				}

				
				fn.handler = obj;
				fn.apply(e.target, args);
			}
		}

		this.addEventListener( type, obj, false );
	})
}

j.fn.delegate = function (selector, event, fn) {
	return this.each(function (i) {
		var parent = this;

		$(this).on(event, function (e) {
			var target = e && e.target || window.event.srcElement;

			//normalize
			if(!e.path) {
				e.path = [];
				var node = e.target;
				while(node != document) {//check for sdocument - fix for chrome, as he uses native path that contain document el
					e.path.push(node);
					node = node.parentNode;
				}
			}

			for (var i = 0, l = e.path.length; i < l ;i++) {
				if(e.path[i] === parent) break;//don't check all dom
				if(e.path[i] !== document && j.match(e.path[i], selector)) {
					fn.call(e.path[i], e);
					break;//if we fins neede el, don't need to check all other dom elements
				}
			}

			// if(j.match(target,selector)) {
			// 	fn.call(target, e);
			// }
		})

	})
}

j.fn.trigger = function (type, data) {
	return this.each(function (i) {
		var event = document.createEvent('HTMLEvents');
		event.initEvent(type, true, true);
		event.data = data || [];
		event.eventName = type;
		event.target = this;
		this.dispatchEvent(event);
		// return this;
	})
}