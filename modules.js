B3.modules.register_action = function(name, module) {
	if(typeof module.task_generator != 'function') {throw new Error('B3: tried to register a bad action module `' + name + '`: typeof task_generator != \'function\'');}
	if(B3.modules.action[name]) {throw new Error('B3: tried to reregister action module `' + name + '`');}
	//TODO: other validating things

	B3.modules.action[name] = module;
	B3.action[name] = module.task_generator;

	for(var i in module.data_mergers) {
		if(!B3.modules.data_mergers[i]) {B3.modules.data_mergers[i] = [];}
		B3.modules.data_mergers[i].push(module.data_mergers[i]);
	}


	B3.call_listeners('action_module', name, module);
}

B3.modules.register_query = function(name, module) {
	if((!module.type || (module.type != 'prop' && module.type != 'list' && module.type != 'meta')) && name != '') {
		throw new Error('B3: tried to register a bad query module `' + name + '`: invalid type `' + module.type + '`');
	}
	if(B3.modules.query[name]) {throw new Error('B3: tried to reregister query module `' + name + '`');}
	//TODO: other validating things

	B3.modules.query[name] = module;
	for(var i in module.query_generators) {B3[module.type][i] = module.query_generators[i];}

	for(var i in module.query_mergers) {
		if(!B3.modules.query_mergers[i]) {B3.modules.query_mergers[i] = [];}
		B3.modules.query_mergers[i].push(module.query_mergers[i]);
	}

	B3.call_listeners('query_module', name, module);
}

B3.modules.page_querymerger = function(query) {
	for(var i = 0; i < query.length; i++) {
		var title = query[i].title;
		if(this.output_list.pages[title]) {B3.util.hardmerge(this.output_list.pages[title], query[i]);}
		else {this.output_list.pages[title] = query[i];}
	}
}
B3.modules.user_querymerger = function(query) {
	for(var i = 0; i < query.length; i++) {
		var user = query[i].name;
		if(this.output_list.users[user]) {B3.util.hardmerge(this.output_list.users[user], query[i]);}
		else {this.output_list.users[user] = query[i];}
	}
}

B3.modules.register_action('', {
	task_generator: function() {throw new Error('B3: task generator was called for null action');},
	param_generators: {
		pages: function() {throw new Error('B3: param generator was called for null action');},
		users: function() {throw new Error('B3: param generator was called for null action');},
	},
	data_mergers: {
		limits: B3.util.null,
		'query-continue': B3.util.null, //FIXME:
		warnings: B3.util.null, //FIXME:
		normalized: function(query) {
			for(var i = 0; i < query.length; i++) {
				var from = query[i].from;
				var to = query[i].to;
				if(this.output_list.pages[from]) {
					this.output_list.pages[to] = this.output_list.pages[from];
					delete this.output_list.pages[from];
				}
			}
		},
	},
});

B3.modules.register_query('', {
	type: '',
	prefix: '',
	generator: false,
	query_generators: {},
	param_generators: {},
	query_mergers: {
		pages: function(query) { //?action=query&titles=anything
			for(var i in query) {
				var title = query[i].title;
				if(this.output_list.pages[title]) {B3.util.hardmerge(this.output_list.pages[title], query[i]);}
				else {this.output_list.pages[title] = query[i];}
			}
		},
	},
});
