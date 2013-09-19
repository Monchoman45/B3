/*------------------------------------------------------------------------------------------------
     Render functions
  ------------------------------------------------------------------------------------------------*/
B3.ui.render = {};

B3.ui.render.actions = function() {
	var form = B3.ui.ids['controls-windows-actions-form'];
	while(form.children.length > 0) {form.removeChild(form.children[0]);}

	var groups = {};
	for(var i in B3.ui.modules) {
		if(!groups[B3.ui.modules[i].group]) {
			var fieldset = document.createElement('fieldset');
				fieldset.id = 'B3-module-' + i;
				var legend = document.createElement('legend');
					legend.textContent = B3.ui.modules[i].group;
				fieldset.appendChild(legend);
			groups[B3.ui.modules[i].group] = fieldset;
		}
		var a = document.createElement('a');
			a.id = 'B3-module-' + encodeURIComponent(B3.ui.modules[i].group) + '-' + encodeURIComponent(B3.ui.modules[i].label);
			a.setAttribute('data-module', i);
			a.addEventListener('click', B3.ui.listeners.windows.moduleclick);
			a.textContent = B3.ui.modules[i].label;
		groups[B3.ui.modules[i].group].appendChild(a);
	}

	for(var i in groups) {form.appendChild(groups[i]);}
}

B3.ui.render.targets = function() {
	if(B3.ui.selection.targets) {return;}

	var form = B3.ui.ids['controls-windows-targets-form'];
	while(form.children.length > 0) {form.removeChild(form.children[0]);}

	for(var i in B3.ui.targets) {
		var div = document.createElement('div');
			var radio = document.createElement('input');
				radio.type = 'radio';
				radio.id = 'B3-targets-' + i + '-select';
				radio.name = 'module';
				radio.value = i;
			div.appendChild(radio);

			var html = B3.ui.targets[i].html
			if(typeof html == 'function') {html = html();}
			if(typeof html == 'string') {div.innerHTML += html;}
			else if(html.length > 0) { //array of DOM elements
				for(var j = 0; j < html.length; j++) {div.appendChild(html[j]);}
			}
			else {div.appendChild(html);}
		form.appendChild(div);
	}
	form.elements['module'][0].checked = true;

	var next = document.createElement('a');
		next.id = 'B3-targets-next';
		next.addEventListener('click', B3.ui.listeners.windows.nextclick);
		next.textContent = 'Next';
	form.appendChild(next);
}

B3.ui.render.params = function() {
	if(B3.ui.selection.params) {return;}

	var form = B3.ui.ids['controls-windows-params-form'];
	while(form.children.length > 0) {form.removeChild(form.children[0]);}

	params = B3.ui.modules[B3.ui.selection.module].params;
	if(typeof params == 'function') {params = params();}
	if(typeof params == 'string') {form.innerHTML = params;}
	else if(params.length > 0) { //array of DOM elements
		for(var i = 0; i < params.length; i++) {form.appendChild(params[i]);}
	}
	else {form.appendChild(params);}

	var ready = document.createElement('a');
		ready.id = 'B3-params-ready';
		ready.textContent = 'Ready';
		ready.addEventListener('click', B3.ui.listeners.windows.readyclick);
	form.appendChild(ready);
}

B3.ui.render.run = function() {
	var form = B3.ui.ids['controls-windows-run-form'];
	while(form.children.length > 0) {form.removeChild(form.children[0]);}

	var actionheader = document.createElement('h2');
		actionheader.id = 'B3-run-action-header';
		actionheader.textContent = 'Action';
	form.appendChild(actionheader);
	var action = document.createElement('p');
		action.id = 'B3-run-action';
		action.textContent = B3.ui.selection.module;
	form.appendChild(action);

	if(!B3.ui.modules[B3.ui.selection.module].notargets) {
		var targetsheader = document.createElement('h2');
			targetsheader.id = 'B3-run-targets-header';
			targetsheader.textContent = 'Targets';
		form.appendChild(targetsheader);
		var targets = document.createElement('p');
			targets.id = 'B3-run-targets';
			var label = B3.ui.targets[B3.ui.selection.targets.module].label;
			if(typeof label == 'function') {label = label(B3.ui.selection.targets.params);}
			if(typeof label == 'string') {targets.innerHTML = label;}
			else if(label.length > 0) { //array of DOM elements
				for(var i = 0; i < label.length; i++) {targets.appendChild(label[i]);}
			}
			else {targets.appendChild(label);}
		form.appendChild(targets);
	}

	var paramsheader = document.createElement('h2');
		paramsheader.id = 'B3-run-params-header';
		paramsheader.textContent = 'Parameters';
	form.appendChild(paramsheader);
	var ul = B3.util.paramlist(B3.ui.selection.params);
		ul.id = 'B3-run-params';
	form.appendChild(ul);

	var confirm = document.createElement('div');
		confirm.id = 'B3-run-confirm';
		var back = document.createElement('a');
			back.id = 'B3-run-back';
			back.addEventListener('click', B3.ui.listeners.windows.backclick);
			back.textContent = 'Go back';
		confirm.appendChild(back);
		var span = document.createElement('span');
			span.textContent = 'Perform this action?';
		confirm.appendChild(span);
		var run = document.createElement('a');
			run.id = 'B3-run-run';
			run.addEventListener('click', B3.ui.listeners.windows.runclick);
			run.textContent = 'Run';
		confirm.appendChild(run);
	form.appendChild(confirm);
}

B3.ui.render.jobs = function() {
	
}

B3.ui.render.settings = function() {
	
}
