window.B3 = {
	version: '0.0.1',
	ui: {},
	settings: {
		apipath: wgScriptPath + '/api.php', //default URL to use for requests
		indexpath: wgScriptPath + '/index.php',
		longpost: 8000, //POST requests where one parameter value is this length or greater will use multipart/form-data
		maxactive: 10, //Maximum active requests 
		maxretry: 5 //Maximum number of times to resend requests that are generically bounced
	},
	queue: {
		xhrs: [], //XHRs matching queue.active
		active: [] //Requests waiting for a response
	},
	jobs: {
		index: [],
		listeners: {}
	},
	api: {},
	util: {}
};

/*
 * Run waiting requests
 *
 * If settings.maxactive is 0, run every waiting request
 * Otherwise, run waiting requests until the number of active requests equals settings.maxactive
 */
B3.queue.flush = function() {
	while(B3.queue.xhrs.length < B3.settings.maxactive || B3.settings.maxactive == 0) {
		var job = B3.jobs.index[0];
		for(var i = 1; i < B3.jobs.index.length; i++) {
			if(B3.jobs.index[i].args.length > 0) {
				if(B3.jobs.index[i].priority > job.priority) {
					if(job.args.length > 0) {job.priority++;} //if job == B3.jobs.index[0] and [0] is empty, don't let the priority increase or it'll eat up all the other jobs
					job = B3.jobs.index[i];
				}
				else {B3.jobs.index[i].priority++;}
			}
		}
		if(job.args.length > 0) {
			job.priority = 0;
			var xhr = B3.api.ajax.apply(B3.api, job.args.shift());
			B3.queue.xhrs.push(xhr);
			job.xhrs.push(xhr);
			var request = job.waiting.shift();
			B3.queue.active.push(request);
			job.active.push(request);
		}
		else {break;}
	}
}

/*
 * Queue up a request to the API
 *
 * method - HTTP method to use
 * url - Optional url to use. Defaults to settings.apipath
 * req - Object of parameters to send
 * upload - Optional boolean to force use of multipart/form-data
 * success - A function run when a single request is completed without errors
 * failure - A function run when a single request was unable to be completed
 * complete - A function run when all requests have been processed, successfully or otherwise
 *
 * Returns an array of request objects queued up (or sent).
 *
 * The request object can contain arrays of properties to send, to indicate different parameters for similar requests.
 * Example: {
 *      action: 'delete',
 *      title: ['Foo', 'Bar', 'Baz'],
 *      token: ['1+\\', '2+\\', '3+\\']
 * }
 * The above will send 3 requests, the first being action=delete&title=Foo&token=1%2B\, the second will be Bar and 2+\, etc.
 * `success` or `failure` will be called when any one of these requests returns.
 * `complete` will be called when all 3 have returned.
 *
 * If one or more arrays are shorter than others, the last value in the array will be repeated.
 * For example, if 'token' above was ['1+\\', '2+\\'], both Bar and Baz would have the token 2+\.
 *
 * Requests made through this function are buffered in B3.queue.
 * Only settings.maxactive requests can be active at once.
 * If settings.maxactive is 0, an infinite number of requests may be active.
 * Extraneous requests are stored in queue.waiting.
 * Whenever any request made through this function returns, the queue is flushed.
 * This occurs after success or failure and complete are called.
 * Requests made through this function in those listeners will be active immediately, until settings.maxactive is reached.
 * Any space left over is filled by the flush.
 *
 * Requests that receive generic random errors will be retried up to settings.maxretry times.
 * If a failure callback returns true, the request will be retried.
 * The request can be retried as many times as desired, but it will not be automatically resent if it receives a generic error and has been retried more than settings.maxretry times.
 * If a success callback returns false (`=== false`), it will be unflagged as successful and flagged as failed, and then the failure callback will be run.
 */
B3.api.request = function(method, url, req, upload, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof url == 'object') { //B3.api.request('GET', {param: value}, function() {});
		complete = failure;
		failure = success;
		success = upload;
		upload = req;
		req = url;
		url = B3.settings.apipath;

		req.format = 'json';
		req.bot = '1';
	}
	if(upload == undefined || typeof upload == 'function') {
		complete = failure;
		failure = success;
		success = upload;
		upload = false;
	}

	//Build an array of requests that don't contain arrays
	var maxindex = 1;
	var requests = [];
	for(var i = 0; i < maxindex; i++) {
		var clone = {};
		for(var j in req) {
			if(req[j] instanceof Array) {
				if(req[j].length > maxindex) {maxindex = req[j].length;}
				if(i >= req[j].length) {clone[j] = req[j][req[j].length - 1];}
				else {clone[j] = req[j][i];}
			}
			else {clone[j] = req[j];}
		}
		requests.push(clone);
	}

	var pending = requests.length;
	var succeeded = [];
	var failed = [];

	var callback = function() {
		if(this.status == 200) {
			try {var response = JSON.parse(this.responseText);}
			catch(err) {response = this.responseText;} //this should fail response.error, responseText == '[]' is inevitable

			if(this.responseText == '[]') {
				var code = 'empty';
				var info = 'Server returned empty response';
			}	
			else if(response.error) {
				var code = response.error.code;
				var info = response.error.info;
			}
			else { //success
				for(var i = 0; i < B3.queue.xhrs.length; i++) {
					if(B3.queue.xhrs[i] == this) {
						B3.queue.xhrs.splice(i, 1);
						B3.queue.active.splice(i, 1);
						break;
					}
				}
				for(var i = 0; i < job.xhrs.length; i++) {
					if(job.xhrs[i] == this) {
						job.xhrs.splice(i, 1);
						job.active.splice(i, 1);
						break;
					}
				}

				pending--;
				succeeded.push(this);
				if(typeof success == 'function' && success.call(this, response) === false) {
					pending++;
					succeeded.pop();
					code = 'rejected';
					info = 'Success callback rejected the response.';
				}
				else {
					if(pending == 0 && typeof complete == 'function') {complete(succeeded, failed);}

					B3.queue.flush();
					return;
				}
			}
		}
		else if(this.status == 414 && method == 'GET') { //request too long
			var xhr = B3.api.ajax('POST', url, B3.queue.active[i], upload, callback);
			for(var i = 0; i < B3.queue.xhrs.length; i++) {
				if(B3.queue.xhrs[i] == this) {
					B3.queue.xhrs.splice(i, 1, xhr);
					break;
				}
			}
			for(var i = 0; i < job.xhrs.length; i++) {
				if(job.xhrs[i] == this) {
					job.xhrs.splice(i, 1, xhr);
					break;
				}
			}
			return;
		}
		else if(this.status == 0) {
			var code = 'aborted';
			var info = 'Request was aborted by client';
		}
		else {
			var code = 'http';
			var info = this.status;
		}

		//failure
		if(code == 'internal_api_error_DBQueryError') {
			if(!this.retry) {this.retry = 1;}
			else {this.retry++;}
			if(this.retry < B3.settings.maxretry) {
				var xhr = B3.api.ajax(method, url, B3.queue.active[i], upload, callback);
				for(var i = 0; i < B3.queue.xhrs.length; i++) {
					if(B3.queue.xhrs[i] == this) {
						B3.queue.xhrs.splice(i, 1, xhr);
						break;
					}
				}
				for(var i = 0; i < job.xhrs.length; i++) {
					if(job.xhrs[i] == this) {
						job.xhrs.splice(i, 1, xhr);
						break;
					}
				}
				return xhr;
			}
		}

		var queueindex = undefined;
		var jobindex = undefined;
		var request = undefined;
		for(var i = 0; i < B3.queue.xhrs.length; i++) {
			if(B3.queue.xhrs[i] == this) {
				queueindex = i;
				B3.queue.xhrs.splice(i, 1);
				request = B3.queue.active.splice(i, 1)[0];
				break;
			}
		}
		for(var i = 0; i < job.xhrs.length; i++) {
			if(job.xhrs[i] == this) {
				jobindex = i;
				job.xhrs.splice(i, 1);
				job.active.splice(i, 1);
				break;
			}
		}
		if(queueindex == undefined || jobindex == undefined || request == undefined) {throw new Error('Failed sanity check');}

		if(typeof failure == 'function') {
			var resend = failure.call(this, code, info);
			if(resend) {
				if(!this.retry) {this.retry = 1;}
				else {this.retry++;}
				B3.queue.active.splice(queueindex, 0, request);
				job.active.splice(jobindex, 0, request);
				var xhr = B3.api.ajax(method, url, request, upload, callback);
				B3.queue.xhrs.splice(queueindex, 0, xhr);
				job.xhrs.splice(jobindex, 0, xhr);
				return xhr;
			}
		}

		pending--;
		failed.push(this);
		if(pending == 0 && typeof complete == 'function') {complete(succeeded, failed);}

		B3.queue.flush();

		//throw new Error(code + ': ' + info);
	}

	for(var i = 0; i < requests.length; i++) {
		if(B3.settings.maxactive > 0 && B3.queue.xhrs.length > B3.settings.maxactive) {
			job.args.push([method, url, requests[i], callback]);
			job.waiting.push(requests[i]);
		}
		else {
			var xhr = B3.api.ajax(method, url, requests[i], upload, callback);
			B3.queue.xhrs.push(xhr);
			B3.queue.active.push(requests[i]);
			job.xhrs.push(xhr);
			job.active.push(requests[i]);
		}
	}

	return requests;
}

/*
 * Send a request to the API
 *
 * See parameters to api.request for more information
 *     - success and failure are abstracts; callback is simply called when the request is done
 *
 * Returns a live XMLHttpRequest.
 *
 * Unlike api.request, the request object here may not contain arrays (they will produce API errors).
 * This function will send exactly one request, and does not affect the queue.
 * If the request method is POST and one of the parameter values is longer than settings.longpost (or `upload` is true), the request will be sent as multipart/form-data instead of application/x-www-form-urlencoded.
 * If settings.longpost is 0, `upload` must be true to use multipart/form-data.
 */
B3.api.ajax = function(method, url, req, upload, callback) {
	if(typeof url == 'object') {
		callback = upload;
		upload = req;
		req = url;
		url = B3.settings.apipath;
	}
	if(upload == undefined || typeof upload == 'function') {
		callback = upload;
		upload = false;
	}

	var xhr = new XMLHttpRequest();
	xhr.request = req;
	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			this.onreadystatechange = null; //http://stackoverflow.com/questions/12761255/can-xhr-trigger-onreadystatechange-multiple-times-with-readystate-done
			if(typeof callback == 'function') {callback.call(this);}
		}
	}
	xhr.onabort = function() {
		this.onabort = null;
		if(typeof callback == 'function') {callback.call(this);}
	}
	if(method == 'POST') {
		xhr.open(method, url, true);
		if(!upload && B3.settings.longpost > 0) {
			for(var i in req) {
				if(req[i].length > B3.settings.longpost) {upload = true; break;}
			}
		}
		if(upload) {
			//two characters from the messed up end of the charset, and two numbers between 0 and 65536 in hex
			var boundary = String.fromCharCode(Math.floor(Math.random() * 128 + 128)) + String.fromCharCode(Math.floor(Math.random() * 128 + 128)) + Math.floor(Math.random() * 65536).toString(16) + Math.floor(Math.random() * 65536).toString(16);
			xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
			data = '--' + boundary;
			for(var i in req) {data += '\nContent-Disposition: form-data; name="' + i + '"\n\n' + req[i] + '\n--' + boundary;}
			xhr.send(data + '--');
		}
		else {
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			var query = '';
			for(var i in req) {query += i + '=' + encodeURIComponent(req[i]) + '&';}
			xhr.send(query.substring(0, query.length - 1));
		}
	}
	else {
		url += '?';
		for(var i in req) {url += i + '=' + encodeURIComponent(req[i]) + '&';}
		xhr.open(method, url.substring(0, url.length - 1), true);
		xhr.send();
	}
	return xhr;
}

B3.jobs.add_listener = function(listener, func) {
	if(this.listeners[listener]) {this.listeners[listener].push(func);}
	else {this.listeners[listener] = [func];}
	return true;
}
B3.jobs.remove_listener = function(listener, func) {
	if(this.listeners[listener]) {
		var removed = false;
		for(var i = 0; i < this.listeners[listener].length; i++) {
			if(this.listeners[listener][i] == func) {
				this.listeners[listener].splice(i, 1);
				i--;
				removed = true;
			}
		}
		return removed;
	}
	else {return false;}
}
B3.jobs.call_listeners = function(listener) {
	if(this.listeners[listener]) {
		var args = Array.prototype.slice.call(arguments, 1);
		for(var i = 0; i < this.listeners[listeners].length; i++) {this.listeners[listener][i].apply(this, args);}
		return true;
	}
	else {return false;}
}

B3.jobs.Job = function(requests) {
	if(!(this instanceof B3.jobs.Job)) {throw new Error('B3.jobs.Job() must be called with `new`');}

	this.xhrs = [];
	this.active = [];
	this.args = [];
	this.waiting = [];

	this.listeners = {};

	this.priority = 0;

	this.id = B3.jobs.index.length;
	B3.jobs.index.push(this);
}
B3.jobs.Job.prototype = B3.api;
B3.jobs.Job.prototype.add_listener = B3.jobs.add_listener;
B3.jobs.Job.prototype.remove_listener = B3.jobs.remove_listener;
B3.jobs.Job.prototype.call_listeners = B3.jobs.call_listeners;

{{MediaWiki:B3.js/prop.js}}
{{MediaWiki:B3.js/list.js}}
{{MediaWiki:B3.js/meta.js}}
{{MediaWiki:B3.js/action.js}}

{{MediaWiki:B3.js/ui/main.js}}
