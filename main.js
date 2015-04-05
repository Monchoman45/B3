window.B3 = {
	version: '003.0',

	init: false,

	token: '',

	query: {},
	action: {},
	prop: {},
	list: {},
	meta: {},
	api: {},

	m: {}, //FIXME:

	queue: {
		active: [], //Requests waiting for a response
		tasks: [], //All tasks
		listeners: {},
	},

	settings: {
		longpost: 8000, //POST requests where one parameter value is this length or greater will use multipart/form-data
		maxactive: 10, //Maximum active requests 
		maxretry: 5, //Maximum number of times to resend requests that are generically bounced
	},

	listeners: {},
};

//Set apipath and indexpath
if(window.wgScriptPath != undefined) { //on wikia wgScriptPath is '' which is false
	B3.settings.apipath = wgScriptPath + '/api.php';
	B3.settings.indexpath = wgScriptPath + '/index.php';
}
else if(window.mw && mw.config && mw.config.values && mw.config.values.wgScriptPath) {
	B3.settings.apipath = mw.config.values.wgScriptPath + '/api.php';
	B3.settings.indexpath = mw.config.values.wgScriptPath + '/index.php';
}
else {
	B3.settings.apipath = '/w/api.php';
	B3.settings.indexpath = '/w/index.php';
	console.log('B3 warning: wgScriptPath is not defined, so the default api path was set to /w/api.php. If this is incorrect, please manually set B3.settings.apipath to the wiki\'s api.php location, and B3.settings.indexpath to the wiki\'s index.php location.');
}

if(window.mw && mw.user && mw.user.tokens && mw.user.tokens.values && mw.user.tokens.values.editToken) {
	B3.token = mw.user.tokens.values.editToken;
}

{{MediaWiki:B3.js/util.js}}
{{MediaWiki:B3.js/queue.js}}
{{MediaWiki:B3.js/classes.js}}
{{MediaWiki:B3.js/query.js}}
{{MediaWiki:B3.js/action.js}}
{{MediaWiki:B3.js/prop.js}}
{{MediaWiki:B3.js/list.js}}
{{MediaWiki:B3.js/meta.js}}

B3.add_listener = B3.util.add_listener;
B3.remove_listener = B3.util.remove_listener;
B3.call_listeners = B3.util.call_listeners;

B3.onload = function() {
	if(!B3.token) {
		B3.token = '.';
		B3.api.token_regen();
	}

	//FIXME: pull these props from a setting
	B3.query.meta([
		B3.meta.siteinfo(['general', 'namespaces', 'namespacealiases', 'statistics', 'usergroups']),
		B3.meta.userinfo(['blockinfo', 'hasmsg', 'groups', 'rights', 'changeablegroups', 'options', 'ratelimits']),
		B3.meta.allmessages(['revertpage']), //TODO: other useful messages
	]).run();

	B3.call_listeners('init');
	B3.init = true;
}

window.addEventListener('load', B3.onload);




{{MediaWiki:B3.js/ui/main.js}}
