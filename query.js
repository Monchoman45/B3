



/*------------------------------------------------------------------------------------------------
     api.php?action=query

     Common arguments:
  ------------------------------------------------------------------------------------------------*/

B3.query.query = function(titles, modules, complete, success, failure) {
	if(typeof titles != 'string') {titles = titles.join('|');}

	var params = {action: 'query'};
	if(titles) {params.titles = titles;} //api.list will pass an empty string

	B3.util.driver_merge(params, modules);

	return new B3.classes.Task('GET', B3.settings.apipath, params, {}, complete, [B3.api.callback_querymerge, success], failure);
}
B3.query.list = function(modules, complete, success, failure) {return B3.query.query('', modules, complete, success, failure);}
B3.query.meta = function(modules, complete, success, failure) {return B3.query.query('', modules, complete, success, failure);}

B3.query.generator = function(generator, modules, complete, success, failure) {
	var params = {action: 'query'};
	for(var i in generator) {
		if(i == 'prop' || i == 'list' || i == 'meta') {params.generator = generator[i];}
		else {params['g' + i] = generator[i];}
	}
	B3.util.driver_merge(params, modules);

	return new B3.classes.Task('GET', B3.settings.apipath, params, {}, complete, [B3.api.callback_querymerge, success], failure);
}

B3.api.callback_querymerge = function(request, response) {B3.util.query_merge(this.data, response);}

B3.api.token_regen = function(success, failure) {
	if(!B3.token) {return;} //already getting a new one

	//FIXME: put at the beginning of the queue
	B3.query.query('#', [B3.api.token('edit')], false, [function(request, response) {
		B3.token = response.query.pages[-1].edittoken;
	}, success], failure).run();
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
	}
}
