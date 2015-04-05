



/*------------------------------------------------------------------------------------------------
	action=query&meta=
 
	Common arguments:
		props - properties to get
		options - optional additional module-specific parameters to send with the request
  ------------------------------------------------------------------------------------------------*/

B3.meta.info = function(module, short, props, options) {
	if(typeof props != 'string') {props = props.join('|');}

	var params = {
		meta: module,
	};
	params[short + 'prop'] = props;
	B3.util.softmerge(params, options, short);
	return params;
}
B3.meta.siteinfo = function(props, options) {return B3.meta.info('siteinfo', 'si', props, options);}
B3.meta.userinfo = function(props, options) {return B3.meta.info('userinfo', 'ui', props, options);}

B3.meta.allmessages = function(messages, options) {
	if(typeof messages != 'string') {messages = messages.join('|');}

	var params = {
		meta: 'allmessages',
		ammessages: messages,
	};
	B3.util.softmerge(params, options, 'am');
	return params;
}
