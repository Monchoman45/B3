B3.util = {};

B3.util.add_listener = function(listener, func) {
	if(this.listeners[listener]) {this.listeners[listener].push(func);}
	else {this.listeners[listener] = [func];}
	return true;
}
B3.util.remove_listener = function(listener, func) {
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
B3.util.call_listeners = function(listener) {
	if(this.listeners[listener]) {
		var args = Array.prototype.slice.call(arguments, 1);
		for(var i = 0; i < this.listeners[listeners].length; i++) {this.listeners[listener][i].apply(this, args);}
		return true;
	}
	else {return false;}
}
