



/*------------------------------------------------------------------------------------------------
     api.php?action=query&prop=
     TODO: imageinfo, stashimageinfo, categoryinfo, duplicatefiles
 
     Common arguments:
       titles or users - A single page/user or an array of pages/users to act on
       props - Optional array of properties to get
       limit - Optional number of results to show
       options - Optional object of extra parameters to send with the request
       success - A function run when a single action has been completed without errors (eg. one page deleted)
       failure - A function run when a single action was unable to be completed (eg. one page can't be deleted because it doesn't exist)
  ------------------------------------------------------------------------------------------------*/

/*
 * Get information on page revisions
 *
 * success - response.query.revisions, rvcontinue
 * failure - passed
 */
B3.api.revisions = function(titles, props, limit, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof props != 'string') {props.join('|');}
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
		prop: 'revisions',
		rvprop: props
	};
	if(typeof titles == 'string') {request.titles = titles;}
	else {
		if(typeof titles[0] == 'string') {request.titles = titles.join('|');}
		else {request.revids = titles.join('|');}
	}
	if(limit) {request.rvlimit = limit;}
	for(var i in options) {
		if(!request['rv' + i]) {request['rv' + i] = options[i];}
	}

	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].revisions.rvcontinue;}
			else {var cont = false;}
			success.call(this, response.query.pages, cont);
		}
	}, failure);
}

/*
 * Get basic page info
 *
 * success - response.query.info, incontinue
 * failure - passed
 */
B3.api.info = function(titles, props, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles != 'string') {titles.join('|');}
	if(typeof props != 'string') {props.join('|');}
	if(!options || typeof options == 'function') {
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		prop: 'info',
		titles: titles
	};
	if(props) {request.inprop = props;}
	for(var i in options) {
		if(!request['in' + i]) {request['in' + i] = props[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].info.incontinue;}
			else {var cont = false;}
			success.call(this, response.query.pages, cont);
		}
	}, failure);
}

/*
 * Get a list of links/images/templates/categories on pages
 *
 * module - name of module to query
 * short - the two letter short for the module
 * success - response.query[`module`], `short` + continue
 * failure - passed
 */
B3.api.linklist = function(titles, module, short, limit, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles != 'string') {titles.join('|');}
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
		prop: module,
		titles: titles
	}
	if(limit) {request[short + 'limit'] = limit;}
	for(var i in options) {
		if(!request[short + i]) {request[short + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].links[short + 'continue'];}
			else {var cont = false;}
			success.call(this, response.query.pages, cont);
		}
	}, failure);
}

/*
 * These all use the same interface, so they're aliases of linklist
 */
B3.api.links = function(titles, limit, options, success, failure) {this.linklist(titles, 'links', 'pl', limit, options, success, failure);}
B3.api.iwlinks = function(titles, limit, options, success, failure) {this.linklist(titles, 'iwlinks', 'iw', limit, options, success, failure);}
B3.api.langlinks = function(titles, limit, options, success, failure) {this.linklist(titles, 'langlinks', 'll', limit, options, success, failure);}
B3.api.images = function(titles, limit, options, success, failure) {this.linklist(titles, 'images', 'im', limit, options, success, failure);}
B3.api.templates = function(titles, limit, options, success, failure) {this.linklist(titles, 'templates', 'tl', limit, options, success, failure);}
B3.api.categories = function(titles, limit, options, success, failure) {this.linklist(titles, 'categories', 'cl', limit, options, success, failure);}

/*
 * Get a list of external links
 *
 * module - name of module to query
 * short - the two letter short for the module
 * success - response.query.extlinks, eloffset
 * failure - passed
 */
B3.api.extlinks = function(titles, module, short, limit, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles != 'string') {titles.join('|');}
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
		prop: 'extlinks',
		titles: titles
	}
	if(limit) {request.ellimit = limit;}
	for(var i in options) {
		if(!request['el' + i]) {request['el' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {
			if(response['query-continue']) {var cont = response['query-continue'].links.eloffset;}
			else {var cont = false;}
			success.call(this, response.query.pages, cont);
		}
	}, failure);
}


/*----------- Convenience -----------*/

/*
 * Get current page text
 *
 * success - Array of page texts matching titles
 * failure - passed
 */
B3.api.content = function(titles, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles == 'string') {titles = titles.split('|');}

	return job.request('GET', {
		action: 'query',
		prop: 'revisions',
		rvprop: 'content',
		titles: titles.join('|')
	}, function(response) {
		if(typeof success == 'function') {
			if(response.query.normalized) {
				for(var i in response.query.normalized) {
					for(var j = 0; j < titles.length; j++) {
						if(response.query.normalized[i].from == titles[j]) {titles[j] = response.query.normalized[i].to; break;}
					}
				}
			}
			var content = [];
			for(var i = 0; i < titles.length; i++) {
				for(var j in response.query.pages) {
					if(response.query.pages[j].title == titles[i]) {content[i] = response.query.pages[j].revisions[0]['*'];}
				}
			}
			success.call(this, content);
		}
	}, failure);
}