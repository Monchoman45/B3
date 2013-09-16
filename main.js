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
	while(B3.queue.active.length < B3.settings.maxactive || B3.settings.maxactive == 0) {
		var job = B3.jobs.index[0];
		for(var i = 1; i < B3.jobs.index.length; i++) {
			if(B3.jobs.index[i].waiting.length > 0) {
				if(B3.jobs.index[i].priority > job.priority) {
					if(job.waiting.length > 0) {job.priority++;} //if job == B3.jobs.index[0] and [0] is empty, don't let the priority increase or it'll eat up all the other jobs
					job = B3.jobs.index[i];
				}
				else {B3.jobs.index[i].priority++;}
			}
		}
		if(job.waiting.length > 0) {
			job.priority = 0;
			var request = job.waiting.shift();
			B3.queue.active.push(request);
			job.active.push(request);
			request.send();
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
 * If a success callback returns false, it will be unflagged as successful and flagged as failed, and then the failure callback will be run.
 */
B3.api.request = function(method, url, params, upload, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof url == 'object') { //B3.api.request('GET', {param: value}, function() {});
		complete = failure;
		failure = success;
		success = upload;
		upload = params;
		params = url;
		url = B3.settings.apipath;
	}
	if(upload == undefined || typeof upload == 'function') {
		complete = failure;
		failure = success;
		success = upload;
		upload = false;
	}

	if(url == B3.settings.apipath) {
		params.format = 'json';
		params.bot = '1';
	}

	var pending = 0; //set later
	var succeeded = [];
	var failed = [];

	var callback = function() {
		if(this.xhr.status == 200) {
			try {var response = JSON.parse(this.xhr.responseText);}
			catch(err) {response = this.xhr.responseText;}

			if(this.xhr.responseText == '[]' || this.xhr.responseText == '') {
				var code = 'empty';
				var info = 'Server returned empty response';
			}
			else if(response.error) {
				var code = response.error.code;
				var info = response.error.info;
			}
			else { //success
				for(var i = 0; i < B3.queue.active.length; i++) {
					if(B3.queue.active[i] == this) {
						B3.queue.active.splice(i, 1);
						break;
					}
				}
				for(var i = 0; i < job.active.length; i++) {
					if(job.active[i] == this) {
						job.active.splice(i, 1);
						break;
					}
				}

				pending--;
				succeeded.push(this);
				if(typeof success == 'function') {
					var good = success.call(this, response);
					if(good == false) {
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
				else {
					if(pending == 0 && typeof complete == 'function') {complete(succeeded, failed);}

					B3.queue.flush();
					return;
				}
			}
		}
		else if(this.xhr.status == 414 && this.method == 'GET') { //request too long
			this.method = 'POST';
			this.send();
			return;
		}
		else if(this.xhr.status == 0) {
			var code = 'aborted';
			var info = 'Request was aborted by client';
		}
		else {
			var code = 'http';
			var info = this.xhr.status;
		}

		//failure
		if(code == 'internal_api_error_DBQueryError') {
			this.retry++;
			if(this.retry < B3.settings.maxretry) {
				this.send();
				return;
			}
		}

		var queueindex = undefined;
		var jobindex = undefined;
		var request = undefined;
		for(var i = 0; i < B3.queue.active.length; i++) {
			if(B3.queue.active[i] == this) {
				queueindex = i;
				request = B3.queue.active.splice(i, 1)[0];
				break;
			}
		}
		for(var i = 0; i < job.active.length; i++) {
			if(job.active[i] == this) {
				jobindex = i;
				job.active.splice(i, 1);
				break;
			}
		}
		if(queueindex == undefined || jobindex == undefined || request == undefined) {throw new Error('Failed sanity check');}

		if(typeof failure == 'function') {
			var resend = failure.call(this, code, info);
			if(resend) {
				this.retry++;
				B3.queue.active.splice(queueindex, 0, request);
				job.active.splice(jobindex, 0, request);
				this.send();
				return;
			}
		}

		pending--;
		failed.push(this);
		if(pending == 0 && typeof complete == 'function') {complete(succeeded, failed);}

		B3.queue.flush();

		//throw new Error(code + ': ' + info);
	}

	//Build an array of requests that don't contain arrays
	var maxindex = 1;
	var requests = [];
	for(var i = 0; i < maxindex; i++) {
		var req = {};
		for(var j in params) {
			if(Array.isArray(params[j])) {
				if(params[j].length > maxindex) {maxindex = params[j].length;}
				if(i >= params[j].length) {req[j] = params[j][params[j].length - 1];}
				else {req[j] = params[j][i];}
			}
			else {req[j] = params[j];}
		}
		requests.push(new B3.jobs.Request(method, url, req, upload, callback));
	}
	pending = requests.length;

	for(var i = 0; i < requests.length; i++) {
		if(B3.settings.maxactive > 0 && B3.queue.active.length > B3.settings.maxactive) {
			job.waiting.push(requests[i]);
		}
		else {
			B3.queue.active.push(requests[i]);
			job.active.push(requests[i]);
			requests[i].send();
		}
	}

	return requests;
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

	this.active = [];
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

B3.jobs.Request = function(method, url, params, upload, callback) {
	if(typeof upload == 'function') {
		callback = upload;
		upload = false;
	}

	this.method = method;
	this.url = url;
	this.params = params;
	if(upload) {this.upload = true;}
	else {this.upload = false;}
	this.callback = callback;

	this.retry = 0;
	this.listeners = {};

	this.xhr = new XMLHttpRequest();
	this.xhr.request = this;
}

/*
 * Send a request to the API
 *
 * See parameters to api.request for more information
 *     - success and failure are abstracts; callback is simply called when the request is done
 *
 * Unlike api.request, the request object here may not contain arrays (they will produce API errors).
 * This function will send exactly one request, and does not affect the queue.
 * If the request method is POST and one of the parameter values is longer than settings.longpost (or `upload` is true), the request will be sent as multipart/form-data instead of application/x-www-form-urlencoded.
 * If settings.longpost is 0, `upload` must be true to use multipart/form-data.
 */
B3.jobs.Request.prototype.send = function() {
	if(!this.xhr.request) {this.xhr.request = this;}
	this.xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			this.onreadystatechange = null; //http://stackoverflow.com/questions/12761255/can-xhr-trigger-onreadystatechange-multiple-times-with-readystate-done
			if(typeof this.request.callback == 'function') {this.request.callback();}
		}
	}
	this.xhr.onabort = function() {
		this.onabort = null;
		if(typeof this.request.callback == 'function') {this.request.callback();}
	}

	if(this.method == 'POST') {
		this.xhr.open(this.method, this.url, true);

		var upload = this.upload; //B3.settings.longpost may set this to true just for this one particular call
		if(!upload && B3.settings.longpost > 0) {
			for(var i in this.params) {
				if(this.params[i].length > B3.settings.longpost) {upload = true; break;}
			}
		}
		if(upload) {
			//two characters from the messed up end of the charset, and two numbers between 0 and 65536 in hex
			var boundary = String.fromCharCode(Math.floor(Math.random() * 128 + 128)) + String.fromCharCode(Math.floor(Math.random() * 128 + 128)) + Math.floor(Math.random() * 65536).toString(16) + Math.floor(Math.random() * 65536).toString(16);
			this.xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
			var data = '--' + boundary;
			for(var i in this.params) {data += '\nContent-Disposition: form-data; name="' + i + '"\n\n' + this.params[i] + '\n--' + boundary;}
			this.xhr.send(data + '--');
		}
		else {
			this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			var query = '';
			for(var i in this.params) {query += i + '=' + encodeURIComponent(this.params[i]) + '&';}
			this.xhr.send(query.substring(0, query.length - 1));
		}
	}
	else {
		var url = this.url + '?';
		for(var i in this.params) {url += i + '=' + encodeURIComponent(this.params[i]) + '&';}
		this.xhr.open(this.method, url.substring(0, url.length - 1), true);
		this.xhr.send();
	}
}

{{MediaWiki:B3.js/prop.js}}
{{MediaWiki:B3.js/list.js}}
{{MediaWiki:B3.js/meta.js}}
{{MediaWiki:B3.js/action.js}}

{{MediaWiki:B3.js/ui/main.js}}
