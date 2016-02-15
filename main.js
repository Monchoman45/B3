/************** Browser Based Bot **************
 *              A JS bot framework             *
 * ------------------------------------------- *
 *    Written and maintained by Monchoman45    *
 *      https://github.com/Monchoman45/B3      *
 ***********************************************/

if(window.B3) {throw new Error('B3 already loaded');}

window.B3 = {
	version: 103,
	pretty_version: '1.0.3',

	init: false,

	token: '',

	action: {},
	prop: {},
	list: {},
	meta: {},
	api: {},

	classes: {},

	modules: {
		action: {},
		query: {},
		data_mergers: {},
		query_mergers: {},
	},

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

		wpmode: false, //Wikipedia mode, for lame bureaucracy
		wpdelay: 1000, //Time between requests (in ms)
	},

	listeners: {},

	util: {},
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

{{util.js}}
{{queue.js}}
{{classes.js}}
{{modules.js}}

{{query.js}}
{{action.js}}
{{prop.js}}
{{list.js}}
{{meta.js}}

B3.onload = function() {
	if(!B3.token) {B3.api.token_regen();}

	//FIXME: pull these props from a setting
	B3.action.query('', [
		B3.meta.siteinfo(['general', 'namespaces', 'namespacealiases', 'statistics', 'usergroups']),
		B3.meta.userinfo(['blockinfo', 'hasmsg', 'groups', 'rights', 'changeablegroups', 'options', 'ratelimits']),
		B3.meta.allmessages(['revertpage']), //TODO: other useful messages
	]).run();

	B3.call_listeners('init');
	B3.init = true;
}

if(document.readyState == 'complete') {B3.onload();}
else {window.addEventListener('load', B3.onload);}




{{ui/main.js}}
