



/*------------------------------------------------------------------------------------------------
     api.php?action=
     TODO: query, expandtemplates, parse, compare, edit, upload, filerevert, watch, patrol
     Maybe: login, logout, opensearch abusefilterchecksyntax, abusefilterevalexpression, abusefilterunblockautopromote, abusefiltercheckmatch

     Common arguments:
       titles or users - A single page/user or an array of pages/users to act on
       reason or summary - Optional edit summary for action
       success - A function run when a single action has been completed without errors (eg. one page deleted)
       failure - A function run when a single action was unable to be completed (eg. one page can't be deleted because it doesn't exist)
       error - A function run when an error occurs in a dependent request (eg. not allowed to fetch tokens)
       complete - A function run when all targets have been processed, whether successfully or otherwise
  ------------------------------------------------------------------------------------------------*/

/*
 * Delete pages
 *
 * success - passed
 * failure - passed
 * error - deletetoken
 * complete - passed
 */
B3.api.delete = function(titles, reason, success, failure, error, complete) {
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

	return job.deletetoken(titles, function(tokens) {
		for(var i = 0; i < tokens.length; i++) {
			if(!tokens[i]) {
				if(typeof failure == 'function') {failure('missing', titles[i]);}
				titles.splice(i, 1);
				tokens.splice(i, 1);
			}
		}

		if(titles.length > 0) {
			job.request('POST', {
				action: 'delete',
				title: titles,
				reason: reason,
				token: tokens
			}, success, failure, complete);
		}
	}, error);
}

/*
 * Undelete whole pages (for specific revisions, use deletedrevs to fetch tokens while selecting revisions to restore)
 *
 * success - passed
 * failure - passed
 * error - undeletetoken
 * complete - TODO: unimplemented
 */
B3.api.undelete = function(titles, reason, success, failure, error, complete) {
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

	return job.undeletetoken(titles, function(token, title) {
		var request = {
			action: 'undelete',
			title: title,
			token: token
		};
		if(reason) {request.reason = reason;}

		job.request('POST', request, success, failure); //TODO: complete
	}, error);
}

/*
 * Move pages
 *
 * from - Single page or array of pages to move
 * to - Name(s) to move to. Must match from in length and order
 * success - passed
 * failure - passed
 * error - movetoken
 * complete - passed
 */
B3.api.move = function(from, to, reason, options, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof from == 'string') {from = from.split('|');}
	if(typeof to == 'string') {to = to.split('|');}
	if(!reason || typeof reason == 'object' || typeof reason == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = options;
		options = reason;
		reason = false;
	}
	if(!options || typeof options == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = options;
		options = {
			movetalk: true,
			movesubpages: true
		};
	}
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}

	return job.movetoken(from, function(tokens) {
		var request = {
			action: 'move',
			from: from,
			to: to,
			reason: reason,
			token: tokens
		};
		for(var i in options) {
			if(!request[i]) {request[i] = options[i];}
		}
		job.request('POST', request, success, failure, complete);
	}, error);
}

/*
 * Protect pages
 *
 * protections - Single object or array of objects matching titles of protections to apply to all pages
 *               eg. {edit: 'sysop'} or [{edit: 'sysop'}, {edit: 'autoconfirmed'}]
 * expiry - Single expiry or array of expiries matching titles
 * cascade - Optional boolean to use cascading protection
 * success - passed
 * failure - passed
 * error - protecttoken
 * complete - passed
 */
B3.api.protect = function(titles, protections, expiry, cascade, reason, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles == 'string') {titles = titles.split('|');}
	if(!(protections instanceof Array)) {
		var str = '';
		for(var i in protections) {str += i + '=' + protections[i] + '|';}
		if(str) {protections = str.slice(0, str.length - 1);}
		else {protections = '';}
	}
	else {
		for(var i = 0; i < protections.length; i++) {
			var str = '';
			for(var j in protections[i]) {str += j + '=' + protections[i][j] + '|';}
			if(str) {protections[i] = str.slice(0, str.length - 1);}
			else {protections[i] = '';}
		}
	}
	if(cascade == undefined || typeof cascade == 'string' || typeof hide == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = reason;
		reason = cascade;
		cascade = false;
	}
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

	return job.protecttoken(titles, function(tokens) {
		var request = {
			action: 'protect',
			title: titles,
			protections: protections,
			expiry: expiry,
			reason: reason,
			token: tokens
		};
		if(cascade) {request.cascade = 1;}
		job.request('POST', request, success, failure, complete);
	}, error);
}

/*
 * Rollback pages
 *
 * users - Single user or array of users (matching titles) whose edits will be reverted
 *         (this is to prevent revert conflicts - if someone gets there first, you could rollback their revert)
 * hide - Optional boolean for marking the reverted edits as bot edits
 * success - passed
 * failure - passed
 * error - rollbacktoken
 * complete - passed
 */
B3.api.rollback = function(titles, users, summary, hide, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles == 'string') {titles = titles.split('|');}
	if(summary == undefined || typeof summary == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = hide;
		hide = summary;
		summary = false;
	}
	if(hide == undefined || typeof hide == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = hide;
		hide = false;
	}
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}

	return job.rollbacktoken(titles, function(tokens, users) {
		var request = {
			action: 'rollback',
			title: titles,
			user: users,
			token: tokens
		};
		if(reason) {request.summary = summary;}
		if(hide) {request.markbot = '1';}
		job.request('POST', request, success, failure, complete);
	}, error);
}

/*
 * Purge pages
 *
 * success - passed
 * failure - passed
 */
B3.api.purge = function(titles, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles != 'string') {titles = titles.join('|');}

	return job.request('POST', {
		action: 'purge',
		titles: titles
	}, success, failure);
}

/*
 * Import an XML file
 *
 * success - passed
 * failure - passed
 * error - importtoken
 */
B3.api.import = function(xml, summary, success, failure, error) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(!summary || typeof summary == 'string') {
		failure = success;
		success = summary;
		summary = false;
	}
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}

	return job.importtoken(function(token) {
		var request = {
			action: 'import',
			xml: xml,
			token: token
		};
		if(summary) {request.summary = summary;}
		job.request('POST', request, true, success, failure);
	}, error);
}

/*
 * Block users
 *
 * success - passed
 * failure - passed
 * error - blocktoken
 * complete - passed
 */
B3.api.block = function(users, expiry, reason, options, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof users == 'string') {users = users.split('|');}
	if(!reason || typeof reason == 'object' || typeof reason == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = options;
		options = reason;
		reason = false;
	}
	if(!options || typeof options == 'function') {
		complete = error;
		error = failure;
		failure = success;
		success = options;
		options = {
			nocreate: '',
			autoblock: '',
			noemail: ''
		};
	}
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}

	return job.blocktoken(users, function(tokens) {
		var request = {
			action: 'block',
			user: users,
			token: tokens,
		};
		if(reason) {request.reason = reason;}
		for(var i in options) {
			if(!request[i]) {request[i] = options[i];}
		}
		job.request('POST', request, success, failure, complete);
	}, error);
}

/*
 * Unblock users
 *
 * success - passed
 * failure - passed
 * error - unblocktoken
 * complete - passed
 */
B3.api.unblock = function(users, reason, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof users == 'string') {users = users.split('|');}
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

	return job.unblocktoken(users, function(tokens) {
		var request = {
			action: 'unblock',
			user: users,
			token: tokens
		};
		if(reason) {request.reason = reason;}
		job.request('POST', request, success, failure, complete);
	}, error);
}

/*
 * Modify user rights
 *
 * add - Single right to add to all users (eg. 'sysop'),
 *       Array of rights to add to all users (eg. ['sysop', 'bureaucrat']), or
 *       Array of rights matching users to add to each individually (eg. [['sysop', 'bureaucrat'], ['rollback', 'patroller']])
 * remove - Same as add, except specified rights will be removed
 * success - passed
 * failure - passed
 * error - userrightstoken
 * complete - passed
 */
B3.api.userrights = function(users, add, remove, reason, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof users == 'string') {users = users.split('|');}
	if(typeof add != 'string') {
		if(typeof add[0] != 'string') {
			for(var i = 0; i < add.length; i++) {add[i] = add[i].join('|');}
		}
		else {add = add.join('|');}
	}
	if(typeof remove != 'string') {
		if(typeof remove[0] != 'string') {
			for(var i = 0; i < remove.length; i++) {remove[i] = remove[i].join('|');}
		}
		else {remove = remove.join('|');}
	}
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

	return job.userrightstoken(users, function(tokens) {
		var request = {
			action: 'userrights',
			user: users,
			add: add,
			remove: remove,
			token: tokens
		};
		if(reason) {request.reason = reason;}
		job.request('POST', request, success, failure, complete);
	}, error);
}

/*
 * Email users
 *
 * subject - the subject of the email
 * text - the body of the email
 * success - passed
 * failure - passed
 * error - emailtoken
 * complete - passed 
 */
B3.api.email = function(users, subject, text, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof users == 'string') {users = users.split('|');}
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}

	return job.emailtoken(users, function(tokens) {
		job.request('POST', {
			action: 'emailuser',
			target: users,
			subject: subject,
			text: text,
			token: tokens
		}, success, failure, complete);
	}, error);
}


/*----------- Higher level -----------*/

/*
 * Replace all instances of a string with another string
 *
 * TODO: merge the content and edittoken requests into one request
 *
 * find - the string to search for
 * replace - the string to replace all instances of `find` with
 * success - passed
 * failure - passed
 * error - content, edittoken
 * complete - passed
 */
B3.api.replace = function(titles, find, replace, summary, success, failure, error, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
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
	if(!error) {
		error = function(code, info) {throw new Error(code + ': ' + info);}
	}

	return job.content(titles, function(content) {
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
				job.request('POST', request, success, failure, complete);
			}, error);
		}
	}, error);
}

/*
 * Remove links from specified pages
 *
 * TODO: ignore spaces and the case of the first character of the namespace and the title
 *
 * links - array of links to remove
 * success - passed
 * failure - passed
 * error - query
 * complete - passed
 */
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

/*
 * Replace links
 *
 * TODO: ignore spaces and the case of the first character of the namespace and the title
 *
 * find - array of links to find
 * replace - array of links to replace with, matching find
 * success - passed
 * failure - passed
 * error - query
 * complete - passed
 */
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

/*
 * Remove all pages from a category
 *
 * TODO: ignore spaces and the case of the first character
 *
 * category - the category to remove pages from
 * success - passed
 * failure - passed
 * error - generator
 * complete - passed
 */
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

/*
 * Emulate the behavior of a rollback action without the rollback module (or right)
 *
 * users - Single user or array of users (matching titles) whose edits will be reverted
 * success - passed
 * failure - passed
 * error - edittoken, action=query&prop=revisions
 * complete - TODO: unimplemented
 */
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
}

/*----------- index.php functions -----------*/

/*
 * Delete pages via index.php
 *
 * Parameters are identical to delete
 */
B3.api.indexdelete = function(titles, reason, success, failure, error, complete) {
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

	return job.deletetoken(titles, function(tokens) {
		for(var i = 0; i < tokens.length; i++) {
			if(!tokens[i]) {
				if(typeof failure == 'function') {failure('missing', titles[i]);}
				titles.splice(i, 1);
				tokens.splice(i, 1);
			}
		}

		if(titles.length > 0) {
			job.request('POST', wgScript, {
				action: 'delete',
				title: titles,
				wpDeleteReasonList: 'other',
				wpReason: reason,
				wpEditToken: tokens,
				wpConfirmB: 'Delete page'
			}, success, failure, complete);
		}
	}, error);
}

/*----------- Tokens -----------*/

/*
 * Get tokens from prop=info
 *
 * token - Optional token to fetch. Defaults to 'edit'
 * success - Array of tokens matching titles. Missing tokens included as undefined
 * failure - passed
 */
B3.api.token = function(titles, token, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(!titles || typeof titles == 'function') {
		success = titles;
		failure = token;
		token = 'edit';
		titles = ['#']; //This normalizes to an empty string which apparently is valid. Giving an empty string returns []
	}
	else {
		if(typeof titles == 'string') {titles = titles.split('|');}
		if(!token || typeof token == 'function') {
			failure = success;
			success = token;
			token = 'edit';
		}
	}

	return job.request('GET', {
		action: 'query',
		prop: 'info',
		intoken: token,
		titles: titles.join('|')
	}, function(response) {
		if(response.warnings) {
			for(var i in response.query.pages) {
				if(!response.query.pages[i][token + 'token']) { //user can't perform action
					if(typeof failure == 'function') {failure.call(this, 'permissiondenied', response.warnings.info['*']);}
					return;
				}
				break;
			}
		}
		if(typeof success == 'function') {
			if(response.query.normalized) {
				for(var i in response.query.normalized) {
					for(var j = 0; j < titles.length; j++) {
						if(response.query.normalized[i].from == titles[j]) {titles[j] = response.query.normalized[i].to; break;}
					}
				}
			}
			var tokens = [];
			for(var i = 0; i < titles.length; i++) {
				for(var j in response.query.pages) {
					if(response.query.pages[j].title == titles[i]) {tokens[i] = response.query.pages[j][token + 'token']; break;}
				}
			}
			success.call(this, tokens);
		}
	}, failure);
}

/*
 * These are all fetched the same way, so they're aliases of token
 */
B3.api.edittoken = function(titles, success, failure) {return this.token(titles, 'edit', success, failure);}
B3.api.deletetoken = function(titles, success, failure) {return this.token(titles, 'delete', success, failure);}
B3.api.protecttoken = function(titles, success, failure) {return this.token(titles, 'protect', success, failure);}
B3.api.movetoken = function(titles, success, failure) {return this.token(titles, 'move', success, failure);}
B3.api.blocktoken = function(titles, success, failure) {return this.token(titles, 'block', success, failure);}
B3.api.unblocktoken = function(titles, success, failure) {return this.token(titles, 'unblock', success, failure);}
B3.api.emailtoken = function(titles, success, failure) {return this.token(titles, 'email', success, failure);}
B3.api.importtoken = function(success, failure) {return this.token('#', 'import', success, failure);}
B3.api.watchtoken = function(titles, success, failure) {return this.token(titles, 'watch', success, failure);}

/*
 * Get rollback tokens from prop=revisions
 *
 * success - Array of tokens matching titles. Missing tokens included as undefined
 * failure - passed
 */
B3.api.rollbacktoken = function(titles, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof titles == 'string') {titles = titles.split('|');}

	return job.request('GET', {
		action: 'query',
		prop: 'revisions',
		titles: titles.join('|'),
		rvprop: '',
		rvtoken: 'rollback'
	}, function(response) {
		if(response.warnings) {
			for(var i in response.query.pages) {
				if(!response.query.pages[i].revisions[0].rollbacktoken) { //user can't perform action
					if(typeof failure == 'function') {failure.call(this, 'permissiondenied', response.warnings.revisions['*']);}
					return;
				}
				break;
			}
		}
		if(typeof success == 'function') {
			if(response.query.normalized) {
				for(var i in response.query.normalized) {
					for(var j = 0; j < titles.length; j++) {
						if(response.query.normalized[i].from == titles[j]) {titles[j] = response.query.normalized[i].to; break;}
					}
				}
			}
			var tokens = [];
			for(var i = 0; i < titles.length; i++) {
				for(var j in response.query.pages) {
					if(response.query.pages[j].title == titles[i]) {tokens[i] = response.query.pages[j].revisions[0].rollbacktoken; break;}
				}
			}
			success.call(this, tokens);
		}
	}, failure);
}

/*
 * Get undelete tokens from list=deletedrevs
 *
 * success - A single token, and the title it came from
 * failure - passed
 * complete - Array of tokens matching titles. Missing tokens included as undefined
 */
B3.api.undeletetoken = function(titles, success, failure, complete) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	var tokens = [];

	return job.request('GET', {
		action: 'query',
		list: 'deletedrevs',
		titles: titles,
		drprop: 'token'
	}, function(response) {
		if(typeof complete == 'function') {
			if(response.query.normalized) {
				for(var i = 0; i < titles.length; i++) {
					if(response.query.normalized[0].from == titles[i]) {
						titles[i] = response.query.normalized[0].to;
						if(response.query.deletedrevs[0]) {tokens[i] = response.query.deletedrevs[0].token;}
					}
				}
			}
			else if(response.query.deletedrevs[0]) {
				for(var i = 0; i < titles.length; i++) {
					if(response.query.deletedrevs[0].title == titles[i]) {tokens[i] = response.query.deletedrevs[0].token;}
				}
			}
		}
		if(response.query.deletedrevs[0]) {
			if(typeof success == 'function') {success.call(this, response.query.deletedrevs[0].token, response.query.deletedrevs[0].title);}
		}
		else if(typeof failure == 'function') {failure.call(this, 'cantundelete', 'No deleted revisions are available');}
	}, failure, function() {
		if(typeof complete == 'function') {complete(tokens);}
	});
}

/*
 * Get patrol tokens from list=recentchanges
 *
 * limit - Optional number of tokens to fetch. Defaults to server default for rclimit on list=recentchanges
 * success - response.query.recentchanges
 * failure - passed
 */
B3.api.patroltoken = function(limit, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(!limit || typeof limit == 'function') {
		failure = success;
		success = limit;
		limit = false;
	}

	var request = {
		action: 'query',
		list: 'recentchanges',
		rcprop: 'title|ids',
		rctoken: 'patrol'
	};
	if(limit) {request.rclimit = limit;}
	return job.request('GET', request, function(response) {
		if(response.warnings && !response.query.recentchanges[0].patroltoken && typeof failure == 'function') {
			failure.call(this, 'permissiondenied', response.warnings.recentchanges['*']);
			return;
		}
		if(typeof success == 'function') {success.call(this, response.query.recentchanges);} //this could be better
	}, failure);
}

/*
 * Get userrights tokens from list=users
 *
 * success - Array of tokens matching titles. Missing tokens included as undefined
 * failure - passed
 */
B3.api.userrightstoken = function(users, success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}
	if(typeof users == 'string') {users = users.split('|');}

	return job.request('GET', {
		action: 'query',
		list: 'users',
		ususers: users.join('|'),
		ustoken: 'userrights'
	}, function(response) {
		if(response.warnings && !response.query.users[0].userrightsltoken && typeof failure == 'function') {
			failure.call(this, 'permissiondenied', response.warnings.userrights['*']);
			return;
		}
		if(typeof success == 'function') {
			if(response.query.normalized) {
				for(var i in response.query.normalized) {
					for(var j = 0; j < users.length; j++) {
						if(response.query.normalized[i].from == users[j]) {users[j] = response.query.normalized[i].to; break;}
					}
				}
			}
			var tokens = [];
			for(var i = 0; i < users.length; i++) {
				for(var j = 0; j < response.query.users.length; j++) {
					if(response.query.users[j].name == users[i]) {tokens[i] = response.query.users[j].userrightstoken; break;}
				}
			}
			success.call(this, tokens);
		}
	}, failure);
}

/*
 * Get a preferences token from meta=userinfo
 *
 * success - A single token
 * failure - passed
 */
B3.api.preferencestoken = function(success, failure) {
	if(this instanceof B3.jobs.Job) {var job = this;}
	else {var job = new B3.jobs.Job();}

	return job.request('GET', {
		action: 'query',
		meta: 'userinfo',
		uiprop: 'preferencestoken'
	}, function(response) {
		if(typeof success == 'function') {success.call(this, response.query.userinfo.preferencestoken);}
	}, failure);
}