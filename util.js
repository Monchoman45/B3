B3.util = {};

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

B3.util.normalize_pagename = function(page) {
	if(page.indexOf(':') != -1) { //Namespace:Title
		var namespace = page.substring(0, page.indexOf(':'));
		var title = page.substring(page.indexOf(':') + 1);
		page = Torus.util.cap(namespace) + ':' + Torus.util.cap(title);
	}
	else {page = Torus.util.cap(page);} //Title (mainspace)
	while(page.indexOf('_') != -1) {page = page.replace('_', ' ');}
	return page;
}

B3.util.find = function(arr, prop, val) {
	for(var i = 0; i < arr.length; i++) {
		if(arr[i][prop] == val) {return arr[i];}
	}
	return false;
}

B3.util.softmerge = function(dest, source, prefix) {
	if(!source || !dest) {return;}
	if(!prefix) {prefix = '';}

	for(var i in source) {
		if(!dest[prefix + i]) {dest[prefix + i] = source[i];}
	}
}
B3.util.hardmerge = function(dest, source, prefix) {
	if(!source || !dest) {return;}
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

//merge result.query into Task.data
//FIXME: this function sucks
B3.util.query_merge = function(data, query) {
	for(var module in query) {
		switch(module) {
			case 'limits':
			case 'query-continue':
			case 'warnings': //FIXME:
				break;

			case 'normalized':
				for(var i = 0; i < query[module].length; i++) {
					var from = query[module][i].from;
					var to = query[module][i].to;
					if(data.pages[from]) {
						data.pages[to] = data.pages[from];
						delete data.pages[from];
					}
				}
				break;

			case 'query':
				for(module in query.query) {
					switch(module) {
						case 'pages': //?action=query&titles=anything
							for(var i in query.query[module]) {
								var title = query.query[module][i].title;
								if(data.pages[title]) {B3.util.hardmerge(data.pages[title], query.query[module][i]);}
								else {data.pages[title] = query.query[module][i];}
							}
							break;

						//pages
						case 'allimages':
						case 'allpages':
						case 'alllinks':
						case 'allcategories':
						case 'backlinks':
						case 'categorymembers':
						case 'deletedrevs':
						case 'embeddedin':
						case 'filearchive':
						case 'imageusage':
						case 'iwbacklinks':
						case 'langbacklinks':
						case 'logevents':
						case 'recentchanges':
						case 'search':
						case 'tags':
						case 'usercontribs':
						case 'watchlist':
						case 'watchlistraw':
						case 'exturlusage':
						case 'random':
						case 'protectedtitles':
						case 'query.querypage':
						//case 'checkuser':
						//case 'checkuserlog':
						//case 'abuselog':
						//case 'abusefilters':
							for(var i = 0; i < query.query[module].length; i++) {
								var title = query.query[module][i].title;
								if(data.pages[title]) {B3.util.hardmerge(data.pages[title], query.query[module][i]);}
								else {data.pages[title] = query.query[module][i];}
							}
							break;

						//users
						case 'users':
						case 'allusers':
						case 'blocks':
							for(var i = 0; i < query.query[module].length; i++) {
								var user = query.query[module][i].name;
								if(data.users[user]) {B3.util.hardmerge(data.users[user], query.query[module][i]);}
								else {data.users[user] = query.query[module][i];}
							}
							break;

						//meta
						case 'general':
						case 'namespaces':
						case 'statistics':
						case 'rightsinfo':
						case 'extensiontags':
						case 'functionhooks':
						case 'protocols':
						case 'userinfo':
							B3.m[module] = query.query[module];
							break;
						case 'namespacealiases':
							B3.m[module] = {};
							for(var i = 0; i < query.query[module].length; i++) {
								var id = query.query[module][i].id;
								if(!B3.m[module][id]) {B3.m[module][id] = [];}
								B3.m[module][id].push(query.query[module][i]['*']);
							}
							break;
						case 'specialpagealiases':
							B3.m[module] = {};
							for(var i = 0; i < query.query[module].length; i++) {B3.m[module][query.query[module][i].realname] = query.query[module][i].aliases;}
							break;
						case 'magicwords':
						case 'usergroups':
						case 'extensions':
							B3.m[module] = {};
							for(var i = 0; i < query.query[module].length; i++) {B3.m[module][query.query[module][i].name] = query.query[module][i];}
							break;
						case 'interwikimap':
							if(!B3.m[module]) {B3.m[module] = {};}
							for(var i = 0; i < query.query[module].length; i++) {B3.m[module][query.query[module][i].prefix] = query.query[module][i];}
							break;
						case 'dbreplag':
							if(!B3.m[module]) {B3.m[module] = {};}
							for(var i = 0; i < query.query[module].length; i++) {B3.m[module][query.query[module][i].host] = query.query[module][i].lag;}
							break;
						case 'fileextensions':
							B3.m[module] = [];
							for(var i = 0; i < query.query[module].length; i++) {B3.m[module].push(query.query[module][i].ext);}
							break;
						case 'languages':
						case 'skins':
							B3.m[module] = {};
							for(var i = 0; i < query.query[module].length; i++) {B3.m[module][query.query[module][i].code] = query.query[module][i]['*'];}
							break;
						case 'extensions':
							B3.m[module] = {};
							for(var i = 0; i < query.query[module].length; i++) {B3.m[module][query.query[module][i].name] = query.query[module][i].subscribers;}
							break;
						case 'allmessages':
							if(!B3.m[module]) {B3.m[module] = {};}
							for(var i = 0; i < query.query[module].length; i++) {B3.m[module][query.query[module][i].name] = query.query[module][i]['*'];}
							break
						default: //FIXME: complain
					}
				}
				break;

			//actions
			case 'delete':
				var page = data.pages[query[module].title];
				if(page) {
					page.missing = '';
					if(page.new !== undefined) {delete page.new;}
					if(page.lastrevid) {delete page.lastrevid;}
					if(page.length) {delete page.length;}
					if(page.pageid) {delete page.pageid;}
				}
				break;
			case 'undelete':
				var page = data.pages[query[module].title];
				if(page) {
					if(page.missing !== undefined) {delete page.missing;}
				}
				break;
			case 'edit':
				var page = data.pages[query[module].title];
				if(page) {
					page.lastrevid = query[module].newrevid;

					if(page.missing !== undefined) {
						delete page.missing;
						page.pageid = query[module].pageid;
					}
					else if(page.new !== undefined) {delete page.new;}
				}
				break;
			case 'rollback':
				var page = data.pages[query[module].title];
				if(page) {page.lastrevid = query[module].revid;}
				break;
			case 'move':
				var page = data.pages[query[module].from];
				if(page) {
					delete data.pages[query[module].from];
					page.title = query[module].to;
					data.pages[page.title] = page;
				}
				page = data.pages[query[module].talkfrom];
				if(page) {
					delete data.pages[query[module].talkfrom];
					page.title = query[module].talkto;
					data.pages[page.title] = page;
				}
				break;
			case 'protect':
				var page = data.pages[query[module].title];
				if(page) {
					page.protections = [];
					for(var i = 0; i < query[module].protections.length; i++) {
						var prot = {};
						for(var j in query[module].protections[j]) {
							if(j == 'expiry') {prot[j] = query[module].protections[j];}
							else { //this one minor difference is so annoying
								prot.type = j;
								prot.level = query[module].protections[j];
							}
						}
						page.protections.push(prot);
					}
				}
				break;
			case 'userrights':
				var user = data.users[query[module].user];
				if(user) {
					if(user.groups) {
						for(var i = 0; i < query[module].removed.length; i++) {
							var index = user.groups.indexOf(query[module].removed[i]);
							if(index != -1) {user.groups.splice(index, 1);}
						}
						for(var i = 0; i < query[module].added.length; i++) {user.groups.push(query[module].added[i]);}
					}
					else {user.groups = query[module].added;}
				}
				break;
			default:
				console.log('B3.util.query_merge: found unknown module `' + module + '`: ', query[module]);
				break;
		}
	}
}
