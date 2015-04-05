



/*------------------------------------------------------------------------------------------------
	api.php?action=
	TODO: expandtemplates, parse, compare, edit, upload, filerevert, watch, patrol
	Maybe: opensearch, abusefilterchecksyntax, abusefilterevalexpression, abusefilterunblockautopromote, abusefiltercheckmatch

	Common arguments:
		reason or summary - Optional edit summary for action
		complete - A function run when all targets have been processed, whether successfully or otherwise
		success - A function run when a single action has been completed without errors (eg. one page deleted)
		failure - A function run when a single action was unable to be completed (eg. one page wasn't deleted because it doesn't exist)
  ------------------------------------------------------------------------------------------------*/

//Delete pages
B3.action.delete = function(reason, options, complete, success, failure) {
	return new B3.classes.Task('POST', B3.settings.apipath, function(params, page, type) {
		if(type != 'pages') {return;}

		params.action = 'delete';
		params.title = page.title;
		params.reason = reason;
		if(page.deletetoken) {params.token = page.deletetoken;}
		else {params.token = B3.token;}

		B3.util.softmerge(params, options);
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}

//Undelete whole pages (for specific revisions, use deletedrevs to fetch tokens while selecting revisions to restore)
B3.action.undelete = function(reason, options, complete, success, failure) {
	return new B3.classes.Task('POST', B3.settings.apipath, function(params, page, type) {
		if(type != 'pages') {return;}

		params.action = 'undelete';
		params.title = page.title;
		params.reason = reason;
		if(page.token) {params.token = page.token;}
		else {params.token = B3.token;}

		B3.util.softmerge(params, options);
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}

// Move pages
//
// translator - a function that receives a source page name, and must return the corresponding destination page name.
B3.action.move = function(translator, reason, options, complete, success, failure) {
	if(!Object.getOwnPropertyNames(options).length > 0) {
		options.movetalk = true;
		options.movesubpages = true;
	}

	return new B3.classes.Task('POST', B3.settings.apipath, function(params, page, type) {
		if(type != 'pages') {return;}

		var to = translator(page.title);
		if(!to || to == page.title) {return;}

		params.action = 'move';
		params.from = page.title;
		params.to = to;
		params.reason = reason;
		if(page.movetoken) {params.token = page.movetoken;}
		else {params.token = B3.token;}

		B3.util.softmerge(params, options);
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}

// Protect pages
//
// protections - Protections to apply to all pages (eg. {edit: 'sysop', move: 'sysop'})
// expiry - Protection expiry (eg. '1 day')
B3.action.protect = function(protections, expiry, reason, options, complete, success, failure) {
	if(typeof protections != 'string') {
		var str = '';
		for(var i in protections) {str += i + '=' + protections[i] + '|';}
		if(str) {protections = str.substring(0, str.length - 1);}
		else {protections = '';}
	}

	return new B3.classes.Task('POST', B3.settings.apipath, function(params, page, type) {
		if(type != 'pages') {return;}

		params.action = 'protect';
		params.title = page.title;
		params.protections = protections;
		params.expiry = expiry;
		params.reason = reason;
		if(page.protecttoken) {params.token = page.protecttoken;}
		else {params.token = B3.token;}

		B3.util.softmerge(params, options);
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}

// Rollback pages
//
// user - User who made the edits being rollbacked
//         (this is to prevent revert conflicts - if someone gets there first, you could rollback their revert)
B3.action.rollback = function(user, summary, options, complete, success, failure) {
	return new B3.classes.Task('POST', B3.settings.apipath, function(params, page, type) {
		if(type != 'pages') {return;}

		params.action = 'rollback';
		params.title = page.title;
		params.user = user;
		if(page.rollbacktoken) {params.token = page.rollbacktoken;}
		else {params.token = B3.token;}
		if(summary) {params.summary = summary;}

		B3.util.softmerge(params, options);
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}

//Purge pages
B3.action.purge = function(complete, success, failure) {
	return new B3.classes.Task('POST', B3.settings.apipath, function(params, page, type) {
		if(type != 'pages') {return}

		//purge can do more than one page, so lump them together and then reject every other request
		//TODO: get this to only run once, then unbind itself so that we don't call this 20349390 times for no reason
		if(page == this.data.pages[0]) {
			params.action = 'purge';
			params.titles = page.title;
			for(var i = 1; i < this.pages.length; i++) {params.titles += '|' + this.pages[i].title;}
		}
	}, {}, complete, success, failure);
}

//Import an XML file
B3.action.import = function(xml, summary, complete, success, failure) {
	var params = {
		action: 'import',
		xml: xml,
		token: B3.token,
	};
	if(summary) {params.summary = summary;}

	return new B3.classes.Task('POST', B3.settings.apipath, params, {upload: true}, complete, success, failure);
}

//Block users
B3.action.block = function(expiry, reason, options, complete, success, failure) {
	if(Object.getOwnPropertyNames(options).length > 0) {
		options.nocreate = true;
		options.autoblock = true;
		options.noemail = true;
	}

	return new B3.classes.Task('POST', B3.settings.apipath, function(params, user, type) {
		if(type != 'users') {return;}

		params.action = 'block';
		params.user = user.name;
		params.expiry = expiry;
		params.reason = reason;
		if(page.blocktoken) {params.token = page.blocktoken;}
		else {params.token = B3.token;}

		B3.util.softmerge(params, options);
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}

//Unblock users
B3.action.unblock = function(reason, complete, success, failure) {
	return new B3.classes.Task('POST', B3.settings.apipath, function(params, user, type) {
		if(type != 'users') {return;}

		params.action = 'unblock';
		params.user = user.name;
		params.reason = reason;
		if(page.unblocktoken) {params.token = page.unblocktoken;}
		else {params.token = B3.token;}
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}

// Modify user rights
//
// add - Array of rights to add to all users (eg. ['sysop', 'bureaucrat']
// remove - Same as add, except specified rights will be removed
B3.action.userrights = function(add, remove, reason, complete, success, failure) {
	if(typeof add != 'string') {add = add.join('|');}
	if(typeof remove != 'string') {remove = remove.join('|');}

	return new B3.classes.Task('POST', B3.settings.apipath, function(params, user, type) {
		if(type != 'users') {return;}

		params.action = 'userrights';
		params.user = user.name;
		params.add = add;
		params.remove = remove;
		params.reason = reason;
		if(page.userrightstoken) {params.token = page.userrightstoken;}
		else {params.token = B3.token;}
	}, {}, complete, [B3.api.callback_querymerge, success], failure);
}

// Email users
//
// subject - the subject of the email
// text - the body of the email
B3.action.email = function(subject, text, options, complete, success, failure) {
	return new B3.classes.Task('POST', B3.settings.apipath, function(params, user, type) {
		if(type != 'users') {return;}

		params.action = 'emailuser';
		params.target = user.name;
		params.subject = subject;
		params.text = text;
		params.token = user.emailtoken;
		if(page.emailtoken) {params.token = page.emailtoken;}
		else {params.token = B3.token;}

		B3.util.softmerge(params, options);
	}, {}, complete, success, failure);
}

/*----------- Higher level -----------*/

// Replace all instances of a string with another string
//
// TODO: merge the content and edittoken requests into one request
//
// find - the string to search for
// replace - the string to replace all instances of `find` with
/*B3.api.replace = function(titles, find, replace, summary, success, failure, error, complete) {
	if(typeof titles == 'string') {titles = titles.split('|');}
	if(typeof find == 'string') {find = [find];}
	if(typeof replace == 'string') {replace = [replace];}
	if(!summary || typeof summary == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = summary;
		summary = false;
	}
	if(!error) {error = B3.settings.defaulterror;}

	return B3.api.content(titles, function(content) {
		for(var i = 0; i < content.length; i++) {
			if(!content[i]) {
				if(typeof failure == 'function') {failure('missing', titles[i]);}
				titles.splice(i, 1);
				tokens.splice(i, 1);
			}
			for(var j = 0; j < find.length; j++) {
				if(j >= replace.length) {var rindex = replace.length - 1;}
				else {var rindex = j;}
				while(content[i].indexOf(find[j]) != -1) {content[i] = content[i].replace(find[j], replace[rindex]);}
			}
		}

		if(titles.length > 0) {
			job.edittoken(titles, function(tokens) {
				var request = {
					action: 'edit',
					title: titles,
					text: content,
					token: tokens
				};
				if(summary) {request.summary = summary;}
				this.task.add('POST', request, success, failure, complete);
			}, error);
		}
	}, error);
}

// Remove links from specified pages
//
// TODO: ignore spaces and the case of the first character of the namespace and the title
//
// links - array of links to remove
B3.api.unlink = function(titles, links, summary, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles == 'string') {titles = titles.split('|');}
	if(typeof links == 'string') {links = links.split('|');}
	if(!summary || typeof summary == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = summary;
		summary = false;
	}
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}

	job.request('GET', {
		action: 'query',
		titles: titles.join('|'),
		prop: 'revisions|info',
		rvprop: 'content',
		intoken: 'edit'
	}, function(response) {
		var pages = response.query.pages;
		var texts = [];
		var tokens = [];
		if(response.query.normalized) {
			for(var i in response.query.normalized) {
				for(var j = 0; j < titles.length; j++) {
					if(response.query.normalized[i].from == titles[j]) {titles[j] = response.query.normalized[i].to; break;}
				}
			}
		}
		for(var i in response.query.pages) {
			if(i < 0) {
				for(var j = 0; j < titles.length; j++) {
					if(titles[j] == response.query.pages[i].title) {titles.splice(j, 1); break;}
				}
				if(typeof failure == 'function') {failure.call(this, 'missingtitle', 'Page ' + response.query.pages[i].title + ' does not exist');}
				continue;
			}

			var pagetext = response.query.pages[i].revisions[0]['*'];
			for(var j = 0; j < links.length; j++) {
				var index = 0; //using this will hopefully make this faster on large pages
				var ref = 0; //ditto
				while((index = pagetext.indexOf('[[' + links[j] + ']]', ref)) != -1) {
					ref = index;
					pagetext = pagetext.substring(0, index) + links[j] + pagetext.substring(pagetext.indexOf(']]', index) + 2);
				}
				ref = 0;
				while((index = pagetext.indexOf('[[' + links[j] + '|', ref)) != -1) {
					ref = index;
					pagetext = pagetext.substring(0, index) + pagetext.substring(pagetext.indexOf('|', index) + 1, pagetext.indexOf(']]', index)) + pagetext.substring(pagetext.indexOf(']]', index) + 2);
				}
			}
			for(var j = 0; j < titles.length; j++) {
				if(titles[j] == response.query.pages[i].title) {
					texts[j] = pagetext;
					tokens[j] = response.query.pages[i].edittoken;
					break;
				}
			}
		}

		var request = {
			action: 'edit',
			title: titles,
			text: texts,
			token: tokens
		};
		if(summary) {request.summary = summary;}
		job.request('POST', request, success, failure, complete);
	}, error);
}

// Replace links
//
// TODO: ignore spaces and the case of the first character of the namespace and the title
//
// find - array of links to find
// replace - array of links to replace with, matching find
B3.api.relink = function(titles, find, replace, summary, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles == 'string') {titles = titles.split('|');}
	if(typeof find == 'string') {find = find.split('|');}
	if(typeof replace == 'string') {replace = replace.split('|');}
	if(!summary || typeof summary == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = summary;
		summary = false;
	}
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}
 
	job.request('GET', {
		action: 'query',
		titles: titles.join('|'),
		prop: 'revisions|info',
		rvprop: 'content',
		intoken: 'edit'
	}, function(response) {
		var pages = response.query.pages;
		var texts = [];
		var tokens = [];
		if(response.query.normalized) {
			for(var i in response.query.normalized) {
				for(var j = 0; j < titles.length; j++) {
					if(response.query.normalized[i].from == titles[j]) {titles[j] = response.query.normalized[i].to; break;}
				}
			}
		}
		for(var i in response.query.pages) {
			if(i < 0) {
				for(var j = 0; j < titles.length; j++) {
					if(titles[j] == response.query.pages[i].title) {titles.splice(j, 1); break;}
				}
				if(typeof failure == 'function') {failure.call(this, 'missingtitle', 'Page ' + response.query.pages[i].title + ' does not exist');}
				continue;
			}
 
			var pagetext = response.query.pages[i].revisions[0]['*'];
			for(var j = 0; j < find.length; j++) {
				var index = 0; //using this will hopefully make this faster on large pages
				var ref = 0; //ditto
				while((index = pagetext.indexOf('[[' + find[j] + ']]', ref)) != -1) {
					ref = index;
					pagetext = pagetext.replace('[[' + find[j] + ']]', '[[' + replace[j] + ']]');
				}
				ref = 0;
				while((index = pagetext.indexOf('[[' + find[j] + '|', ref)) != -1) {
					ref = index;
					pagetext = pagetext.substring(0, index) + '[[' + replace[j] + pagetext.substring(pagetext.indexOf('|', index), pagetext.indexOf(']]', index)) + pagetext.substring(pagetext.indexOf(']]', index));
				}
			}
			for(var j = 0; j < titles.length; j++) {
				if(titles[j] == response.query.pages[i].title) {
					texts[j] = pagetext;
					tokens[j] = response.query.pages[i].edittoken;
					break;
				}
			}
		}
 
		var request = {
			action: 'edit',
			title: titles,
			text: texts,
			token: tokens
		};
		if(summary) {request.summary = summary;}
		job.request('POST', request, success, failure, complete);
	}, error);
}

// Remove all pages from a category
//
// TODO: ignore spaces and the case of the first character
//
// category - the category to remove pages from
B3.api.uncategorize = function(category, summary, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(category.indexOf('Category:') != 0) {category = 'Category:' + category;}
	if(!summary || typeof summary == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = summary;
		summary = false;
	}
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}

	job.request('GET', {
		action: 'query',
		generator: 'categorymembers',
		gcmtitle: category,
		gcmlimit: 5000,
		prop: 'revisions|info',
		rvprop: 'content',
		intoken: 'edit'
	}, function(pages) {
		pages = pages.query.pages;
		var titles = [];
		var texts = [];
		var tokens = [];
		for(var i in pages) {
			titles.push(pages[i].title);
			tokens.push(pages[i].edittoken);
			var pagetext = pages[i].revisions[0]['*'];
			while(pagetext.indexOf('[[' + category + ']]') != -1) {pagetext = pagetext.replace('[[' + category + ']]', '');}
			while(pagetext.indexOf('[[' + category + '|') != -1) {pagetext = pagetext.substring(0, pagetext.indexOf('[[' + category + '|')) + pagetext.substring(pagetext.indexOf(']]', pagetext.indexOf('[[' + category + '|')) + 2);}
			texts.push(pagetext);
		}

		var request = {
			action: 'edit',
			title: titles,
			text: texts,
			token: tokens
		};
		if(summary) {request.summary = summary;}
		job.request('POST', request, success, failure, complete);
	}, error);
}

// Emulate the behavior of a rollback action without the rollback module (or right)
//
// users - Single user or array of users (matching titles) whose edits will be reverted
B3.api.fakerollback = function(titles, users, reason, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles == 'string') {titles = titles.split('|');}
	if(!reason || typeof reason == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = reason;
		reason = false;
	}
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}

	//most of this is probably very bad
	return job.edittoken(titles, function(tokens) {
		job.request('GET', {
			action: 'query',
			prop: 'revisions',
			titles: titles,
			rvlimit: '5000'
		}, function(response) {
			for(var i in response.query.pages) {
				var user = '';
				var token = false;
				for(var j = 0; j < titles.length; j++) {
					if(titles[j] == response.query.pages[i].title) {
						token = tokens[j];
						if(typeof users == 'string') {user = users;}
						else {
							if(j < users.length) {user = users[j];}
							else {user = users[users.length - 1];}
						}
						break;
					}
				}
				if(!token) {
					if(typeof failure == 'function') {failure.call(this, 'notoken', 'No token was found');}
					return;
				}

				if(user != response.query.pages[i].revisions[0].user) {
					if(typeof failure == 'function') {failure.call(this, 'badtoken', 'Invalid token');} //I really think this should give a better error message
					return;
				}
				var j = 1;
				while(response.query.pages[i].revisions[j].user == user) {j++;}
				var request = {
					action: 'edit',
					title: response.query.pages[i].title,
					undo: response.query.pages[i].revisions[j].revid,
					undoafter: response.query.pages[i].revisions[0].revid,
					token: token
				};
				if(reason) {request.summary = reason;}
				job.request('POST', request, success, failure); //TODO: complete
			}
		}, error);
	}, error);
}*/

/*----------- index.php functions -----------*/

// Delete pages via index.php
//
// Parameters are identical to delete
/*B3.api.indexdelete = function(titles, reason, success, failure, error, complete) {
	if(!error) {error = B3.settings.defaulterror;}

	return B3.api.deletetoken(titles, function(tokens) {
		for(var i = 0; i < tokens.length; i++) {
			if(!tokens[i]) {
				if(typeof failure == 'function') {failure('missing', titles[i]);}
				titles.splice(i, 1);
				tokens.splice(i, 1);
			}
		}

		if(titles.length > 0) {
			this.task.add('POST', wgScript, {
				action: 'delete',
				title: titles,
				wpDeleteReasonList: 'other',
				wpReason: reason,
				wpEditToken: tokens,
				wpConfirmB: 'Delete page'
			}, success, failure, complete);
		}
	}, error);
}*/
