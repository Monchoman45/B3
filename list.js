



/*------------------------------------------------------------------------------------------------
	action=query&list=
	TODO: filearchive, tags, watchlist, watchlistraw, protectedtitles, checkuser, checkuserlog, abuselog, abusefilters

	Common arguments:
		titles, users or namespaces - A single page/user/namespace or an array of pages/users/namespaces to act on
		props - Array of properties to get
		limit - Optional number of results to return
		options - Optional object of parameters to send with the params
  ------------------------------------------------------------------------------------------------*/

B3.modules.register_query('deletedrevs', {
	type: 'list',
	prefix: 'dr',
	generator: false,
	query_generators: {
		/* Get deleted contributions
		 * 
		 * Args:
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	revid: Revision ID
		 * 	parentid: ID of previous revision
		 * 	user: User who made the edit
		 * 	userid: ID of user
		 * 	comment: Edit summary
		 * 	parsedcomment: HTML of summary
		 * 	minor: Minor flag
		 * 	len: Page length
		 * 	sha1: Hash of page text
		 * 	content: Content of revision
		 * 	token: Get an undelete token (you can also just use B3.token)
		 * 
		 * Options:
		 * 	start: Start timestamp
		 * 	end: End timestamp
		 * 	dir: Oldest or newest first
		 * 	excludeuser: Don't list revisions by this user
		 */
		deletedrevs: function(props, limit, options) {
			if(typeof props != 'string' && props !== true) {props = props.join('|');}

			var params = {
				list: 'deletedrevs',
			};
			if(limit) {params.drlimit = limit;}
			if(props) {params.drprop = props;}
			B3.util.softmerge(params, options, 'dr');
			return params;
		},
		/* Get deleted contributions
		 * 
		 * Args:
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	revid: Revision ID
		 * 	parentid: ID of previous revision
		 * 	user: User who made the edit
		 * 	userid: ID of user
		 * 	comment: Edit summary
		 * 	parsedcomment: HTML of summary
		 * 	minor: Minor flag
		 * 	len: Page length
		 * 	sha1: Hash of page text
		 * 	content: Content of revision
		 * 	token: Get an undelete token (you can also just use B3.token)
		 * 
		 * Options:
		 * 	start: Start timestamp
		 * 	end: End timestamp
		 * 	excludeuser: Don't list revisions by this user
		 */
		deletedcontribs: function(props, limit, options) {
			if(typeof props != 'string' && props !== true) {props = props.join('|');}

			var params = {
				qmodule: 'deletedrevs',
				list: 'deletedrevs',
			};
			if(limit) {params.drlimit = limit;}
			if(props) {params.drprop = props;}
			B3.util.softmerge(params, options, 'dr');
			return params;
		},
		/* Get all deleted revisions in namespace
		 * 
		 * Args:
		 * 	namespace: Namespace to get deleted revisions from
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	revid: Revision ID
		 * 	parentid: ID of previous revision
		 * 	user: User who made the edit
		 * 	userid: ID of user
		 * 	comment: Edit summary
		 * 	parsedcomment: HTML of summary
		 * 	minor: Minor flag
		 * 	len: Page length
		 * 	sha1: Hash of page text
		 * 	content: Content of revision
		 * 	token: Get an undelete token (you can also just use B3.token)
		 * 
		 * Options:
		 * 	dir: Oldest or newest first
		 * 	from: Start from this page
		 * 	to: End at this page
		 * 	prefix: Filter by prefix
		 * 	unique: List only one revision per page
		 */
		alldeletedrevs: function(namespace, props, limit, options) {
			if(typeof props != 'string' && props !== true) {props = props.join('|');}

			var params = {
				list: 'deletedrevs',
				drnamespace: namespace,
			};
			if(limit) {params.drlimit = limit;}
			if(props) {params.drprop = props;}
			B3.util.softmerge(params, options, 'dr');
			return params;
		},
	},
	param_generators: {
		users: function(params, user) {
			params.druser = user.name;
		},
	},
	query_mergers: {
		deletedrevs: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('logevents', {
	type: 'list',
	prefix: 'le',
	generator: false,
	query_generators: {
		/* Get recent log actions
		 * 
		 * Args:
		 * 	type: Array of event actions to get. Use `true` to get all events
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	ids: Log ID
		 * 	title: Page title
		 * 	type: Log type
		 * 	user: User who performed action
		 * 	userid: ID of user
		 * 	timestamp: Timestamp
		 * 	comment: Edit summary
		 * 	parsedcomment: HTML of comment
		 * 	details: Details
		 * 	tags: Tags
		 * Default: ids, title, type, user, timestamp, comment, details
		 * 
		 * Options:
		 * 	start: Start timestamp
		 * 	end: End timestamp
		 * 	dir: Oldest or newest first
		 *	tag: Filter to this tag
		 */
		logevents: function(type, props, limit, options) {
			if(typeof type != 'string' && type !== true) {type = type.join('|');}
			if(typeof props != 'string' && props !== true) {props = props.join('|');}

			var params = {
				list: 'logevents'
			};
			if(type !== true) {params.letype = type;}
			if(props !== true) {params.leprop = props;}
			if(limit) {params.lelimit = limit;}
			B3.util.softmerge(params, options, 'le');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		logevents: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('recentchanges', {
	type: 'list',
	prefix: 'rc',
	generator: true,
	query_generators: {
		/* Get recent edits and log actions
		 * 
		 * Args:
		 * 	type: Array of event types to get (edit, new, log). Use `true` to get all events
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	user: User who made edit
		 * 	userid: ID of user
		 * 	comment: Edit summary
		 * 	parsedcomment: HTML of summary
		 * 	flags: Flags like minor
		 * 	timestamp: Timestamp
		 * 	title: Page title
		 * 	ids: Page id, revision id, old id
		 * 	sizes: Current size, old size
		 * 	redirect: Notes if page is a redirect
		 * 	patrolled: Notes if edit is patrolled
		 * 	loginfo: Log info
		 * 	tags: Tags
		 * Default: title, timestamp, ids
		 * 
		 * Options:
		 * 	start: Start timestamp
		 * 	end: End timestamp
		 * 	dir: Oldest or newest first
		 * 	namespace: Filter to this namespace
		 * 	user: Filter to this user
		 * 	excludeuser: Don't show edits by this user
		 * 	tag: Filter to this tag
		 * 	show: 
		 * 	toponly: Only show the last edit to a page
		 */
		recentchanges: function(type, props, limit, options) {
			if(typeof type != 'string' && type !== true) {type = type.join('|');}
			if(typeof props != 'string' && props !== true) {props = props.join('|');}

			var params = {
				list: 'recentchanges'
			};
			if(type !== true) {params.rctype = type;}
			if(props !== true) {params.rcprop = props;}
			if(limit) {params.rclimit = limit;}
			B3.util.softmerge(params, options, 'rc');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		recentchanges: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('allimages', {
	type: 'list',
	prefix: 'ai',
	generator: true,
	query_generators: {
		/* List all images
		 * 
		 * Args:
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	timestamp: Timestamp of last edit
		 * 	user: Last user to edit
		 * 	userid: ID of user
		 * 	comment: Edit summary
		 * 	parsedcomment: HTML of summary
		 * 	url: URL of image
		 * 	size: File size and width/height
		 * 	dimensions: Same as size
		 * 	sha1: Hash of image
		 * 	mime: MIME type
		 * 	thumbmime: MIME type of thumbnail
		 * 	mediatype: Media type
		 * 	metadata: EXIF
		 * 	bitdepth: Bit depth
		 * Default: timestamp, url
		 * 
		 * Options:
		 * 	prefix: Filter to this prefix
		 * 	minsize: Filter out images smaller than this
		 * 	maxsize: Filter out images larger than this
		 * 	dir: Ascending or descending
		 * 	sha1: Hash of image
		 * 	sha1base36: Hash in base 36
		 * 	mime: Filter to only this MIME type
		 */
		allimages: function(props, limit, options) {
			if(typeof props != 'string') {props = props.join('|');}
		 
			var params = {
				list: 'allimages',
				aiprop: props
			};
			if(limit) {params.ailimit = limit;}
			B3.util.softmerge(params, options, 'ai');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		allimages: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('allpages', {
	type: 'list',
	prefix: 'allpages',
	generator: true,
	query_generators: {
		/* List all pages in a namespace
		 * 
		 * Args:
		 * 	namespace: Namespace
		 * 	limit: Limit
		 * 
		 * Options:
		 * 	prefix: Filter to this prefix
		 * 	filterredir: Filter to all, redirects, or nonredirects
		 * 	minsize: Filter out pages smaller than this
		 * 	maxsize: Filter out pages larger than this
		 * 	prtype: Filter to only pages that are edit, move, or upload protected
		 * 	prlevel: Filter to only pages that are autoconfirmed or sysop protected
		 * 	prfiltercascade: Filter to all, cascading, or noncascading
		 * 	prexpiry: Filter to all, indefinite, or definite
		 * 	dir: Ascending or descending
		 * 	filterlanglinks: Filter to all, withlanglinks, or withoutlanglinks
		 */
		allpages: function(namespace, limit, options) {
			var params = {
				list: 'allpages',
				apnamespace: namespace
			};
			if(limit) {params.aplimit = limit;}
			B3.util.softmerge(params, options, 'ap');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		allpages: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('alllinks', {
	type: 'list',
	prefix: 'al',
	generator: true,
	query_generators: {
		/* List all links in a namespace
		 * 
		 * Args:
		 * 	namespace: Namespace
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	ids: Page id link is from
		 * 	title: Page that link goes to
		 * 
		 * Options:
		 * 	prefix: Filter to this prefix
		 * 	unique: Unique only
		 */
		alllinks: function(namespace, props, limit, options) {
			if(typeof props != 'string') {props = props.join('|');}

			var params = {
				list: 'alllinks',
				alnamespace: namespace
			};
			if(props) {params.alprop = props;}
			if(limit) {params.allimit = limit;}
			B3.util.softmerge(params, options, 'al');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		allinks: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('allcategories', {
	type: 'list',
	prefix: 'ac',
	generator: true,
	query_generators: {
		/* List all categories
		 * 
		 * Args:
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	size: Number of pages in category
		 * 	hidden: __HIDDENCAT__
		 * 	id: Category ID
		 * 
		 * Options:
		 * 	prefix: Filter by prefix
		 * 	dir: Ascending or descending
		 * 	min: Filter out categories with fewer pages than this
		 * 	max: Filter out categories with more pages than this
		 */
		allcategories: function(props, limit, options) {
			if(typeof props != 'string') {props = props.join('|');}
		 
			var params = {
				list: 'allcategories',
				acprop: props
			};
			if(limit) {params.aclimit = limit;}
			B3.util.softmerge(params, options, 'ac');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		allcategories: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('allusers', {
	type: 'list',
	prefix: 'au',
	generator: false,
	query_generators: {
		/* List all users
		 * 
		 * Args:
		 * 	groups: Single group or array of groups to list. Use true to show all
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	blockinfo: Whether or not the user is blocked
		 * 	groups: Groups the user is in
		 * 	implicitgroups: Auto groups
		 * 	rights: Full rights list
		 * 	editcount: Edit count
		 * 	registration: Registration timestmap
		 * 
		 * Options:
		 * 	witheditsonly: Filter out users with 0 edits
		 * 	activeusers: Filter out users who haven't edited in 30 days
		 * 	dir: Ascending or descending
		 */
		allusers: function(groups, props, limit, options) {
			if(typeof groups != 'string' && groups !== true) {groups = groups.join('|');}
			if(typeof props != 'string') {props = props.join('|');}
		 
			var params = {
				list: 'allusers',
				auprop: props
			};
			if(groups !== true) {params.augroup = groups;}
			if(limit) {params.aulimit = limit;}
			B3.util.softmerge(params, options, 'au');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		allusers: B3.modules.user_querymerger,
	},
});

B3.modules.register_query('blocks', {
	type: 'list',
	prefix: 'bk',
	generator: false,
	query_generators: {
		/* List all blocks
		 * 
		 * Args:
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	id: Block id
		 * 	user: Blocked user
		 * 	userid: ID of user
		 * 	by: Blocker
		 * 	byid: ID of blocker
		 * 	timestamp: Timestamp
		 * 	expiry: Block expiry
		 * 	reason: Edit summary
		 * 	range: Range affected
		 * 	flags: Flags
		 * 
		 * Options:
		 * 	start: Start timestamp
		 * 	end: End timestamp
		 * 	dir: Oldest or newest first
		 * 	show: Criteria: account, temp, ip, range 
		 */
		blocks: function(props, limit, options) {
			if(typeof props != 'string') {props = props.join('|');}
		 
			var params = {
				list: 'blocks',
				bkprop: props
			};
			if(users !== true) {params.bkusers = users;}
			if(limit) {params.bklimit = limit;}
			B3.util.softmerge(params, options, 'bk');
			return params;
		},
		//TODO: bkusers, bkip
	},
	param_generators: {},
	query_mergers: {
		blocks: B3.modules.user_querymerger,
	},
});

// List pages that link/transclude/include specified pages/templates/files
//
// module - The name of the module to use
// short - The abbreviation for `module`
B3.modules.includes_pgen = function(titles, module, short, limit, options) {
	if(typeof titles == 'string') {titles = [titles];}

	var params = {
		list: module,
	}
	params[short + 'title'] = titles;
	if(limit) {params[short + 'limit'] = limit;}
	B3.util.softmerge(params, options, short);
	return params;
};
B3.modules.register_query('backlinks', {
	type: 'list',
	prefix: 'bl',
	generator: true,
	query_generators: {
		backlinks: function(titles, limit, options) {return B3.modules.includes_pgen(titles, 'backlinks', 'bl', limit, options);},
	},
	param_generators: {},
	query_mergers: {
		backlinks: B3.modules.page_querymerger,
	},
});
B3.modules.register_query('categorymembers', {
	type: 'list',
	prefix: 'cm',
	generator: true,
	query_generators: {
		categorymembers: function(titles, limit, options) {return B3.modules.includes_pgen(titles, 'categorymembers', 'cm', limit, options);},
	},
	param_generators: {},
	query_mergers: {
		categorymembers: B3.modules.page_querymerger,
	},
});
B3.modules.register_query('embeddedin', {
	type: 'list',
	prefix: 'ei',
	generator: true,
	query_generators: {
		embeddedin: function(titles, limit, options) {return B3.modules.includes_pgen(titles, 'embeddedin', 'ei', limit, options);},
	},
	param_generators: {},
	query_mergers: {
		embeddedin: B3.modules.page_querymerger,
	},
});
B3.modules.register_query('imageusage', {
	type: 'list',
	prefix: 'iu',
	generator: true,
	query_generators: {
		imageusage: function(titles, limit, options) {return B3.modules.includes_pgen(titles, 'imageusage', 'iu', limit, options);},
	},
	param_generators: {},
	query_mergers: {
		imageusage: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('iwbacklinks', {
	type: 'list',
	prefix: 'iwbl',
	generator: true,
	query_generators: {
		/* List pages that use the specified interwiki links
		 * 
		 * Args:
		 * 	prefixes: Prefixes to get (eg. 'wikipedia' of 'wikipedia:Chicken')
		 * 	titles: Titles to get (eg. 'Chicken' of 'wikipedia:Chicken')
		 * 	limit: Limit
		 * 
		 * Options:
		 */
		iwbacklinks: function(prefixes, titles, limit, options) {
			var params = {
				list: 'iwbacklinks',
				iwblprefix: prefixes
			};
			if(titles !== true) {params.iwbltitle = titles;}
			if(limit) {params.iwbllimit = limit;}
			B3.util.softmerge(params, options, 'iwbl');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		iwbacklinks: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('langbacklinks', {
	type: 'list',
	prefix: 'lbl',
	generator: true,
	query_generators: {
		/* List pages that use the specified language links
		 * 
		 * Args:
		 * 	langs: Languages to get (eg. 'es' of 'es:Cerveza')
		 * 	titles: Titles to get (eg. 'Cerveza' of 'es:Cerveza')
		 * 	limit: Limit
		 * 
		 * Options:
		 */
		langbacklinks: function(langs, titles, limit, options) {
			var params = {
				list: 'langbacklinks',
				lbllang: langs
			};
			if(titles !== true) {params.lbltitle = titles;}
			if(limit) {params.lbllimit = limit;}
			B3.util.softmerge(params, options, 'lbl');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		langbacklinks: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('exturlusage', {
	type: 'list',
	prefix: 'eu',
	generator: true,
	query_generators: {
		/* List pages that use the specified external links
		 * 
		 * Args:
		 * 	protocol: the protocol to look for (eg. 'http://' of 'http://www.google.com')
		 * 	links: the url to look for (eg. 'www.google.com' of 'http://www.google.com')
		 * 	limit: Limit
		 * 
		 * Options:
		 */
		exturlusage: function(protocol, links, limit, options) {
			var params = {
				list: 'exturlusage',
			};
			if(protocol !== true) {params.euprotocol = titles;}
			if(links !== true) {params.euquery = titles;}
			if(limit) {params.eulimit = limit;}
			B3.util.softmerge(params, options, 'eu');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		exturlusage: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('search', {
	type: 'list',
	prefix: 'sr',
	generator: true,
	query_generators: {
		/* Get search results
		 * 
		 * Args:
		 * 	search: The title to search for, or an array of titles to search for
		 * 	namespaces: namespaces to search in
		 * 	prop: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	size: Page size
		 * 	wordcount: Word count
		 * 	timestamp: Time of last edit
		 * 	score: Search score
		 * 	snippet: HTML snippet of page text
		 * 	titlesnippet: HTML snippet of page title
		 * 	redirectsnippet: HTML snippet of redirect
		 * 	redirecttitle: Page pointed to by redirect
		 * 	sectionsnippet: HTML snippet of section
		 * 	sectiontitle: Title of section
		 * 	hasrelated: Did you mean?
		 * 
		 * Options:
		 * 	what: Find title, text, or nearmatch
		 * 	redirects: Include redirects
		 */
		search: function(search, namespaces, prop, limit, options) {
			if(typeof namespaces != 'string') {namespaces = namespaces.join('|');}
			if(typeof prop != 'string') {prop = prop.join('|');}

			var params = {
				list: 'search',
				srsearch: search,
			};
			if(namespaces !== true) {params.srnamespace = namespaces;}
			if(prop !== true) {params.srprop = prop;}
			B3.util.softmerge(params, options, 'sr');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		search: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('random', {
	type: 'list',
	prefix: 'rn',
	generator: true,
	query_generators: {
		/* Return a random page
		 * 
		 * Args:
		 * 	namespace: Namespace to find pages in
		 * 
		 * Options:
		 * 	redirect: Find a random redirect instead of page
		 */
		random: function(namespace, options) {
			var params = {
				list: 'random',
				rnnamespace: namespace,
			};
			B3.util.softmerge(params, options, 'rn');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		random: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('protectedtitles', {
	type: 'list',
	prefix: 'pt',
	generator: true,
	query_generators: {
		/* List create protected titles
		 * 
		 * Args:
		 * 	namespace: Namespace to list titles in
		 * 
		 * Props:
		 * 	timestamp: Timestamp from protection log
		 * 	user: User who protected the page
		 * 	userid: ID of user
		 * 	comment: Summary
		 * 	parsedcomment: HTML of summary
		 * 	expiry: Protection expiry
		 * 	level: Protection level
		 * Default: timestamp, level
		 * 
		 * Options:
		 * 	level: Only show pages at this protection level
		 * 	dir: Oldest or newest first
		 * 	start: Timestamp to start from
		 * 	end: Timestamp to end at	
		 */
		protectedtitles: function(namespace, prop, limit, options) {
			if(typeof prop != 'string' && prop !== true) {prop = prop.join('|');}

			var params = {
				list: 'protectedtitles',
				ptnamespace: namespace,
				ptlimit: limit,
			};
			if(prop !== true) {params.ptprop = prop;}
			B3.util.softmerge(params, options, 'pt');
			return params;
		}
	},
	param_generators: {},
	query_mergers: {
		protectedtitles: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('querypage', {
	type: 'list',
	prefix: 'qp',
	generator: true,
	query_generators: {
		/* Get maintenance reports
		 * 
		 * Args:
		 * 	page: Page to get results from
		 * 	limit: Limit
		 * 
		 * Pages:
		 * 	Ancientpages: Pages that haven't been edited in a while
		 * 	BrokenRedirects: Redirects that go pages that don't exist
		 * 	Deadendpages: Pages that don't link to anything
		 * 	Disambiguations: 
		 * 	DoubleRedirects: Redirects that go to other redirects
		 * 	Listredirects: All redirects
		 * 	Lonelypages: Pages that aren't linked to
		 * 	Longpages: Large pages
		 * 	Mostcategories: 
		 * 	Mostimages: 
		 * 	Mostlinkedcategories: 
		 * 	Mostlinkedtemplates: 
		 * 	Mostlinked: 
		 * 	Mostrevisions: 
		 * 	Fewestrevisions: 
		 * 	Shortpages: Small pages
		 * 	Uncategorizedcategories: Categories that haven't been categorized
		 * 	Uncategorizedpages: Pages with no categories
		 * 	Uncategorizedimages: Files with no categories
		 * 	Uncategorizedtemplates: Templates with no categories
		 * 	Unusedcategories: Categories with no pages in them
		 * 	Unusedimages: Files that aren't used on any page
		 * 	Wantedcategories: Redlink categories
		 * 	Wantedfiles: Redlink files
		 * 	Wantedpages: Redlink pages
		 * 	Wantedtemplates: Redlink templates
		 * 	Unwatchedpages: Pages no one is watching
		 * 	Unusedtemplates: Templates that aren't transcluded anywhere
		 * 	Withoutinterwiki: Pages with no interwiki links
		 * 
		 * Options:
		 */
		querypage: function(page, limit, options) {
			var params = {
				list: 'querypage',
				qppage: page,
			};
			if(limit) {params.qplimit = limit;}
			B3.util.softmerge(params, options, 'qp');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		querypage: B3.modules.page_querymerger,
	},
});

B3.modules.register_query('usercontribs', {
	type: 'list',
	prefix: 'uc',
	generator: false,
	query_generators: {
		/* List users' contributions
		 * 
		 * Args:
		 * 	props: Props
		 * 	limit: Limit
		 * 
		 * Props:
		 * 	ids: Page id, revision id
		 * 	title: Page title
		 * 	timestamp: Timestamp
		 * 	comment: Edit summary
		 * 	parsedcomment: HTML of summary
		 * 	size: Page size
		 * 	flags: Flags
		 * 	patrolled: Notes if edit was patrolled
		 * 	tags: Tags
		 * Default: ids, title, timestamp, comment, size, flags
		 * 
		 * Options:
		 * 	start: Start timestamp
		 * 	end: End timestamp
		 * 	dir: Oldest or newest first
		 * 	namespace: Filter to this namespace
		 * 	show: 
		 * 	tag: Filter to this tag
		 * 	toponly: Only show the last edit to a page
		 */
		usercontribs: function(props, limit, options) {
			if(typeof props != 'string' && props !== true) {props = props.join('|');}

			var params = {
				qmodule: 'usercontribs',
				list: 'usercontribs',
			};
			if(props !== true) {params.ucprop = props;}
			if(limit) {params.uclimit = limit;}

			B3.util.softmerge(params, options, 'uc');
			return params;
		},
	},
	param_generators: {
		users: function(params, user) {
			params.ucuser = user.name;
		},
	},
	query_mergers: {
		usercontribs: B3.modules.page_querymerger,
	},
});
