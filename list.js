



/*------------------------------------------------------------------------------------------------
	action=query&list=
	TODO: filearchive, tags, watchlist, watchlistraw, protectedtitles, checkuser, checkuserlog, abuselog, abusefilters

	Common arguments:
		titles, users or namespaces - A single page/user/namespace or an array of pages/users/namespaces to act on
		props - Array of properties to get
		limit - Optional number of results to return
		options - Optional object of parameters to send with the params
  ------------------------------------------------------------------------------------------------*/

//Get deleted page revisions
B3.list.deletedrevs = function(props, limit, options) {
	if(typeof props != 'string' && props !== true) {props = props.join('|');}

	var params = {
		list: 'deletedrevs'
	}
	if(limit) {params.drlimit = limit;}
	if(props) {params.drprop = props;}
	B3.util.softmerge(params, options, 'dr');
	return params;
}

//Get deleted contributions
B3.list.deletedcontribs = function(props, limit, options, complete, success, failure) {
	if(typeof props != 'string' && props !== true) {props = props.join('|');}

	return new B3.classes.Task('GET', B3.settings.apipath, function(params, user, type) {
		if(type != 'users') {return;}

		params.list = 'deletedrevs';
		params.druser = user.name;
		if(limit) {params.drlimit = limit;}
		if(props) {params.drprop = props;}

		B3.util.softmerge(params, options, 'dr');
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}

// Get recent log actions
//
// type - Array of event actions to get. Use `true` to get all events
B3.list.logevents = function(type, props, limit, options) {
	if(typeof type != 'string' && type !== true) {type = type.join('|');}
	if(typeof props != 'string' && props !== true) {props = props.join('|');}

	var params = {
		list: 'logevents'
	};
	if(type !== true) {params.letype = type;}
	if(props !== true) {params.leprop = props;}
	if(limit) {params.lelimit = limit;}
	B3.util.softmerge(params, options, 'le');
	return params;
}

// Get recent edits and log actions
//
// type - Array of event types to get (edit, new, log). Use `true` to get all events
B3.list.recentchanges = function(type, props, limit, options) {
	if(typeof type != 'string' && type !== true) {type = type.join('|');}
	if(typeof props != 'string' && props !== true) {props = props.join('|');}

	var params = {
		list: 'recentchanges'
	};
	if(type !== true) {params.rctype = type;}
	if(props !== true) {params.rcprop = props;}
	if(limit) {params.rclimit = limit;}
	B3.util.softmerge(params, options, 'rc');
	return params;
}

//List all images
B3.list.allimages = function(props, limit, options) {
	if(typeof props != 'string') {props = props.join('|');}
 
	var params = {
		list: 'allimages',
		aiprop: props
	};
	if(limit) {params.ailimit = limit;}
	B3.util.softmerge(params, options, 'ai');
	return params;
}

//List all pages in a namespace
B3.list.allpages = function(namespaces, limit, options) {
	var params = {
		list: 'allpages',
		apnamespace: namespaces
	};
	if(limit) {params.aplimit = limit;}
	B3.util.softmerge(params, options, 'ap');
	return params;
}

//List all links in a namespace
B3.list.alllinks = function(namespaces, limit, options) {
	var params = {
		list: 'alllinks',
		alnamespace: namespaces
	};
	if(limit) {params.allimit = limit;}
	B3.util.softmerge(params, options, 'al');
	return params;
}

//List all categories
B3.list.allcategories = function(props, limit, options) {
	if(typeof props != 'string') {props = props.join('|');}
 
	var params = {
		list: 'allcategories',
		acprop: props
	};
	if(limit) {params.aclimit = limit;}
	B3.util.softmerge(params, options, 'ac');
	return params;
}

// List all users
//
// groups - Single group or array of groups to list. Use true to show all
B3.list.allusers = function(groups, props, limit, options) {
	if(typeof groups != 'string' && groups !== true) {groups = groups.join('|');}
	if(typeof props != 'string') {props = props.join('|');}
 
	var params = {
		list: 'allusers',
		auprop: props
	};
	if(groups !== true) {params.augroup = groups;}
	if(limit) {params.aulimit = limit;}
	B3.util.softmerge(params, options, 'au');
	return params;
}

//List all blocks
B3.list.blocks = function(users, props, limit, options) {
	if(typeof users != 'string' && users !== true) {users = users.join('|');}
	if(typeof props != 'string') {props = props.join('|');}
 
	var params = {
		list: 'blocks',
		bkprop: props
	};
	if(users !== true) {params.bkusers = users;}
	if(limit) {params.bklimit = limit;}
	B3.util.softmerge(params, options, 'bk');
	return params;
}

// List pages that link/transclude/include specified pages/templates/files
//
// module - The name of the module to use
// short - The abbreviation for `module`
B3.list.includes = function(titles, module, short, limit, options) {
	if(typeof titles == 'string') {titles = [titles];}

	var params = {
		list: module,
	}
	params[short + 'title'] = titles;
	if(limit) {params[short + 'limit'] = limit;}
	B3.util.softmerge(params, options, short);
	return params;
}

//Aliases for includes
B3.list.backlinks = function(titles, limit, options) {return B3.list.includes(titles, 'backlinks', 'bl', limit, options);}
B3.list.categorymembers = function(titles, limit, options) {return B3.list.includes(titles, 'categorymembers', 'cm', limit, options);}
B3.list.embeddedin = function(titles, limit, options) {return B3.list.includes(titles, 'embeddedin', 'ei', limit, options);}
B3.list.imageusage = function(titles, limit, options) {return B3.list.includes(titles, 'imageusage', 'iu', limit, options);}

// List pages that use the specified interwiki links
//
// prefixes - Prefixes to get (eg. 'wikipedia' of 'wikipedia:Chicken')
// titles - Titles to get (eg. 'Chicken' of 'wikipedia:Chicken')
B3.list.iwbacklinks = function(prefixes, titles, limit, options) {
	var params = {
		list: 'backlinks',
		iwblprefix: prefixes
	};
	if(titles !== true) {params.iwbltitle = titles;}
	if(limit) {params.iwbllimit = limit;}
	B3.util.softmerge(params, options, 'iwbl');
	return params;
}

// List pages that use the specified language links
//
// langs - Languages to get (eg. 'es' of 'es:Cerveza')
// titles - Titles to get (eg. 'Cerveza' of 'es:Cerveza')
B3.list.langbacklinks = function(langs, titles, limit, options) {
	var params = {
		list: 'backlinks',
		lbllang: langs
	};
	if(titles !== true) {params.lbltitle = titles;}
	if(limit) {params.lbllimit = limit;}
	B3.util.softmerge(params, options, 'lbl');
	return params;
}

// List pages that use the specified external links
//
// protocol - the protocol to look for (eg. 'http://' of 'http://www.google.com')
// links - the url to look for (eg. 'www.google.com' of 'http://www.google.com')
B3.list.exturlusage = function(protocol, links, limit, options) {
	var params = {
		list: 'exturlusage',
	};
	if(protocol !== true) {params.euprotocol = titles;}
	if(links !== true) {params.euquery = titles;}
	if(limit) {params.eulimit = limit;}
	B3.util.softmerge(params, options, 'eu');
	return params;
}

// Get search results
//
// search - The title to search for, or an array of titles to search for
B3.list.search = function(search, namespaces, limit, options) {
	if(typeof namespaces != 'string') {namespaces = namespaces.join('|');}

	var params = {
		list: 'search',
		srsearch: search,
	};
	if(namespaces !== true) {params.srnamespace = namespaces;}
	B3.util.softmerge(params, options, 'sr');
	return params;
}

//Return a random page
B3.list.random = function(namespaces, options) {
	var params = {
		list: 'random',
	};
	if(namespaces !== true) {params.rnnamespace = namespaces;}
	B3.util.softmerge(params, options, 'rn');
	return params;
}

//Get maintenance reports
B3.list.querypage = function(pages, limit, options) {
	var params = {
		list: 'querypage',
		qppage: pages,
	};
	if(limit) {params.qplimit = limit;}
	B3.util.softmerge(params, options, 'qp');
	return params;
}

//List users' contributions
B3.list.usercontribs = function(props, limit, options, complete, success, failure) {
	if(typeof props != 'string' && props !== true) {props = props.join('|');}

	return new B3.classes.Task('GET', B3.settings.apipath, function(params, user, type) {
		if(type != 'users') {return;}

		params.list = 'usercontribs';
		params.ucuser = user.name;
		if(props !== true) {params.ucprop = props;}
		if(limit) {params.uclimit = limit;}

		B3.util.softmerge(params, options, 'uc');
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}
