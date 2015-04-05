



/*------------------------------------------------------------------------------------------------
     api.php?action=query&prop=
     TODO: imageinfo, stashimageinfo, categoryinfo, duplicatefiles
 
     Common arguments:
       titles or users - A single page/user or an array of pages/users to act on
       props - Optional array of properties to get
       limit - Optional number of results to show
       options - Optional object of extra parameters to send with the params
       success - A function run when a single action has been completed without errors (eg. one page deleted)
       failure - A function run when a single action was unable to be completed (eg. one page can't be deleted because it doesn't exist)
  ------------------------------------------------------------------------------------------------*/

//Get information on page revisions
B3.prop.revisions = function(props, limit, options) {
	if(typeof props != 'string') {props.join('|');}

	var params = {
		prop: 'revisions',
		rvprop: props,
	};
	if(limit) {params.rvlimit = limit;}
	B3.util.softmerge(params, options, 'rv');
	return params;
}

//Get basic page info
B3.prop.info = function(props, options) {
	if(typeof props != 'string') {props.join('|');}

	var params = {
		prop: 'info',
		inprop: props,
	};
	B3.util.softmerge(params, options, 'in');
	return params;
}

// Get a list of links/images/templates/categories on pages
//
// module - name of module to query
// short - the two letter short for the module
B3.prop.linklist = function(module, short, limit, options) {
	var params = {
		prop: module,
	}
	if(limit) {params[short + 'limit'] = limit;}
	B3.util.softmerge(params, options, short);
	return params;
}

//These all use the same interface, so they're aliases of linklist
B3.prop.links = function(limit, options) {B3.prop.linklist('links', 'pl', limit, options);}
B3.prop.iwlinks = function(limit, options) {B3.prop.linklist('iwlinks', 'iw', limit, options);}
B3.prop.langlinks = function(limit, options) {B3.prop.linklist('langlinks', 'll', limit, options);}
B3.prop.images = function(limit, options) {B3.prop.linklist('images', 'im', limit, options);}
B3.prop.templates = function(limit, options) {B3.prop.linklist('templates', 'tl', limit, options);}
B3.prop.categories = function(limit, options) {B3.prop.linklist('categories', 'cl', limit, options);}
B3.prop.extlinks = function(limit, options) {B3.prop.linklist('extlinks', 'el', limit, options);}

/*----------- Convenience -----------*/

//TODO: Get current page text
/*B3.api.content = function(titles, complete, success, failure) {
	return job.request('GET', {
		action: 'query',
		prop: 'revisions',
		rvprop: 'content',
		titles: titles.join('|')
	}, function(response) {
		if(typeof success == 'function') {
			if(response.query.normalized) {
				for(var i in response.query.normalized) {
					for(var j = 0; j < titles.length; j++) {
						if(response.query.normalized[i].from == titles[j]) {titles[j] = response.query.normalized[i].to; break;}
					}
				}
			}
			var content = [];
			for(var i = 0; i < titles.length; i++) {
				for(var j in response.query.pages) {
					if(response.query.pages[j].title == titles[i]) {content[i] = response.query.pages[j].revisions[0]['*'];}
				}
			}
			success.call(this, content);
		}
	}, failure);
}*/
