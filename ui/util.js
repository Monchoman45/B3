/*------------------------------------------------------------------------------------------------
     UI utilities
  ------------------------------------------------------------------------------------------------*/

B3.util.formharvest = function(form) {
	var params = {};

	//HARVEST THEIR INPUTS FOR SUSTENANCE
	var inputs = form.getElementsByTagName('input');
	for(var i = 0; i < inputs.length; i++) {
		var name = inputs[i].name;
		if(!name) {continue;}
		else if(name.indexOf('[]') == name.length - 2 && params[name.substring(0, name.length - 2)] == undefined) {params[name.substring(0, name.length - 2)] = [];}
		switch(inputs[i].type) {
			case 'text':
				if(params[i] instanceof Array) {params[name.substring(0, name.length - 2)].push(inputs[i].value);}
				else {params[name] = inputs[i].value;}
				break;
			case 'number':
				if(params[i] instanceof Array) {params[name.substring(0, name.length - 2)].push(inputs[i].value * 1);}
				else {params[name] = inputs[i].value * 1;}
				break;
			case 'checkbox':
				if(params[i] instanceof Array) {
					if(inputs[i].checked) {params[name.substring(0, name.length - 2)].push(inputs[i].value);}
				}
				else {
					if(inputs[i].checked) {params[name] = true;}
					else {params[name] = false;} //if it wasn't clicked at all, .checked will be undefined
				}
				break;
			case 'radio':
				if(inputs[i].checked) {
					if(params[i] instanceof Array) {params[name.substring(0, name.length - 2)].push(inputs[i].value);}
					else {params[name] = inputs[i].value;}
				}
				break;
		}
	}
	var textareas = form.getElementsByTagName('textarea');
	for(var i = 0; i < textareas.length; i++) {
		var name = textareas[i].name;
		if(!name) {continue;}
		else if(name.indexOf('[]') == name.length - 2) {
			if(params[name.substring(0, name.length - 2)] == undefined) {params[name.substring(0, name.length - 2)] = [];}
			params[name.substring(0, name.length - 2)].push(textareas[i].value);
		}
		else {params[name] = textareas[i].value;}
	}
	var selects = form.getElementsByTagName('select');
	for(var i = 0; i < selects.length; i++) {
		var name = selects[i].name;
		if(!name) {continue;}
		else if(name.indexOf('[]') == name.length - 2) {
			if(params[name.substring(0, name.length - 2)] == undefined) {params[name.substring(0, name.length - 2)] = [];}
			params[name.substring(0, name.length - 2)].push(selects[i].options[selects[i].selectedIndex].value);
		}
		else {params[name] = selects[i].options[selects[i].selectedIndex].value;}
	}
	return params;
}

B3.util.paramlist = function(params) {
	if(params instanceof Array) {
		var ol = document.createElement('ol');
		ol.start = 0;
		for(var i = 0; i < params.length; i++) {
			switch(typeof params[i]) {
				case 'number':
				case 'string':
					var li = document.createElement('li');
						li.textContent = params[i];
					ol.appendChild(li);
					break;
				case 'undefined':
					var li = document.createElement('li');
						li.textContent = 'None';
					ol.appendChild(li);
					break;
				case 'boolean':
					var li = document.createElement('li');
						if(params[i]) {li.textContent = 'Yes';}
						else {li.textContent = 'No';}
					ol.appendChild(li);
					break;
				case 'object':
					ol.appendChild(B3.util.paramlist(params[i]));
					break;
			}
		}
		return ol;
	}
	else {
		var ul = document.createElement('ul');
		for(var i in params) {
			switch(typeof params[i]) {
				case 'number':
				case 'string':
					var li = document.createElement('li');
						li.textContent = i + ': ' + params[i];
					ul.appendChild(li);
					break;
				case 'undefined':
					var li = document.createElement('li');
						li.textContent = i + ': None';
					ul.appendChild(li);
					break;
				case 'boolean':
					var li = document.createElement('li');
						if(params[i]) {li.textContent = i + ': Yes';}
						else {li.textContent = i + ': No';}
					ul.appendChild(li);
					break;
				case 'object':
					ul.appendChild(B3.util.paramlist(params[i]));
					break;
			}
		}
		return ul;
	}
}