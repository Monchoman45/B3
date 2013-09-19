window.B3 = {
	version: '0.0.3',
	settings: {
		longpost: 8000, //POST requests where one parameter value is this length or greater will use multipart/form-data
		maxactive: 10, //Maximum active requests 
		maxretry: 5 //Maximum number of times to resend requests that are generically bounced
	},
	queue: {
		active: [], //Requests waiting for a response
		tasks: [] //All tasks
	},
	api: {},
};

//Set apipath and indexpath
if(wgScriptPath != undefined) { //on wikia wgScriptPath is '' which is false
	B3.settings.apipath = wgScriptPath + '/api.php';
	B3.settings.indexpath = wgScriptPath + '/index.php';
}
else if(mw && mw.config.values.wgScriptPath != undefined) {
	B3.settings.apipath = mw.config.values.wgScriptPath + '/api.php';
	B3.settings.indexpath = mw.config.values.wgScriptPath + '/index.php';
}
else {
	B3.settings.apipath = '/w/api.php';
	B3.settings.indexpath = '/w/index.php';
	console.log('B3 warning: wgScriptPath is not defined, so the default api path was set to /w/api.php. If this is incorrect, please manually set B3.settings.apipath to the wiki\'s api.php location, and B3.settings.indexpath to the wiki\'s index.php location.');
}

/*
 * Run waiting requests
 *
 * If settings.maxactive is 0, run every waiting request
 * Otherwise, run waiting requests until the number of active requests equals settings.maxactive
 */
B3.queue.flush = function() {
	while(B3.queue.active.length < B3.settings.maxactive || B3.settings.maxactive == 0) {
		var task = B3.queue.tasks[0];
		for(var i = 1; i < B3.queue.tasks.length; i++) {
			if(B3.queue.tasks[i].waiting.length > 0) {
				if(B3.queue.tasks[i].priority > task.priority) {
					if(task.waiting.length > 0) {task.priority++;} //if task == B3.queue.tasks[0] and [0] is empty, don't let the priority increase or it'll eat up all the other tasks
					task = B3.queue.tasks[i];
				}
				else {B3.queue.tasks[i].priority++;}
			}
		}
		if(task.waiting.length > 0) {
			task.priority = 0;
			var request = task.waiting.shift();
			B3.queue.active.push(request);
			task.active.push(request);
			request.send();
		}
		else {break;}
	}
}

B3.queue.remove = function(request) {
	var index = B3.queue.active.indexOf(request);
	if(index != -1) {B3.queue.active.splice(index, 1);}
	if(request.task) {
		index = request.task.active.indexOf(request);
		if(index != -1) {request.task.active.splice(index, 1);}
	}
}

{{MediaWiki:B3.js/util.js}}
{{MediaWiki:B3.js/classes.js}}
{{MediaWiki:B3.js/action.js}}
{{MediaWiki:B3.js/prop.js}}
{{MediaWiki:B3.js/list.js}}
{{MediaWiki:B3.js/meta.js}}

{{MediaWiki:B3.js/ui/main.js}}
