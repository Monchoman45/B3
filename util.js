B3.util.debug = function() {console.log.apply(console, arguments);}
B3.util.null = function() {}

B3.util.add_listener = function(listener, func) {
	if(Array.isArray(func)) {
		for(var i = 0; i < func.length; i++) {this.add_listener(listener, func[i]);}
		return true;
	}
	else if(typeof func == 'function') {
		if(this.listeners[listener]) {this.listeners[listener].push(func);}
		else {this.listeners[listener] = [func];}
		return true;
	}
	return false;
}
B3.util.remove_listener = function(listener, func) {
	if(Array.isArray(func)) {
		for(var i = 0; i < func.length; i++) {this.remove_listener(listener, func[i]);}
		return true;
	}
	else if(typeof func == 'function') {
		if(this.listeners[listener]) {
			var index = this.listeners[listener].indexOf(func);
			if(index != -1) {
				this.listeners[listener].splice(index, 1);
				return true;
			}
		}
	}

	return false;
}
B3.util.call_listeners = function(listener) {
	if(this.listeners[listener]) {
		var args = Array.prototype.slice.call(arguments, 1);
		var ret = [];
		for(var i = 0; i < this.listeners[listener].length; i++) {ret.push(this.listeners[listener][i].apply(this, args));}
		return ret;
	}
	else {return false;}
}

B3.add_listener = B3.util.add_listener;
B3.remove_listener = B3.util.remove_listener;
B3.call_listeners = B3.util.call_listeners;

B3.util.flatten = function(params) {
	var ret = [];
	var maxindex = 1;
	for(var i = 0; i < maxindex; i++) {
		var p = {};
		for(var j in params) {
			if(Array.isArray(params[j])) {
				if(params[j].length > maxindex) {maxindex = params[j].length;}
				if(i >= params[j].length) {p[j] = params[j][params[j].length - 1];}
				else {p[j] = params[j][i];}
			}
			else {p[j] = params[j];}
		}
		ret.push(p);
	}
	return ret;
}

B3.util.cap = function(str) {return str.charAt(0).toUpperCase() + str.substring(1);}
B3.util.normalize_pagename = function(page) {
	if(page.indexOf(':') != -1) { //Namespace:Title
		var namespace = page.substring(0, page.indexOf(':'));
		var title = page.substring(page.indexOf(':') + 1);
		page = B3.util.cap(namespace) + ':' + B3.util.cap(title);
	}
	else {page = B3.util.cap(page);} //Title (mainspace)
	while(page.indexOf('_') != -1) {page = page.replace('_', ' ');}
	return page;
}

B3.util.find = function(arr, prop, val) {
	for(var i = 0; i < arr.length; i++) {
		if(arr[i][prop] == val) {return arr[i];}
	}
	return false;
}

B3.util.copy = function(obj) {
	if(Array.isArray(obj)) {
		var copy = [];
		for(var i = 0; i < obj.length; i++) {copy.push(obj[i]);}
		return copy;
	}
	else if(typeof obj == 'object') {
		var copy = {};
		for(var i in obj) {copy[i] = obj[i];}
		return copy;
	}
	else {return obj;}
}
B3.util.deepcopy = function(obj) {
	if(Array.isArray(obj)) {
		var copy = [];
		for(var i = 0; i < obj.length; i++) {copy.push(B3.util.deepcopy(obj[i]));}
		return copy;
	}
	else if(typeof obj == 'object') {
		var copy = {};
		for(var i in obj) {copy[i] = B3.util.deepcopy(obj[i]);}
		return copy;
	}
	else {return obj;}
}

B3.util.softmerge = function(dest, source, prefix) {
	if(!prefix) {prefix = '';}

	for(var i in source) {
		if(!dest[prefix + i]) {dest[prefix + i] = source[i];}
	}
}
B3.util.hardmerge = function(dest, source, prefix) {
	if(!prefix) {prefix = '';}

	for(var i in source) {dest[prefix + i] = source[i];}
}

B3.util.driver_merge = function(params, modules) {
	if(params.prop) {params.prop = [params.prop];}
	else {params.prop = [];}
	if(params.list) {params.list = [params.list];}
	else {params.list = [];}
	if(params.meta) {params.meta = [params.meta];}
	else {params.meta = [];}

	for(var i = 0; i < modules.length; i++) {
		for(var j in modules[i]) {
			if((j == 'prop' || j == 'list' || j == 'meta') && params[j].indexOf(modules[i][j]) == -1) {params[j].push(modules[i][j]);}
			else if(j == 'qmodule') {params.qmodule.push(modules[i][j]);}
			else if(!params[j]) {params[j] = modules[i][j];}
			else {} //TODO: throw error?
		}
	}

	if(params.prop.length > 0) {params.prop = params.prop.join('|');}
	else {delete params.prop;}
	if(params.list.length > 0) {params.list = params.list.join('|');}
	else {delete params.list;}
	if(params.meta.length > 0) {params.meta = params.meta.join('|');}
	else {delete params.meta;}

	return params;
}

B3.util.message = function(message) {
	if(!message) {return '';} //FIXME: complain?

	for(var i = 1; i < arguments.length; i++) {
		while(message.indexOf('$' + i) != -1) {message = message.replace('$' + i, arguments[i]);}
	}
	return message;
}

B3.util.pagelist = function(pages) {
	var list = new B3.classes.List();
	for(var i = 0; i < pages.length; i++) {list.pages[pages[i]] = {title: pages[i]};}
	return list;
}
B3.util.userlist = function(users) {
	var list = new B3.classes.List();
	for(var i = 0; i < users.length; i++) {list.users[users[i]] = {name: users[i]};}
	return list;
}

B3.util.output_join = function() {this.output_list.join(this.input_list);}
B3.util.output_intersect = function() {this.output_list.intersect(this.input_list);}
B3.util.output_subtract = function() {this.output_list.subtract(this.input_list);}
B3.util.output_xor = function() {this.output_list.xor(this.input_list);}
B3.util.output_cull = function() {this.output_list.cull(this.input_list);}
B3.util.output_empty = function() {this.output_list.empty();}

B3.util.load_js = function(url) {
	var js = document.createElement('script');
		js.className = 'b3-js';
		js.src = url;
		js.type = 'text/javascript';
	document.head.appendChild(js);
	return js;
}

B3.util.load_css = function(url) {
	var css = document.createElement('link');
		css.className = 'b3-css';
		css.href = url;
		css.rel = 'stylesheet';
		css.type = 'text/css';
		css.media = 'screen';
	document.head.appendChild(css);
	return css;
}
