



/*------------------------------------------------------------------------------------------------
	action=query&meta=
 
	Common arguments:
		props - properties to get
		options - optional additional module-specific parameters to send with the request
  ------------------------------------------------------------------------------------------------*/

//FIXME: hack for making these visible when we register metainfo
window.dm_set = function(query, module) {B3.m[module] = query;}
window.dm_name_map = function(query, module) {
	B3.m[module] = {};
	for(var i = 0; i < query.length; i++) {B3.m[module][query[i].name] = query[i];}
},
window.dm_code_all = function(query, module) {
	B3.m[module] = {};
	for(var i = 0; i < query.length; i++) {B3.m[module][query[i].code] = query[i]['*'];}
}

B3.modules.metainfo_pgen = function(module, short, props, options) {
	if(typeof props != 'string') {props = props.join('|');}

	var params = {
		meta: module,
	};
	params[short + 'prop'] = props;
	B3.util.softmerge(params, options, short);
	return params;
};

B3.modules.register_query('siteinfo', {
	type: 'meta',
	prefix: 'si',
	generator: false,
	query_generators: {
		siteinfo: function(props, options) {return B3.modules.metainfo_pgen('siteinfo', 'si', props, options);},
	},
	param_generators: {},
	query_mergers: {
		dbreplag: function(query) {
			if(!B3.m.dbreplag) {B3.m.dbreplag = {};}
			for(var i = 0; i < query.length; i++) {B3.m.dbreplag[query[i].host] = query[i].lag;}
		},
		extensions: dm_name_map,
		extensiontags: dm_set,
		fileextensions: function(query) {
			B3.m.fileextensions = [];
			for(var i = 0; i < query.length; i++) {B3.m.fileextensions.push(query[i].ext);}
		},
		functionhooks: dm_set,
		general: dm_set,
		interwikimap: function(query) {
			if(!B3.m.interwikimap) {B3.m.interwikimap = {};}
			for(var i = 0; i < query.length; i++) {B3.m.interwikimap[query[i].prefix] = query[i];}
		},
		languages: dm_code_all,
		magicwords: dm_name_map,
		namespacealiases: function(query) {
			B3.m.namespacealiases = {};
			for(var i = 0; i < query.length; i++) {
				var id = query[i].id;
				if(!B3.m.namespacealiases[id]) {B3.m.namespacealiases[id] = [];}
				B3.m.namespacealiases[id].push(query[i]['*']);
			}
		},
		namespaces: dm_set,
		protocols: dm_set,
		rightsinfo: dm_set,
		showhooks: function(query) {
			B3.m.showhooks = {};
			for(var i = 0; i < query.length; i++) {B3.m.showhooks[query[i].name] = query[i].subscribers;}
		},
		skins: dm_code_all,
		specialpagealiases: function(query) {
			B3.m.specialpagealiases = {};
			for(var i = 0; i < query.length; i++) {B3.m.specialpagealiases[query[i].realname] = query[i].aliases;}
		},
		statistics: dm_set,
		usergroups: dm_name_map,
	},
});
B3.modules.register_query('userinfo', {
	type: 'meta',
	prefix: 'ui',
	generator: false,
	query_generators: {
		userinfo: function(props, options) {return B3.modules.metainfo_pgen('userinfo', 'ui', props, options);},
	},
	param_generators: {},
	query_mergers: {
		userinfo: dm_set,
	},
});

delete window.dm_set;
delete window.dm_name_map;
delete window.dm_code_all;

B3.modules.register_query('allmessages', {
	type: 'meta',
	prefix: 'am',
	generator: false,
	query_generators: {
		allmessages: function(messages, options) {
			if(typeof messages != 'string') {messages = messages.join('|');}

			var params = {
				meta: 'allmessages',
				ammessages: messages,
			};

			B3.util.softmerge(params, options, 'am');
			return params;
		},
	},
	param_generators: {},
	query_mergers: {
		allmessages: function(query) {
			if(!B3.m.allmessages) {B3.m.allmessages = {};}
			for(var i = 0; i < query.length; i++) {B3.m.allmessages[query[i].name] = query[i]['*'];}
		},
	},
});
