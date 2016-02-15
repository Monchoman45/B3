B3.classes.Request = function(method, url, params, options, callback) {
	if(!(this instanceof B3.classes.Request)) {throw new Error('B3.classes.Request must be called with `new`.');}

	this.method = method;
	this.url = url;
	this.params = params;
	this.options = options;

	this.retry = 0;
	this.sending = false;
	this.complete = false;

	this.listeners = {};
	this.add_listener('complete', callback);

	this.xhr = new XMLHttpRequest();
	this.xhr.request = this;
	this.xhr.addEventListener('loadend', B3.classes.Request.loadend);
}

B3.classes.Request.prototype.send = function() {
	if(this.sending) {return false;}
	this.complete = false; //this allows us to resend completed requests

	if(this.method == 'POST') {
		this.xhr.open(this.method, this.url, true);
		this.xhr.setRequestHeader('Api-User-Agent', 'B3/' + B3.version);

		var upload = this.options.upload; //B3.settings.longpost may set this to true just for this one particular call
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
		this.xhr.setRequestHeader('Api-User-Agent', 'B3/' + B3.version);
		this.xhr.send();
	}

	this.sending = true;
	this.call_listeners('send');
	return true;
}

B3.classes.Request.prototype.abort = function() {
	if(this.sending) {this.xhr.abort();}
}

B3.classes.Request.loadend = function(event) {
	this.request.sending = false;
	this.request.complete = true;
	this.request.call_listeners('complete', this);
}

B3.classes.Request.prototype.add_listener = B3.util.add_listener;
B3.classes.Request.prototype.remove_listener = B3.util.remove_listener;
B3.classes.Request.prototype.call_listeners = B3.util.call_listeners;

B3.classes.List = function() {
	if(!(this instanceof B3.classes.List)) {throw new Error('B3.classes.List must be called with `new`.');}

	this.pages = {};
	this.users = {};
	this.ext = {};
}
B3.classes.List.prototype.join = function(list) {
	for(var i in list) {
		for(var j in list[i]) {
			if(!this[i][j]) {this[i][j] = list[i][j];}
			else {B3.util.softmerge(this[i][j], list[i][j]);}
		}
	}
	return this;
}
B3.classes.List.prototype.intersect = function(list) {
	for(var i in this) {
		for(var j in this[i]) {
			if(!list[i][j]) {delete this[i][j];}
			else {B3.util.softmerge(this[i][j], list[i][j]);}
		}
	}
	return this;
}
B3.classes.List.prototype.subtract = function(list) {
	for(var i in this) {
		for(var j in this[i]) {
			if(list[i][j]) {delete this[i][j];}
			else {B3.util.softmerge(this[i][j], list[i][j]);}
		}
	}
	return this;
}
B3.classes.List.prototype.xor = function(list) {
	for(var i in list) {
		for(var j in list[i]) {
			if(this[i][j]) {delete this[i][j];}
			else {this[i][j] = list[i][j];}
		}
	}
	return this;
}
B3.classes.List.prototype.cull = function(list) {
	return this.xor(list).intersect(list);
}
B3.classes.List.prototype.empty = function() {
	for(var i in this) {
		for(var j in this[i]) {delete this[i][j];}
	}
	return this;
}

B3.classes.Scheduleable = function() {
	this.working = false;
	this.complete = false;
	this.listeners = {};
}
B3.classes.Scheduleable.prototype.next_request = function() {throw new Error('B3: Default function Scheduleable.next_request was called');}
B3.classes.Scheduleable.prototype.cancel = function() {throw new Error('B3: Default function Scheduleable.cancel was called');}
B3.classes.Scheduleable.prototype.run = function() {
	if(!this.working && !this.complete) {
		this.working = true;
		B3.queue.push(this);
		this.add_listener('complete', function() {B3.queue.remove(this);});
		this.call_listeners('run');
	}
	return this;
}

B3.classes.Scheduleable.prototype.add_listener = B3.util.add_listener;
B3.classes.Scheduleable.prototype.remove_listener = B3.util.remove_listener;
B3.classes.Scheduleable.prototype.call_listeners = B3.util.call_listeners;

// Queue up a request to the API
//
// method - HTTP method to use (GET or POST)
// url - URL of the request (you probably want B3.settings.apipath)
// params - Object of parameters to send
// options - Assorted options
// complete - A function run when all requests have been processed, successfully or otherwise
// success - A function run when a single request is completed without errors
// failure - A function run when a single request was unable to be completed
//
// `params` can contain arrays of properties to send, to indicate different parameters for similar requests.
// Example: {
//      action: 'delete',
//      title: ['Foo', 'Bar', 'Baz'],
//      token: ['1+\\', '2+\\', '3+\\']
// }
// The above will send 3 requests, the first being action=delete&title=Foo&token=1%2B\, the second will be Bar and 2+\, etc.
// `success` or `failure` will be called when any one of these requests returns.
// `complete` will be called when all 3 have returned.
//
// If one or more arrays are shorter than others, the last value in the array will be repeated.
// For example, if 'token' above was ['1+\\', '2+\\'], both Bar and Baz would have the token 2+\.
//
// Requests that receive generic random errors will be retried up to settings.maxretry times.
// If a failure callback returns true, the request will be retried.
// The request can be retried as many times as desired, but it will not be automatically resent if it receives a generic error and has been retried more than settings.maxretry times.
// If a success callback returns false, it will be unflagged as successful and flagged as failed, and then the failure callback will be run.
B3.classes.Task = function(method, url, params, options, complete, success, failure) {
	if(!(this instanceof B3.classes.Task)) {throw new Error('B3.classes.Task must be called with `new`.');}
	B3.classes.Scheduleable.call(this);

	this.method = method;
	this.url = url;
	this.options = options;

	this.input_list = new B3.classes.List();
	this.output_list = new B3.classes.List();

	this.params = params;

	this.active = [];
	this.waiting = [];
	this.succeeded = [];
	this.failed = [];

	this.add_listener('complete', complete);
	this.add_listener('success', success);
	this.add_listener('failure', failure);

	this.length = 0;

	var module = B3.modules.action[params.module];
	if(!module) {throw new Error('B3 Task: tried to create task with invalid module `' + params.module + '`');}

	for(var i in module.param_generators) {this.add_listener('generate_' + i, module.param_generators[i]);}

	this.compiled = false;
}
B3.classes.Task.prototype = Object.create(B3.classes.Scheduleable.prototype);

B3.classes.Task.prototype.req_callback = function(xhr) {
	this.task.active.splice(this.task.active.indexOf(this), 1);

	if(xhr.status == 200) {
		if(xhr.responseText == '[]' || xhr.responseText == '') {
			var code = 'empty';
			var info = 'Server returned empty response';
		}
		else {
			try {var response = JSON.parse(xhr.responseText);}
			catch(err) {var response = xhr.responseText;}

			if(response.error) {
				var code = response.error.code;
				var info = response.error.info;
			}
			else {return this.task.req_success(this, response);} //success
		}
	}
	else if(xhr.status == 414 && this.method == 'GET') { //request too long
		this.method = 'POST';
		this.task.waiting.push(this);
		return;
	}
	else if(xhr.status == 0) {
		var code = 'aborted';
		var info = 'Request was aborted by client';
	}
	else {
		var code = 'http';
		var info = xhr.status;
	}

	//failure
	this.task.req_failure(this, code, info);
}

B3.classes.Task.prototype.req_success = function(request, response) {
	this.merge_data(response);

	var callbacks = this.call_listeners('success', request, response);
	for(var i = 0; i < callbacks.length; i++) {
		if(callbacks[i] === false) { //someone rejected this
			this.req_failure(request, 'rejected', 'A success callback rejected the response.');
			return;
		}
	}

	this.succeeded.push(request);
	if(this.waiting.length == 0 && this.active.length == 0) {this.done();}
}

B3.classes.Task.prototype.req_failure = function(request, code, info) {
	if(code == 'internal_api_error_DBQueryError') {
		request.retry++;
		if(B3.settings.maxretry == 0 || request.retry < B3.settings.maxretry) {
			this.waiting.push(request);
			return;
		}
	}

	var callbacks = this.call_listeners('failure', request, code, info);
	for(var i = 0; i < callbacks.length; i++) {
		if(callbacks[i]) { //someone wanted this to be retried
			request.retry++;
			this.waiting.push(request);
			return;
		}
	}

	this.failed.push(request);
	if(this.waiting.length == 0 && this.active.length == 0) {this.done();}
}

B3.classes.Task.prototype.compile = function() {
	if(this.compiled) {return false;}

	for(var i in this.input_list) {
		if(!this.listeners['generate_' + i] || this.listeners['generate_' + i].length == 0) {continue;}

		for(var j in this.input_list[i]) {
			var params = {};
			this.call_listeners('generate_' + i, params, this.input_list[i][j]);
			if(Object.getOwnPropertyNames(params).length > 0) {
				if(this.url == B3.settings.apipath) { //FIXME: do we need this
					params.format = 'json';
					params.bot = '1';
				}

				this.add(params);
			}
		}
	}
	this.call_listeners('compile');
	this.compiled = true;
	return true;
}

B3.classes.Task.prototype.add = function(params) {
	var reqs = B3.util.flatten(params);
	for(var i = 0; i < reqs.length; i++) {
		var request = new B3.classes.Request(this.method, this.url, reqs[i], this.options, this.req_callback);
		request.task = this;
		this.waiting.push(request);
		this.length++;
	}
}

B3.classes.Task.prototype.next_request = function() {
	if(!this.compiled) {this.compile();}
	if(this.waiting.length == 0) {return false;}

	var request = this.waiting.shift();
	this.active.push(request);
	this.call_listeners('next', request);
	return request;
}

B3.classes.Task.prototype.done = function() {
	this.working = false;
	this.complete = true;
	this.call_listeners('complete', this.output_list);
}

B3.classes.Task.prototype.cancel = function() {
	//fail everything waiting first, then abort all active requests
	//when all the async settles, there should be no requests left to run and complete will get called
	while(this.waiting.length > 0) {
		var request = this.waiting.shift();
		this.failed.push(request);
		this.call_listeners('failure', request, 'aborted', 'Request was aborted by client');
	}
	if(this.active.length > 0) {
		for(var i = 0; i < this.active.length; i++) {this.active[i].abort();}
	}
	else {this.done();} //nothing was running, so everything is definitely dead
}

B3.classes.Task.prototype.merge_data = function(query) {
	for(var i in query) {
		if(i == 'query') {
			for(var j in query[i]) {
				if(B3.modules.query_mergers[j]) {
					for(var k = 0; k < B3.modules.query_mergers[j].length; k++) {B3.modules.query_mergers[j][k].call(this, query[i][j], j);}
				}
			}
		}
		if(B3.modules.data_mergers[i]) {
			for(var j = 0; j < B3.modules.data_mergers[i].length; j++) {B3.modules.data_mergers[i][j].call(this, query[i], i);}
		}
	}
}

/* Job, for scheduling Tasks
 * each task is run and completed in order
 */
B3.classes.Job = function(tasks, complete, success, failure) {
	if(!(this instanceof B3.classes.Job)) {throw new Error('B3.classes.Job must be called with `new`.');}
	B3.classes.Scheduleable.call(this);

	this.tasks = [];
	this.index = 0;

	this.add_listener('complete', complete);
	this.add_listener('success', success);
	this.add_listener('failure', failure);

	this.add(tasks);
}
B3.classes.Job.prototype = Object.create(B3.classes.Scheduleable.prototype);

B3.classes.Job.prototype.add = function(tasks) {
	for(var i = 0; i < tasks.length; i++) {
		if(!(tasks[i] instanceof B3.classes.Scheduleable)) {throw new Error('B3: Tried to add non-schedulable object to Job:', tasks[i]);}

		tasks[i].job = this;
		tasks[i].add_listener('complete', this.task_complete);
		this.tasks.push(tasks[i]);
	}
	return tasks.length;
}

B3.classes.Job.prototype.next_request = function() {return this.tasks[this.index].next_request();}
B3.classes.Job.prototype.task_complete = function() {
	this.job.index++;
	if(this.job.index == this.job.tasks.length) {this.job.done();}
	else {this.job.tasks[this.job.index].input_list = this.ouput_list;}
}
B3.classes.Job.prototype.done = function() {
	this.working = false;
	this.complete = true;
	this.call_listeners('complete', this.tasks[this.tasks.length - 1].output_list);
}
B3.classes.Job.prototype.cancel = function() {
	//keep this.index where it is
	for(var i = this.index; i < this.tasks.length; i++) {this.tasks[i].remove_listener('complete', this.task_complete);}
	this.tasks[this.index].cancel();
	//TODO: what do we do with tasks that were never run?
}

/* AsyncJob, for running multiple Scheduleables at the same time
 * mostly, this allows you to bind listeners to a group of Tasks or Jobs that can be run at the same time
 */
B3.classes.AsyncJob = function(list, tasks, complete, success, failure) {
	if(!(this instanceof B3.classes.AsyncJob)) {throw new Error('B3.classes.AsyncJob must be called with `new`.');}
	B3.classes.Scheduleable.call(this);

	this.input_list = list;

	this.queue = [];
	this.completed = [];

	this.add_listener('complete', complete);
	this.add_listener('success', success);
	this.add_listener('failure', failure);

	this.add(tasks);
}
B3.classes.AsyncJob.prototype = Object.create(B3.classes.Scheduleable.prototype);

B3.classes.AsyncJob.prototype.add = function(tasks) {
	for(var i = 0; i < tasks.length; i++) {
		if(!(tasks[i] instanceof B3.classes.Scheduleable)) {throw new Error('B3: Tried to add non-schedulable object to Job');}

		tasks[i].job = this;
		tasks[i].input_list = this.input_list;
		tasks[i].add_listener('complete', this.task_complete);
		this.queue.push(tasks[i]);
	}
	return tasks.length;
}

B3.classes.AsyncJob.prototype.task_complete = function() {
	this.job.queue.splice(this.job.queue.indexOf(this), 1);
	this.job.completed.push(this);
	if(this.job.queue.length == 0) {this.job.done();}
}

B3.classes.AsyncJob.prototype.next_request = function() {
	var request = false;
	while(!request) {
		var task = this.queue.shift();
		this.queue.push(task);

		var request = task.next_request();
		if(!request) {
			if(first_empty == task) {return false;} //entire queue is working, we have nothing to run
			else if(!first_empty) {first_empty = task;}
		}
		else {first_empty = false;} //someone has a task, and they may have more, even if everyone else has none
	}

	return request;
}
B3.classes.AsyncJob.prototype.done = function() {
	this.working = false;
	this.complete = true;
	var lists = [];
	for(var i = 0; i < this.tasks.length; i++) {lists.push(this.tasks[i].output_list);}
	this.call_listeners('complete', lists);
}
B3.classes.AsyncJob.prototype.cancel = function() {
	for(var i = 0; i < this.tasks.length; i++) {this.tasks[i].cancel();}
}
