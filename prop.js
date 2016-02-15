



/*------------------------------------------------------------------------------------------------
	api.php?action=query&prop=
	TODO: imageinfo, stashimageinfo, categoryinfo, duplicatefiles
 
	Common arguments:
		titles or users - A single page/user or an array of pages/users to act on
		props - Optional array of properties to get
		limit - Optional number of results to show
		options - Optional object of extra parameters to send with the params
  ------------------------------------------------------------------------------------------------*/

B3.modules.register_query('revisions', {
	type: 'prop',
	prefix: 'rv',
	generator: false,
	query_generators: {
		/* Get information on page revisions
		 * 
		 * Props:
		 * 	ids: Revision ID
		 * 	flags: Flags like minor
		 * 	timestamp: Timestamp
		 * 	user: Editor
		 * 	userid: ID of user
		 * 	size: Page size
		 * 	sha1: Hash of text
		 * 	comment: Edit summary
		 * 	parsedcomment: HTML of summary
		 * 	content: Full page text
		 * 	tags: Tags
		 * 
		 * Options:
		 * 	tag: Filter by tag
		 * 	expandtemplates: Expand templates in page text
		 * 	generatexml: XML parse tree of text
		 *	parse: HTML of page text
		 * 	section: Limit content to this section
		 */
		revisions: function(props, limit, options) {
			if(typeof props != 'string') {props.join('|');}

			var params = {
				prop: 'revisions',
				rvprop: props,
			};
			if(limit) {params.rvlimit = limit;}
			B3.util.softmerge(params, options, 'rv');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {},
});


B3.modules.register_query('info', {
	type: 'prop',
	prefix: 'in',
	generator: false,
	query_generators: {
		/* Get basic page info
		 * 
		 * Args:
		 * 	props: Props
		 * 
		 * Props:
		 * 	protection: Protections on the page
		 * 	talkid: ID of talkpage
		 * 	watched: Whether you're watching the page
		 * 	subjectid: ID of content page associated with talk page
		 * 	url: Full URL to page
		 * 	readable: Read rights
		 * 	preload: EditFormPreloadText
		 * 	displaytitle: DISPLAYTITLE
		 * 
		 * Options:
		 */
		info: function(props, options) {
			if(typeof props != 'string') {props.join('|');}

			var params = {
				prop: 'info',
				inprop: props,
			};
			B3.util.softmerge(params, options, 'in');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {},
});

// Get a list of links/images/templates/categories on pages
//
// module - name of module to query
// short - the two letter short for the module
B3.modules.linklist_pgen = function(module, short, limit, options) {
	var params = {
		prop: module,
	}
	if(limit) {params[short + 'limit'] = limit;}
	B3.util.softmerge(params, options, short);
	return params;
};
B3.modules.register_query('links', {
	type: 'prop',
	prefix: 'pl',
	generator: true,
	query_generators: {
		links: function(limit, options) {B3.modules.linklist_pgen('links', 'pl', limit, options);},
	},
	param_generators: {},
	query_mergers: {},
});
B3.modules.register_query('iwlinks', {
	type: 'prop',
	prefix: 'iwlinks',
	generator: false,
	query_generators: {
		iwlinks: function(limit, options) {B3.modules.linklist_pgen('iwlinks', 'iw', limit, options);},
	},
	param_generators: {},
	query_mergers: {},
});
B3.modules.register_query('langlinks', {
	type: 'prop',
	prefix: 'll',
	generator: false,
	query_generators: {
		langlinks: function(limit, options) {B3.modules.linklist_pgen('langlinks', 'll', limit, options);},
	},
	param_generators: {},
	query_mergers: {},
});
B3.modules.register_query('images', {
	type: 'prop',
	prefix: 'im',
	generator: true,
	query_generators: {
		images: function(limit, options) {B3.modules.linklist_pgen('images', 'im', limit, options);},
	},
	param_generators: {},
	query_mergers: {},
});
B3.modules.register_query('templates', {
	type: 'prop',
	prefix: 'tl',
	generator: true,
	query_generators: {
		templates: function(limit, options) {B3.modules.linklist_pgen('templates', 'tl', limit, options);},
	},
	param_generators: {},
	query_mergers: {},
});
B3.modules.register_query('categories', {
	type: 'prop',
	prefix: 'cl',
	generator: true,
	query_generators: {
		categories: function(limit, options) {B3.modules.linklist_pgen('categories', 'cl', limit, options);},
	},
	param_generators: {},
	query_mergers: {},
});
B3.modules.register_query('extlinks', {
	type: 'prop',
	prefix: 'el',
	generator: false,
	query_generators: {
		extlinks: function(limit, options) {B3.modules.linklist_pgen('extlinks', 'el', limit, options);},
	},
	param_generators: {},
	query_mergers: {},
});
