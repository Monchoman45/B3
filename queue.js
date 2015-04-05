/*
 * Run waiting requests
 *
 * If settings.maxactive is 0, run every waiting request
 * Otherwise, run waiting requests until the number of active requests equals settings.maxactive
 */
B3.queue.flush = function() {
	if(B3.queue.tasks.length == 0) {return false;}

	var first_empty = false; //this is used to check if the entire queue is out of runnable tasks
	while(B3.queue.active.length < B3.settings.maxactive || B3.settings.maxactive == 0) {
		var task = B3.queue.tasks.shift();
		B3.queue.tasks.push(task);

		var request = task.next_request();
		if(!request) {
			if(first_empty == task) {return true;} //entire queue is working, we have nothing to run
			else if(!first_empty) {first_empty = task;}
			continue;
		}
		else {first_empty = false;} //someone has a task, and they may have more, even if everyone else has none

		request.add_listener('complete', B3.queue.req_complete);
		B3.queue.active.push(request);
		request.send();
		B3.queue.call_listeners('run', request);
	}

	return true;
}

B3.queue.push = function(task) {
	if(B3.queue.tasks.indexOf(task) != -1) {return false;}

	B3.queue.tasks.push(task);
	B3.queue.flush();
	B3.queue.call_listeners('push');
	return true;
}

B3.queue.remove = function(task) {
	var index = B3.queue.tasks.indexOf(task);
	if(index == -1) {return false;}

	B3.queue.tasks.splice(index, 1);
	B3.queue.call_listeners('remove');
	return true;
}

B3.queue.req_complete = function(xhr) {
	this.remove_listener('complete', B3.queue.req_complete);

	B3.queue.active.splice(B3.queue.active.indexOf(this), 1);
	B3.queue.call_listeners('complete', this);
	B3.queue.flush();
}

B3.queue.add_listener = B3.util.add_listener;
B3.queue.remove_listener = B3.util.remove_listener;
B3.queue.call_listeners = B3.util.call_listeners;
