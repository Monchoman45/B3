B3.ui = {
	init: false,
	window: null,
	ids: {},
};

B3.settings.framerate = 60;
B3.settings.minwidth = 150;
B3.settings.maxwidth = 500;
B3.settings.minqueueheight = 150;
B3.settings.maxqueueheight = 500;

B3.util.load_css('http://@DOMAIN@/wiki/MediaWiki:B3.js/ui/main.css?action=raw&ctype=text/css');

{{ui/modules.js}}
{{ui/targets.js}}
{{ui/animation.js}}
{{ui/selection.js}}
{{ui/render.js}}
{{ui/listeners.js}}
{{ui/load.js}}
{{ui/util.js}}
