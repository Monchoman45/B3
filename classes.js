B3.classes = {};

/*
 * Queue up a request to the API
 *
 * method - HTTP method to use (GET or POST)
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
B3.classes.Task = function(method, url, params, upload, success, failure, complete) {
	if(!(this instanceof B3.classes.Task)) {throw new Error('B3.classes.Task must be called with `new`.');}

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

	this.success = success;
	this.failure = failure;
	this.complete = complete;

	this.active = [];
	this.waiting = [];
	this.succeeded = [];
	this.failed = [];

	this.priority = 0;

	B3.queue.tasks.push(this);
	this.add(method, url, params, upload);
}

/*
 * Add requests to an existing task
 *
 * Generally this is just for library functions that require multiple calls,
 * eg. token and post
 * although in practice you can do whatever you want
 * I'm a comment, not a cop
 */
B3.classes.Task.prototype.add = function(method, url, params, upload) {
	if(typeof url == 'object') {
		upload = params;
		params = url;
		url = B3.settings.apipath;
	}
	if(url == B3.settings.apipath) {
		params.format = 'json';
		params.bot = '1';
	}

	//Use `params` to populate this.waiting
	var maxindex = 1;
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
		req = new B3.classes.Request(method, url, req, upload, this.req_callback);
		req.task = this;
		this.waiting.push(req);
	}

	B3.queue.flush();
}

B3.classes.Task.prototype.req_callback = function() {
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
		else {this.task.req_success(this, response);} //success
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
	this.task.req_failure(this, code, info);
}

B3.classes.Task.prototype.req_success = function(request, response) {
	B3.queue.remove(request);

	this.succeeded.push(request);
	if(typeof this.success == 'function') {
		var good = this.success.call(request, response);
		if(good == false) {
			this.succeeded.pop();
			this.req_failure(request, 'rejected', 'Success callback rejected the response.');
		}
		else {
			if(this.waiting.length == 0 && typeof this.complete == 'function') {this.complete();}

			B3.queue.flush();
			return;
		}
	}
	else {
		if(this.waiting.length == 0 && typeof this.complete == 'function') {this.complete();}

		B3.queue.flush();
		return;
	}
}

B3.classes.Task.prototype.req_failure = function(request, code, info) {
	B3.queue.remove(request);

	if(code == 'internal_api_error_DBQueryError') {
		request.retry++;
		if(B3.settings.maxretry == 0 || request.retry < B3.settings.maxretry) {
			request.send();
			return;
		}
	}

	if(typeof this.failure == 'function') {
		var resend = this.failure.call(request, code, info);
		if(resend) {
			request.retry++;
			B3.queue.active.push(request);
			request.send();
			return;
		}
	}

	this.failed.push(request);
	if(this.waiting.length == 0 && typeof this.complete == 'function') {this.complete();}

	B3.queue.flush();

	//throw new Error(code + ': ' + info);
}

B3.classes.Request = function(method, url, params, upload, callback) {
	if(!(this instanceof B3.classes.Request)) {throw new Error('B3.classes.Task must be called with `new`.');}

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
	this.sending = false;
	this.complete = false;

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
B3.classes.Request.prototype.send = function() {
	if(this.sending) {return false;}
	else {this.complete = false;} //sending will only be set to true after send() is  called

	if(!this.xhr) {this.xhr = new XMLHttpRequest();}
	if(!this.xhr.request) {this.xhr.request = this;}

	this.xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			this.onreadystatechange = null; //http://stackoverflow.com/questions/12761255/can-xhr-trigger-onreadystatechange-multiple-times-with-readystate-done
			this.request.sending = false;
			this.request.complete = true;
			if(typeof this.request.callback == 'function') {this.request.callback();}
		}
	}
	this.xhr.onabort = function() {
		this.onabort = null;
		this.request.sending = false;
		this.request.complete = true;
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

	this.sending = true;
	return true;
}
