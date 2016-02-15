



/*------------------------------------------------------------------------------------------------
	api.php?action=
	TODO: expandtemplates, parse, compare, upload, filerevert, watch, patrol
	Maybe: opensearch, abusefilterchecksyntax, abusefilterevalexpression, abusefilterunblockautopromote, abusefiltercheckmatch

	Common arguments:
		complete: A function run when all targets have been processed, whether successfully or otherwise
		success: A function run when a single action has been completed without errors (eg. one page deleted)
		failure: A function run when a single action was unable to be completed (eg. one page wasn't deleted because it doesn't exist)
  ------------------------------------------------------------------------------------------------*/

/* Custom action for when there's no module for what you want to do
 * 
 * Args:
 * 	params: Params to send
 * 
 * Options:
 *
 * Examples:
 * 	B3.action.custom({
 * 		action: 'edit',
 * 		title: 'Foo',
 * 		text: 'bar'
 * 		token: B3.token,
 * 	})
 */
B3.modules.register_action('custom', {
	task_generator: function(params, complete, success, failure) {
		params.module = 'custom';

		var task = new B3.classes.Task(
			'POST', B3.settings.apipath, params, {},
			complete, success, failure
		);
		task.add_listener('compile', function() {
			var params = B3.util.copy(this.params);
			delete params.module;
			this.add(params);
		});
		return task;
	},
	param_generators: {},
	data_mergers: {},
});

/* Block users
 * 
 * Args:
 * 	expiry: Block length
 * 	reason: Edit summary
 * 
 * Options: (see [[mw:Help:Blocking users#Blocking]])
 * 	anononly: Only block IPs
 * 	nocreate: Prevent account creation
 * 	autoblock: Autoblock
 * 	noemail: Prevent user from sending email
 * 	hidename: Hide user from block log (requires revisiondelete)
 * 	allowusertalk: Allow user to edit their own talk page while blocked
 * 	reblock: Overwrite existing block (if one exists)
 * Default: nocreate, autoblock, noemail, reblock
 * 
 * Examples:
 * 	B3.action.block('3 days', 'trolling')
 * 	B3.action.block('infinite', 'school IP', {anononly: true})
 */
B3.modules.register_action('block', {
	task_generator: function(expiry, reason, options, complete, success, failure) {
		if(!options) {options = {};}
		B3.util.softmerge(options, {
			anononly: false,
			nocreate: true,
			autoblock: true,
			noemail: true,
			hidename: false,
			allowusertalk: false,
			reblock: true,
		});

		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'block',
				expiry: expiry,
				reason: reason,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		users: function(params, user) {
			params.action = 'block';
			params.user = user.name;
			params.expiry = this.params.expiry;
			params.reason = this.params.reason;
			if(user.blocktoken) {params.token = user.blocktoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		block: B3.util.null, //TODO:
	},
});

/* Delete pages
 * 
 * Args:
 * 	reason: Edit summary
 * 
 * Options:
 * 
 * Examples:
 * 	B3.action.delete('spam')
 */
B3.modules.register_action('delete', {
	task_generator: function(reason, options, complete, success, failure) {
		if(!options) {options = {};}

		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'delete',
				reason: reason,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		pages: function(params, page) {
			params.action = 'delete';
			params.title = page.title;
			params.reason = this.params.reason;
			if(page.deletetoken) {params.token = page.deletetoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		delete: function(query) {
			//if(!this.input_list.pages[query.title]) {
				this.output_list.pages[query.title] = {
					title: query.title,
					missing: '',
				};
			/*}
			else {
				var page = this.input_list.pages[query.title];

				page.missing = '';
				if(page.new !== undefined) {delete page.new;}
				if(page.lastrevid) {delete page.lastrevid;}
				if(page.length) {delete page.length;}
				if(page.pageid) {delete page.pageid;}
				if(page.revisions) {delete page.revisions;}
				this.output_list.pages[query.title] = page;
			}*/
		},
	},
});

/* Save page text (requires the current pagelist to have revision content)
 * 
 * Args:
 * 	summary: Edit summary
 * 
 * Options:
 * 	minor: Mark as a minor edit
 * 	notminor: Mark as a not minor edit (if your prefs default to minor)
 * 	bot: Mark as bot
 * 	recreate: Ignore warnings about page deletion
 * 	createonly: Only save if the page doesn't exist
 * 	nocreate: Return an error (fail the request) if page exists already
 * 	md5: Hash of text, disqualify edit if text and hash don't match
 * 	redirect: Resolve redirects
 * 
 * Examples:
 * 	B3.action.edit('summary')
 */
B3.modules.register_action('edit', {
	task_generator: function(summary, options, complete, success, failure) {
		if(!options) {options = {};}
		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'edit',
				summary: summary,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		pages: function(params, page) {
			if(!page.revisions || !page.revisions[0]) {return false;}

			params.action = 'edit';
			params.title = page.title;
			params.summary = summary;
			params.text = page.revisions[0]['*'];
			if(page.edittoken) {params.token = page.edittoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		edit: function(query) {
			if(!this.input_list.pages[query.title]) {
				this.output_list.pages[query.title] = {
					title: query.title,
					lastrevid: query.newrevid,
					pageid: query.pageid,
				};
			}
			else {
				var page = this.input_list.pages[query.title];

				page.lastrevid = query.newrevid;
				if(page.missing !== undefined) {
					delete page.missing;
					page.pageid = query.pageid;
				}
				else if(page.new !== undefined) {delete page.new;}
				this.output_list.pages[query.title] = page;
			}
		},
	},
});

/* Prepend text to page
 * 
 * Args:
 * 	summary: Edit summary
 * 
 * Options:
 * 	minor: Mark as a minor edit
 * 	notminor: Mark as a not minor edit (if your prefs default to minor)
 * 	bot: Mark as bot
 * 	md5: Hash of text, disqualify edit if text and hash don't match
 * 	redirect: Resolve redirects
 * 
 * Examples:
 * 	B3.action.prependtext('{{delete|spam}}', 'spam')
 */
B3.modules.register_action('prependtext', {
	task_generator: function(text, summary, complete, success, failure) {
		if(!options) {options = {};}
		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'prependtext',
				text: text,
				summary: summary,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		pages: function(params, page) {
			params.action = 'edit';
			params.title = page.title;
			params.summary = summary;
			params.prependtext = this.params.text;
			if(page.edittoken) {params.token = page.edittoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {},
});

/* Append text to page
 * 
 * Args:
 * 	summary: Edit summary
 * 
 * Options:
 * 	minor: Mark as a minor edit
 * 	notminor: Mark as a not minor edit (if your prefs default to minor)
 * 	bot: Mark as bot
 * 	md5: Hash of text, disqualify edit if text and hash don't match
 * 	redirect: Resolve redirects
 * 
 * Examples:
 * 	B3.action.appendtext('[[Category:Foo]]', 'categorizing')
 */
B3.modules.register_action('appendtext', {
	task_generator: function(text, summary, complete, success, failure) {
		if(!options) {options = {};}
		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'appendtext',
				text: text,
				summary: summary,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		pages: function(params, page) {
			params.action = 'edit';
			params.title = page.title;
			params.summary = summary;
			params.appendtext = this.params.text;
			if(page.edittoken) {params.token = page.edittoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {},
});

/* Email users
 * 
 * Args:
 * 	subject: Subject
 * 	text: Message body
 * 
 * Options:
 * 	ccme: Send a copy of the email to yourself
 * 
 * Examples:
 * 	B3.action.email('Spam', 'Visit my annoying website!')
 */
B3.modules.register_action('email', {
	task_generator: function(subject, text, options, complete, success, failure) {
		if(!options) {options = {};}

		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'email',
				subject: subject,
				text: text,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		users: function(params, user) {
			params.action = 'emailuser';
			params.target = user.name;
			params.subject = this.params.subject;
			params.text = this.params.text;
			params.token = user.emailtoken;
			if(page.emailtoken) {params.token = page.emailtoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		email: B3.util.null,
	},
});

/* Import an XML file
 * 
 * Args:
 * 	xml: File to import
 * 	summary: Edit summary
 * 
 * Options:
 *
 * Examples:
 * 	B3.action.import(some_xml, 'merge from otherwiki.wikia.com')
 */
B3.modules.register_action('import', {
	task_generator: function(xml, summary, options, complete, success, failure) {
		var params = {
			action: 'import',
			xml: xml,
			token: B3.token,
		};
		if(summary) {params.summary = summary;}

		return new B3.classes.Task(
			'POST', B3.settings.apipath, params, {upload: true},
			complete, success, failure
		);
	},
	param_generators: {}, //FIXME: should we just not define this?
	data_mergers: {
		import: B3.util.null, //TODO:
	},
});

/* Move pages
 * 
 * Args:
 * 	translator: function(from) {}
 * 		Converts a source page name into a destination page name. If you return `false`, the page won't be moved.
 * 	reason: Edit summary
 * 
 * Options:
 * 	movetalk: Move associated talk page
 * 	movesubpages: Move any subpages
 * 	noredirect: Don't leave a redirect behind
 * 	ignorewarnings: Ignore warnings
 * Default: movetalk, movesubpages
 * 
 * Examples:
 * 	B3.action.move(function(from) {
 * 		return from.replace(' (book)', ' (novel)');
 * 	}, 'book -> novel')
 */
B3.modules.register_action('move', {
	task_generator: function(translator, reason, options, complete, success, failure) {
		if(!options) {options = {};}
		B3.util.softmerge(options, {
			movetalk: true,
			movesubpages: true,
		});

		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'move',
				translator: translator,
				reason: reason,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		pages: function(params, page) {
			var to = this.params.translator(page.title);
			if(!to || to == page.title) {return;}

			params.action = 'move';
			params.from = page.title;
			params.to = to;
			params.reason = this.params.reason;
			if(page.movetoken) {params.token = page.movetoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		move: function(list, query) {
			if(!this.input_list.pages[query.from]) {
				this.output_list.pages[query.to] = {
					title: query.to,
				};
				this.output_list.pages[query.talkto] = {
					title: query.talkto,
				}
			}
			else {
				var page = this.input_list.pages[query.from];
				if(page) {
					if(this.output_list.pages[query.from]) {delete this.output_list.pages[query.from];}
					page.title = query.to;
					this.output_list.pages[page.title] = page;
				}
				page = this.input_list.pages[query.talkfrom];
				if(page) {
					if(this.output_list.pages[query.talkfrom]) {delete list.pages[query.talkfrom];}
					page.title = query.talkto;
					this.output_list.pages[page.title] = page;
				}
			}
		},
	},
});

/* Protect pages
 * 
 * Args:
 * 	protections: Protections to apply (eg. {edit: 'sysop', move: 'sysop'})
 * 	expiry: Protection expiry (eg. '1 day')
 * 	reason: Edit summary
 * 
 * Options:
 * 	cascade: See [[mw:Manual:Administrators#Protection]]
 * 
 * Examples:
 * 	B3.action.protect({edit: 'autoconfirmed', move: 'autoconfirmed'}, 'infinite', 'high traffic page')
 */
B3.modules.register_action('protect', {
	task_generator: function(protections, expiry, reason, options, complete, success, failure) {
		if(!options) {options = {};}
		if(typeof protections != 'string') {
			var str = '';
			for(var i in protections) {str += i + '=' + protections[i] + '|';}
			if(str) {protections = str.substring(0, str.length - 1);}
			else {protections = '';}
		}

		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'protect',
				protections: protections,
				expiry: expiry,
				reason: reason,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		pages: function(params, page) {
			params.action = 'protect';
			params.title = page.title;
			params.protections = this.params.protections;
			params.expiry = this.params.expiry;
			params.reason = this.params.reason;
			if(page.protecttoken) {params.token = page.protecttoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		protect: function(query) {
			if(!this.input_list.pages[query.title]) {
				this.output_list.pages[query.title] = {
					title: query.title,
					protections: query.protections,
				};
			}
			else {
				var page = this.input_list.pages[query.title];

				page.protections = [];
				for(var i = 0; i < query.protections.length; i++) {
					var prot = {};
					for(var j in query.protections[i]) {
						if(j == 'expiry') {prot[j] = query.protections[i][j];}
						else { //this one minor difference is so annoying
							prot.type = j;
							prot.level = query.protections[i][j];
						}
					}
					page.protections.push(prot);
				}
				this.output_list.pages[query.title] = page;
			}
		},
	},
});

/* Purge pages
 * 
 * Args:
 * 
 * Options:
 * 	forcelinkupdate: Update the links table
 * 
 * Examples:
 * 	B3.action.purge() //no, really
 */
B3.modules.register_action('purge', {
	task_generator: function(options, complete, success, failure) {
		if(!options) {options = {};}

		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'purge',
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		pages: function(params, page) {
			//purge can do more than one page, so lump them together and then reject every other request
			//TODO: get this to only run once, then unbind itself so that we don't call this 20349390 times for no reason
			if(page == this.data.pages[0]) {
				params.action = 'purge';
				params.titles = page.title;
				for(var i = 1; i < this.pages.length; i++) {params.titles += '|' + this.pages[i].title;}
			}
		},
	},
	data_mergers: {
		purge: B3.util.null,
	},
});

/* Rollback pages
 * 
 * Args:
 * 	user: User who made the edits being rollbacked; you can leave this blank to get the default summary
 * 	      (this is to prevent revert conflicts - if someone gets there first, you could rollback their revert)
 * 	summary: Edit summary
 * 
 * Options:
 * 	markbot: Mark the rollback as a bot edit
 * 
 * Examples:
 * 	B3.action.rollback('A troll', '')
 */
B3.modules.register_action('rollback', {
	task_generator: function(user, summary, options, complete, success, failure) {
		if(!options) {options = {};}

		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'rollback',
				user: user,
				summary: summary,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		pages: function(params, page) {
			params.action = 'rollback';
			params.title = page.title;
			params.user = this.params.user;
			if(page.rollbacktoken) {params.token = page.rollbacktoken;}
			else {params.token = B3.token;}
			if(this.params.summary) {params.summary = this.params.summary;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		rollback: function(query) {
			if(!this.input_list.pages[query.title]) {
				this.output_list.pages[query.title] = {
					title: query.title,
					lastrevid: query.revid,
					revisions: [{
						revid: query.revid,
						parentid: query.old_revid,
						user: B3.m.userinfo.name,
						userid: B3.m.userinfo.id,
						comment: query.summary,
					}],
				};
			}
			else {
				var page = this.input_list.pages[query.title];

				page.lastrevid = query.revid;
				if(!page.revisions) {page.revisions = [];}
				page.revisions.unshift({
					revid: query.revid,
					parentid: query.old_revid,
					user: B3.m.userinfo.name,
					userid: B3.m.userinfo.id,
					comment: query.summary,
				});
				this.output_list.pages[query.title] = page;
			}
		},
	},
});

/* Unblock users
 * 
 * Args:
 * 	reason: Edit summary
 * 
 * Options:
 * 
 * Examples:
 * 	B3.action.unblock('exonerated')
 */
B3.modules.register_action('unblock', {
	task_generator: function(reason, options, complete, success, failure) {
		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'unblock',
				reason: reason,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generator: {
		users: function(params, user) {
			params.action = 'unblock';
			params.user = user.name;
			params.reason = this.params.reason;
			if(page.unblocktoken) {params.token = page.unblocktoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		unblock: function(query) {
			if(!this.input_list.users[query.user]) {
				this.output_list.users[query.user] = {
					name: query.user,
				};
			}
			else {
				var user = this.input_list.users[query.user];

				if(user.blockedby) {delete user.blockedby;}
				if(user.blockedreason) {delete user.blockedreason;}
				if(user.blockedexpiry) {delete user.blockedexpiry;}
				this.output_list.users[query.user] = user;
			}
		},
	},
});

/* Undelete pages
 * 
 * Args:
 * 	reason: Edit summary
 * 
 * Options:
 * 	timestamps: Array of specific timestamps to restore; if unspecified, all deleted revisions are restored
 * 
 * Examples:
 * 	B3.action.undelete('petition successful')
 * 	B3.action.undelete('unhiding', {timestamps: ['2016-02-13T21:15:37Z']})
 */
B3.modules.register_action('undelete', {
	task_generator: function(reason, options, complete, success, failure) {
		if(!options) {options = {};}
		else if(typeof options.timestamps != 'string') {options.timestamps = options.timestamps.join('|');}

		return new B3.classes.Task(
			'POST', B3.settings.apipath, {
				module: 'undelete',
				reason: reason,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		pages: function(params, page) {
			params.action = 'undelete';
			params.title = page.title;
			params.reason = this.params.reason;
			if(page.token) {params.token = page.token;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		undelete: function(query) {
			if(!this.input_list.pages[query.title]) {
				this.output_list.pages[query.title] = {
					title: query.title,
				};
			}
			else{ 
				var page = this.input_list.pages[query.title];

				if(page.missing !== undefined) {delete page.missing;}
				this.output_list.pages[query.title] = page;
			}
		},
	},
});

/* Modify user rights
 * 
 * Args:
 * 	add: Array of rights to add to all users (eg. ['sysop', 'bureaucrat']
 * 	remove: Same as add, except specified rights will be removed
 * 
 * Options:
 * 
 * Examples:
 * 	B3.action.userrights(['sysop', 'bureaucrat'], 'rollback', 'RFA successful')
 */
B3.modules.register_action('userrights', {
	task_generator: function(add, remove, reason, options, complete, success, failure) {
		if(!options) {options = {};}
		if(typeof add != 'string') {add = add.join('|');}
		if(typeof remove != 'string') {remove = remove.join('|');}

		return new B3.classes.Task('POST', B3.settings.apipath, {
				module: 'userrights',
				add: add,
				remove: remove,
				reason: reason,
				options: options,
			}, {},
			complete, success, failure
		);
	},
	param_generators: {
		users: function(params, user) {
			params.action = 'userrights';
			params.user = user.name;
			params.add = this.params.add;
			params.remove = this.params.remove;
			params.reason = this.params.reason;
			if(page.userrightstoken) {params.token = page.userrightstoken;}
			else {params.token = B3.token;}

			B3.util.softmerge(params, this.params.options);
		},
	},
	data_mergers: {
		userrights: function(query) {
			if(!this.input_list.users[query.user]) {
				this.output_list.users[query.user] = {
					name: query.user,
					groups: query.added,
				};
			}
			else {
				var user = this.input_list.users[query.user];

				if(user.groups) {
					for(var i = 0; i < query.removed.length; i++) {
						var index = user.groups.indexOf(query.removed[i]);
						if(index != -1) {user.groups.splice(index, 1);}
					}
					for(var i = 0; i < query.added.length; i++) {user.groups.push(query.added[i]);}
				}
				else {user.groups = query.added;}
				this.output_list.users[query.user] = user;
			}
		},
	},
});

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
