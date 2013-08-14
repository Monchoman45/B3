



/*------------------------------------------------------------------------------------------------
     action=query&meta=
     TODO: allmessages
 
     Common arguments:
       success - A function run when a single action has been completed without errors (eg. one page deleted)
       failure - A function run when a single action was unable to be completed (eg. one page can't be deleted because it doesn't exist)
  ------------------------------------------------------------------------------------------------*/

/*
 * Get information about the wiki as a whole
 *
 * props - properties to get
 * options - optional additional module-specific parameters to send with the request
 * success - response.query.siteinfo
 * failure - passed
 */
B3.api.siteinfo = function(props, options, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof props != 'string') {props = props.join('|');}
	if(!options || typeof options == 'function') {
		failure = success;
		success = options;
		options = {};
	}

	var request = {
		action: 'query',
		meta: 'userinfo',
		siprop: props
	};
	for(var i in options) {
		if(!request['si' + i]) {request['si' + i] = options[i];}
	}
	return job.request('GET', request, function(response) {
		if(typeof success == 'function') {success.call(this, response.query.siteinfo);}
	}, failure);
}

/*
 * Get information about the current logged in user
 *
 * props - properties to get
 * success - response.query.userinfo
 * failure - passed
 */
B3.api.userinfo = function(props, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof props != 'string') {props = props.join('|');}

	return job.request('GET', {
		action: 'query',
		meta: 'userinfo',
		uiprop: props
	}, function(response) {
		if(typeof success == 'function') {success.call(this, response.query.userinfo);}
	}, failure);
}

/*
 * 
 */
B3.api.allmessages = function(success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	
}