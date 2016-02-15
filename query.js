



/*------------------------------------------------------------------------------------------------
	api.php?action=query

	Common arguments:
		complete: A function run when all targets have been processed, whether successfully or otherwise
		success: A function run when a single action has been completed without errors (eg. one page deleted)
		failure: A function run when a single action was unable to be completed (eg. one page wasn't deleted because it doesn't exist)
  ------------------------------------------------------------------------------------------------*/

//FIXME: these task generators are very similar
B3.modules.register_action('query', {
	task_generator: function(titles, modules, complete, success, failure) {
		if(typeof titles != 'string') {titles = titles.join('|');}

		var params = {
			module: 'query',
			qmodule: [],
			action: 'query',
			format: 'json', //FIXME:
		};
		if(titles) {params.titles = titles;} //api.list will pass an empty string

		B3.util.driver_merge(params, modules);

		var task = new B3.classes.Task(
			'GET', B3.settings.apipath, params, {},
			complete, success, failure
		);
		if(params.qmodule.length > 0) {
			var seen = {};
			for(var i = 0; i < params.qmodule.length; i++) {
				var pgens = B3.modules.query[params.qmodule[i]].param_generators;
				for(var j in pgens) {
					if(!seen[j]) {
						task.add_listener('generate_' + j, function(params) {
							var p = B3.util.copy(this.params);
							delete p.module;
							delete p.qmodule;
							B3.util.hardmerge(params, p);
						});
						seen[j] = true;
					}
					task.add_listener('generate_' + j, pgens[j]);
				}
			}
		}
		else {
			task.add_listener('compile', function() {
				var params = B3.util.copy(this.params);
				delete params.module;
				delete params.qmodule;
				this.add(params);
			});
		}
		return task;
	},
	param_generators: {},
	data_mergers: {},
});

B3.modules.register_action('generator', {
	task_generator: function(generator, modules, complete, success, failure) {
		var params = {
			module: 'generator',
			qmodule: [],
			action: 'query',
			format: 'json', //FIXME:
		};
		for(var i in generator) {
			if(i == 'prop' || i == 'list' || i == 'meta') {
				if(!B3.modules.query[generator[i]].generator) {throw new Error('B3: can\'t use `' + i + '=' + generator[i] + '` as a generator');}
				else {params.generator = generator[i];}
			}
			else {params['g' + i] = generator[i];}
		}
		B3.util.driver_merge(params, modules);

		var task = new B3.classes.Task(
			'GET', B3.settings.apipath, params, {},
			complete, success, failure
		);
		if(params.qmodule.length > 0) {
			var seen = {};
			for(var i = 0; i < params.qmodule.length; i++) {
				var pgens = B3.modules.query[params.qmodule[i]].param_generators;
				for(var j in pgens) {
					if(!seen[j]) {
						task.add_listener('generate_' + j, function(params) {
							var p = B3.util.copy(this.params);
							delete p.module;
							delete p.qmodule;
							B3.util.hardmerge(params, p);
						});
						seen[j] = true;
					}
					task.add_listener('generate_' + j, pgens[j]);
				}
			}
		}
		else {
			task.add_listener('compile', function() {
				var params = B3.util.copy(this.params);
				delete params.module;
				delete params.qmodule;
				this.add(params);
			});
		}
		return task;
	},
	param_generators: {},
	data_mergers: {},
});

B3.api.token_regen = function(success, failure) {
	if(!B3.token) {return;} //already getting a new one

	//FIXME: put at the beginning of the queue
	B3.action.query('#', [B3.api.token('edit')], success, function(request, response) {
		B3.token = response.query.pages[-1].edittoken;
	}, failure).run();
}

B3.api.token = function(token) {
	switch(token) {
		case 'edit':
		case 'delete':
		case 'protect':
		case 'move':
		case 'block':
		case 'unblock':
		case 'email':
		case 'import':
		case 'watch':
			return {
				prop: 'info',
				intoken: token,
			};
		case 'undelete':
			return {
				list: 'deletedrevs',
				drprop: 'token',
			};
		case 'rollback':
			return {
				prop: 'revisions',
				rvtoken: 'rollback',
			};
		/*case 'patrol': //FIXME: limit
			var params = {
				list: 'recentchanges',
				rcprop: 'title|ids',
				rctoken: 'patrol',
			};
			if(limit) {params.rclimit = limit;}
			return params;
		case 'userrights': //FIXME: needs users
			return {
				list: 'users',
				ususers: users.join('|'),
				ustoken: 'userrights',
			};*/
		case 'preferences':
			return {
				meta: 'userinfo',
				uiprop: 'preferencestoken',
			};
		default:
			return {
				prop: 'info',
				intoken: 'edit',
			};
	}
}
