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

var link = document.createElement('link');
link.type = 'text/css';
link.rel = 'stylesheet';
link.href = 'http://monchbox.wikia.com/wiki/MediaWiki:B3.js/ui/main.css?action=raw&ctype=text/css&t=' + (new Date()).getTime();
document.head.appendChild(link);

{{MediaWiki:B3.js/ui/jobs.js}}
{{MediaWiki:B3.js/ui/modules.js}}
{{MediaWiki:B3.js/ui/targets.js}}
{{MediaWiki:B3.js/ui/animation.js}}
{{MediaWiki:B3.js/ui/selection.js}}
{{MediaWiki:B3.js/ui/render.js}}
{{MediaWiki:B3.js/ui/listeners.js}}
{{MediaWiki:B3.js/ui/load.js}}
{{MediaWiki:B3.js/ui/util.js}}
