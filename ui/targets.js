/*------------------------------------------------------------------------------------------------
     Target modules
  ------------------------------------------------------------------------------------------------*/
B3.ui.targets = {};

B3.ui.targets.titles = {
	html: '<label for="B3-targets-titles-select">These targets (one on each line):</label> <textarea id="B3-targets-titles" name="titles"></textarea>',
	label: function(params) {
		var ol = document.createElement('ol');
			ol.start = 0;
			for(var i = 0; i < params.length; i++) {
				var li = document.createElement('li');
					var a = document.createElement('a');
						var url = encodeURIComponent(params[i]);
						while(url.indexOf('%20') != -1) {url = url.replace('%20', '_');}
						while(url.indexOf('%2F') != -1) {url = url.replace('%2F', '/');}
						while(url.indexOf('%3A') != -1) {url = url.replace('%3A', ':');}
						a.href = '/wiki/' + url;
						a.title = params[i];
						a.addEventListener('click', B3.ui.listeners.links.click);
						a.target = '_blank';
						a.textContent = params[i];
					li.appendChild(a);
				ol.appendChild(li);
			}
		return ol;
	},
	prepare: function(params) {
		var titles = params.titles.split('\n');
		for(var i = 0; i < titles.length; i++) {
			if(!titles[i] || titles[i].indexOf('|') != -1 || titles[i].indexOf('#') != -1) {
				titles.splice(i, 1);
				i--;
			}
			else {
				var colon = titles[i].indexOf(':');
				var namespace = titles[i].substring(0, colon).toLowerCase();
				while(namespace.indexOf(' ') != -1) {namespace = namespace.replace(' ', '_');}
				if(wgNamespaceIds[namespace]) {titles[i] = wgFormattedNamespaces[wgNamespaceIds[namespace]] + ':' + titles[i].charAt(colon + 1).toUpperCase() + titles[i].substring(colon + 2);}
				else {titles[i] = titles[i].charAt(0).toUpperCase() + titles[i].substring(1);} //mainspace
				while(titles[i].indexOf('_') != -1) {titles[i] = titles[i].replace('_', ' ');}
			}
		}
		return titles;
	},
	fetch: function(params, success, failure) {
		success(params);
	}
};

B3.ui.targets.category = {
	html: '<label for="B3-targets-category-select">Pages in Category:</label><input id="B3-targets-category" name="category" />',
	prepare: function(params) {
		if(params.category.toLowerCase().indexOf('category:') != 0) {params.category = 'Category:' + params.category;}
		params.category = B3.util.normalize_pagename(params.category);
		return params;
	},
	label: function(params) {
		var text = document.createTextNode('All pages in ');
		var a = document.createElement('a');
			a.href = B3.util.page_url(params.category);
			a.title = params.category;
			a.addEventListener('click', B3.ui.listeners.links.click);
			a.target = '_blank';
			a.textContent = params.category;
		return [text, a];
	},
	fetch: function(params, success, failure) {
		B3.query.generator(B3.list.categorymembers(params.category, 'max', {}), [
			B3.api.token('edit'),
		], success, false, failure).run();
	}
};
