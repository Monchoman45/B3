/*------------------------------------------------------------------------------------------------
     Listener functions
  ------------------------------------------------------------------------------------------------*/

B3.ui.listeners = {
	window: {},
	titlebar: {},
	resize: {},
	queueresize: {},
	windows: {},
	links: {}
};

B3.ui.listeners.window.resize = function(event) {
	B3.ui.ids['controls-titlebar'].style.bottom = ''; //offsetHeight has to be accurate

	B3.ui.window.style.height = window.innerHeight - 50 + 'px';

	B3.ui.ids['controls-titlebar'].style.bottom = B3.ui.ids['controls'].offsetHeight - B3.ui.ids['controls-titlebar'].offsetHeight + 'px';
	B3.ui.ids['controls-windows'].style.top = B3.ui.ids['controls-titlebar'].offsetHeight + 'px';
}

B3.ui.listeners.resize.mousedown = function(event) {
	event.preventDefault(); //try to avoid hilighting
	B3.ui.window.addEventListener('mousemove', B3.ui.listeners.resize.mousemove);
}
B3.ui.listeners.resize.mouseup = function(event) {
	B3.ui.window.removeEventListener('mousemove', B3.ui.listeners.resize.mousemove);
}
B3.ui.listeners.resize.mousemove = function(event) {
	var el = event.target;
	var x = event.offsetX;
	while(el != B3.ui.window) {
		x += el.offsetLeft;
		el = el.parentNode;
	}
	if(B3.ui.window.offsetWidth - x < B3.settings.minwidth) {x = B3.ui.window.offsetWidth - B3.settings.minwidth;} //TODO: make this use percentages
	else if(B3.ui.window.offsetWidth - x > B3.settings.maxwidth) {x = B3.ui.window.offsetWidth - B3.settings.maxwidth;}

	B3.ui.ids['controls'].style.right = (B3.ui.window.offsetWidth - (x - 2)) / B3.ui.window.offsetWidth * 100 + '%';
	B3.ui.ids['resize'].style.right = (B3.ui.window.offsetWidth - (x + 3)) / B3.ui.window.offsetWidth * 100 + '%';
	B3.ui.ids['queue'].style.left = (x + 3) / B3.ui.window.offsetWidth * 100 + '%';
}

B3.ui.listeners.queueresize.mousedown = function(event) {
	event.preventDefault();
	B3.ui.ids['queue'].addEventListener('mousemove', B3.ui.listeners.queueresize.mousemove);
}
B3.ui.listeners.queueresize.mouseup = function(event) {
	B3.ui.ids['queue'].removeEventListener('mousemove', B3.ui.listeners.queueresize.mousemove);
}
B3.ui.listeners.queueresize.mousemove = function(event) {
	var el = event.target;
	var y = event.offsetY;
	while(el != B3.ui.ids['queue']) {
		y += el.offsetTop;
		el = el.parentNode;
	}
	if(B3.ui.window.offsetHeight - y < B3.settings.minqueueheight) {y = B3.ui.window.offsetHeight - B3.settings.minqueueheight;}
	else if(B3.ui.window.offsetHeight - y > B3.settings.maxqueueheight) {y = B3.ui.window.offsetHeight - B3.settings.maxqueueheight;}

	B3.ui.ids['queue-active'].style.bottom = (B3.ui.ids['queue'].offsetHeight - (y - 2)) / B3.ui.ids['queue'].offsetHeight * 100 + '%';
	B3.ui.ids['queue-resize'].style.top = (y - 2) / B3.ui.ids['queue'].offsetHeight * 100 + '%';
	B3.ui.ids['queue-waiting'].style.top = (y + 3) / B3.ui.ids['queue'].offsetHeight * 100 + '%';
}

B3.ui.listeners.windows.moduleclick = function(event) {
	var module = this.getAttribute('data-module');
	B3.ui.selection.module = module;
	B3.ui.selection.targets = null;
	B3.ui.selection.params = null;

	if(!B3.ui.modules[module].notargets) {B3.ui.animation.show('targets');}
	else {B3.ui.animation.show('params');}
}

B3.ui.listeners.windows.nextclick = function(event) {
	var radios = B3.ui.ids['controls-windows-targets-form'].elements['module'];
	for(var i = 0; i < radios.length; i++) {
		if(radios[i].checked) {
			var params = B3.util.formharvest(radios[i].parentNode);

			if(typeof B3.ui.targets[radios[i].value].prepare == 'function') {params = B3.ui.targets[radios[i].value].prepare(params);}
			B3.ui.selection.targets = {
				module: radios[i].value,
				params: params
			}
			break;
		}
	}

	B3.ui.animation.show('params');
}

B3.ui.listeners.windows.readyclick = function(event) {
	var params = B3.util.formharvest(B3.ui.ids['controls-windows-params-form']);

	if(typeof B3.ui.modules[B3.ui.selection.module].prepare == 'function') {B3.ui.selection.params = B3.ui.modules[B3.ui.selection.module].prepare(params);}
	else {B3.ui.selection.params = params;}

	B3.ui.animation.show('run');
}

B3.ui.listeners.windows.backclick = function(event) {
	B3.ui.animation.show('params');
}

B3.ui.listeners.windows.runclick = function(event) {
	B3.ui.selection.run();

	B3.ui.animation.show('jobs');
}

B3.ui.listeners.titlebar.click = function(event) {
	var classes = this.className.split(' ');
	for(var i = 0; i < classes.length; i++) {
		if(classes[i] == 'disabled') {return;}
	}
	B3.ui.animation.show(this.getAttribute('data-window'));
}

B3.ui.listeners.links.click = function(event) {
	event.preventDefault();
	window.open(this.href, 'B3');
}