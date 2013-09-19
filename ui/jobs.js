B3.ui.jobs = {
	index: [],
	listeners: {}
};

B3.ui.jobs.add_listener = B3.util.add_listener;
B3.ui.jobs.remove_listener = B3.util.remove_listener;
B3.ui.jobs.call_listeners = B3.util.call_listeners;

B3.classes.Job = function(requests) {
	if(!(this instanceof B3.classes.Job)) {throw new Error('B3.jobs.Job() must be called with `new`');}

	this.active = [];
	this.waiting = [];

	this.listeners = {};

	this.priority = 0;

	B3.ui.jobs.index.push(this);
}
B3.classes.Job.prototype.add_listener = B3.util.add_listener;
B3.classes.Job.prototype.remove_listener = B3.util.remove_listener;
B3.classes.Job.prototype.call_listeners = B3.util.call_listeners;
