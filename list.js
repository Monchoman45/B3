



/*------------------------------------------------------------------------------------------------
     action=query&list=
     TODO: filearchive, tags, watchlist, watchlistraw, protectedtitles, checkuser, checkuserlog, abuselog, abusefilters
 
     Common arguments:
       titles, users or namespaces - A single page/user/namespace or an array of pages/users/namespaces to act on
       props - Array of properties to get
       limit - Optional number of results to return
       options - Optional object of parameters to send with the request
       success - A function run when a single action has been completed without errors (eg. one page deleted)
       failure - A function run when a single action was unable to be completed (eg. one page can't be deleted because it doesn't exist)
       error - A function run when an error occurs in a dependent request (eg. not allowed to fetch tokens)
       complete - A function run when all targets have been processed, whether successfully or otherwise
  ------------------------------------------------------------------------------------------------*/

/*
 * Get information on deleted revisions
 *
 * mode - One value:
 *        1 or 'titles' - Get deleted revisions of specified pages
 *        2 or 'user' - Get deleted edits from specified users
 *        3 or 'namespace' - Get deleted revisions in the specified namespaces
 * targets - titles, users, or namespaces to get deleted revisions of
 * success - response.query.deletedrevs, drcontinue
 * failure - passed
 * complete - passed
 */
B3.api.deletedrevs = function(mode, targets, props, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(!mode || mode === true) {mode = 1;}
	if(typeof targets != 'string') {targets = targets.join('|');}
	else if(typeof targets == 'number') {targets = [targets];} //namespaces have to be specified as ids
	if(typeof props != 'string') {props = props.join('|');}
	else if(props === true) {props = false;}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'deletedrevs'
	}
	if(limit) {request.drlimit = limit;}
	if(props) {request.drprop = props;}
	switch(mode) {
		case 1: case 'titles': request.titles = targets; break;
		case 2: case 'user': request.druser = targets.split('|'); break;
		case 3: case 'namespace': request.drnamespace = targets; break;
	}
	for(var i in options) {
		if(!request[i]) {request['dr' + i] = options[i];}
	}

	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].deletedrevs.drcontinue;}
			else {var cont = false;}
			success.call(this, response.query.deletedrevs, cont);
		}
	}, failure, complete);
}

/*
 * Get recent log actions
 *
 * type - Array of event actions to get. Use `true` to get all events
 * success - response.query.logevents, lestart
 * failure - passed
 */
B3.api.logevents = function(type, props, limit, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof type != 'string' && type !== true) {type = type.join('|');}
	if(typeof props != 'string' && props !== true) {props = props.join('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'logevents'
	}
	if(type !== true) {request.letype = type;}
	if(limit) {request.lelimit = limit;}
	if(props !== true) {request.leprop = props;}
	for(var i in options) {
		if(!request[i]) {request['le' + i] = options[i];}
	}

	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].logevents.lestart;}
			else {var cont = false;}
			success.call(this, response.query.logevents, cont);
		}
	}, failure);
}

/*
 * Get recent edits and log actions
 *
 * type - Array of event types to get (edit, new, log). Use `true` to get all events
 * success - response.query.recentchanges, rcstart
 * failure - passed
 */
B3.api.recentchanges = function(type, props, limit, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof type != 'string' && type !== true) {type = type.join('|');}
	if(typeof props != 'string' && props !== true) {props = props.join('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'recentchanges'
	};
	if(type !== true) {request.rctype = type;}
	if(limit) {request.rclimit = limit;}
	if(props !== true) {request.rcprop = props;}
	for(var i in options) {
		if(!request[i]) {request['rc' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].recentchanges.rcstart;}
			else {var cont = false;}
			success.call(this, response.query.recentchanges, cont);
		}
	}, failure);
}

/*
 * List all images
 *
 * success - response.query.allimages, aifrom
 * failure - passed
 */
B3.api.allimages = function(props, limit, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof props != 'string') {props = props.join('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		failure = success;
		success = options;
		options = {};
	}
 
	var request = {
		action: 'query',
		list: 'allimages',
		aiprop: props
	}
	if(limit) {request.ailimit = limit;}
	for(var i in options) {
		if(!request['ai' + i]) {request['ai' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].allimages.aifrom;}
			else {var cont = false;}
			success.call(this, response.query.allimages, cont);
		}
	}, failure);
}

/*
 * List all pages in a namespace
 *
 * success - response.query.allpages, apfrom
 * failure - passed
 * complete - passed
 */
B3.api.allpages = function(namespaces, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}
 
	var request = {
		action: 'query',
		list: 'allpages',
		apnamespace: namespaces
	}
	if(limit) {request.aplimit = limit;}
	for(var i in options) {
		if(!request['ap' + i]) {request['ap' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].allpages.apfrom;}
			else {var cont = false;}
			success.call(this, response.query.allpages, cont);
		}
	}, failure, complete);
}

/*
 * List all links in a namespace
 *
 * success - response.query.alllinks, alcontinue
 * failure - passed
 * complete - passed
 */
B3.api.alllinks = function(namespaces, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}
 
	var request = {
		action: 'query',
		list: 'alllinks',
		alnamespace: namespaces
	}
	if(limit) {request.allimit = limit;}
	for(var i in options) {
		if(!request['al' + i]) {request['al' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].alllinks.alcontinue;}
			else {var cont = false;}
			success.call(this, response.query.alllinks, cont);
		}
	}, failure, complete);
}

/*
 * List all categories
 *
 * success - response.query.allcategories, acfrom
 * failure - passed
 */
B3.api.allcategories = function(props, limit, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof props != 'string') {props = props.join('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		failure = success;
		success = options;
		options = {};
	}
 
	var request = {
		action: 'query',
		list: 'allcategories',
		acprop: props
	}
	if(limit) {request.aclimit = limit;}
	for(var i in options) {
		if(!request['ac' + i]) {request['ac' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].allcategories.acfrom;}
			else {var cont = false;}
			success.call(this, response.query.allcategories, cont);
		}
	}, failure);
}

/*
 * List all users
 *
 * groups - Single group or array of groups to list. Use true to show all
 * success - response.query.allusers, aufrom
 * failure - passed
 */
B3.api.allusers = function(groups, props, limit, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof groups != 'string' && groups !== true) {groups = groups.join('|');}
	if(typeof props != 'string') {props = props.join('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		failure = success;
		success = options;
		options = {};
	}
 
	var request = {
		action: 'query',
		list: 'allusers',
		auprop: props
	}
	if(groups !== true) {request.augroup = groups;}
	if(limit) {request.aulimit = limit;}
	for(var i in options) {
		if(!request['au' + i]) {request['au' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].allusers.aufrom;}
			else {var cont = false;}
			success.call(this, response.query.allusers, cont);
		}
	}, failure);
}

/*
 * List all blocks
 *
 * success - response.query.blocks, bkstart
 * failure - passed
 */
B3.api.blocks = function(users, props, limit, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof users != 'string' && users !== true) {users = users.join('|');}
	if(typeof props != 'string') {props = props.join('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		failure = success;
		success = options;
		options = {};
	}
 
	var request = {
		action: 'query',
		list: 'blocks',
		bkprop: props
	}
	if(users !== true) {request.bkusers = users;}
	if(limit) {request.bklimit = limit;}
	for(var i in options) {
		if(!request['bk' + i]) {request['bk' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].blocks.bkstart;}
			else {var cont = false;}
			success.call(this, response.query.blocks, cont);
		}
	}, failure);
}

/*
 * List pages that link/transclude/include specified pages/templates/files
 *
 * module - The name of the module to use
 * short - The abbreviation for `module`
 * success - response.query[module], `short` + continue
 * failure - passed
 * complete - passed
 */
B3.api.includes = function(titles, module, short, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles == 'string') {titles = titles.split('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: module
	};
	request[short + 'title'] = titles;
	if(limit) {request[short + 'limit'] = limit;}
	for(var i in options) {
		if(!request[short + i]) {request[short + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'][module][short + 'continue'];}
			else {var cont = false;}
			success.call(this, response.query[module], cont);
		}
	}, failure, complete);
}

/*
 * Aliases for includes
 */
B3.api.backlinks = function(titles, limit, options, success, failure, complete) {this.includes(titles, 'backlinks', 'bl', limit, options, success, failure, complete);}
B3.api.categorymembers = function(titles, limit, options, success, failure, complete) {this.includes(titles, 'categorymembers', 'cm', limit, options, success, failure, complete);}
B3.api.embeddedin = function(titles, limit, options, success, failure, complete) {this.includes(titles, 'embeddedin', 'ei', limit, options, success, failure, complete);}
B3.api.imageusage = function(titles, limit, options, success, failure, complete) {this.includes(titles, 'imageusage', 'iu', limit, options, success, failure, complete);}

/*
 * List pages that use the specified interwiki links
 *
 * prefixes - Prefixes to get (eg. 'wikipedia' of 'wikipedia:Chicken')
 * titles - Titles to get (eg. 'Chicken' of 'wikipedia:Chicken')
 * success - response.query.iwbacklinks, iwblcontinue
 * failure - passed
 * complete - passed
 */
B3.api.iwbacklinks = function(prefixes, titles, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof prefixes == 'string') {prefixes = prefixes.split('|');}
	if(typeof titles == 'string' && titles !== true) {titles = titles.split('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'backlinks',
		iwblprefix: prefixes
	};
	if(titles !== true) {request.iwbltitle = titles;}
	if(limit) {request.iwbllimit = limit;}
	for(var i in options) {
		if(!request['iwbl' + i]) {request['iwbl' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].iwbacklinks.iwblcontinue;}
			else {var cont = false;}
			success.call(this, response.query.iwbacklinks, cont);
		}
	}, failure, complete);
}

/*
 * List pages that use the specified language links
 *
 * langs - Languages to get (eg. 'es' of 'es:Cerveza')
 * titles - Titles to get (eg. 'Cerveza' of 'es:Cerveza')
 * success - response.query.langbacklinks, lblcontinue
 * failure - passed
 * complete - passed
 */
B3.api.langbacklinks = function(langs, titles, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof langs == 'string') {langs = langs.split('|');}
	if(typeof titles == 'string' && titles !== true) {titles = titles.split('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'backlinks',
		lbllang: langs
	};
	if(titles !== true) {request.lbltitle = titles;}
	if(limit) {request.lbllimit = limit;}
	for(var i in options) {
		if(!request['lbl' + i]) {request['lbl' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].langbacklinks.lblcontinue;}
			else {var cont = false;}
			success.call(this, response.query.langbacklinks, cont);
		}
	}, failure, complete);
}

/*
 * List pages that use the specified external links
 *
 * protocol - the protocol to look for (eg. 'http://' of 'http://www.google.com')
 * links - the url to look for (eg. 'www.google.com' of 'http://www.google.com')
 * success - response.query.exturlusage, euoffset
 * failure - passed
 * complete - passed
 */
B3.api.exturlusage = function(protocol, links, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof protocol == 'string') {protocol = protocol.split('|');}
	if(typeof links == 'string') {links = links.split('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'exturlusage'
	};
	if(protocol !== true) {request.euprotocol = titles;}
	if(links !== true) {request.euquery = titles;}
	if(limit) {request.eulimit = limit;}
	for(var i in options) {
		if(!request['eu' + i]) {request['eu' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].exturlusage.euoffset;}
			else {var cont = false;}
			success.call(this, response.query.exturlusage, cont);
		}
	}, failure, complete);
}

/*
 * Get search results
 *
 * search - The title to search for, or an array of titles to search for
 * success - response.query.search, sroffset
 * failure - passed
 * complete - passed
 */
B3.api.search = function(search, namespaces, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof namespaces != 'string') {namespaces = namespaces.join('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'search',
		srsearch: search
	}
	if(namespaces !== true) {request.srnamespace = namespaces;}
	for(var i in options) {
		if(!request['rn' + i]) {request['rn' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {c
	}, failure, complete);
}

/*
 * Return a random page
 *
 * success - response.query.random
 * failure - passed
 */
B3.api.random = function(namespaces, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof namespaces == 'string') {namespaces.split('|');}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'random'
	}
	if(namespaces !== true) {request.rnnamespace = namespaces;}
	for(var i in options) {
		if(!request['rn' + i]) {request['rn' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {success.call(this, response.query.random);}
	}, failure);
}

/*
 * Get maintenance reports
 *
 * success - response.query.querypage, qpoffset
 * failure - passed
 * complete - passed
 */
B3.api.querypage = function(pages, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof pages == 'string') {pages = pages.split('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'querypage',
		qppage: pages
	}
	if(limit) {request.qplimit = limit;}
	for(var i in options) {
		if(!request['qp' + i]) {request['qp' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].querypage.qpoffset;}
			else {var cont = false;}
			success.call(this, response.query.querypage, cont);
		}
	}, failure, complete);
}

/*
 * List users' contributions
 *
 * success - response.query.usercontribs, uccontinue
 * failure - passed
 * complete - passed
 */
B3.api.usercontribs = function(users, props, limit, options, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof users == 'string') {users = users.split('|');}
	if(typeof props != 'string' && props !== true) {props = props.join('|');}
	if(!limit || typeof limit == 'function' || typeof limit == 'object') {
		complete = failure;
		failure = success;
		success = options;
		options = limit;
		limit = false;
	}
	if(!options || typeof options == 'function') {
		complete = failure;
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		list: 'usercontribs',
		ucuser: users
	}
	if(props !== true) {request.ucprop = props;}
	if(limit) {request.uclimit = limit;}
	for(var i in options) {
		if(!request['qp' + i]) {request['uc' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].usercontribs.uccontinue;}
			else {var cont = false;}
			success.call(this, response.query.usercontribs, cont);
		}
	}, failure, complete);
}