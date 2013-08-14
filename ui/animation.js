/*------------------------------------------------------------------------------------------------
     Animation functions
  ------------------------------------------------------------------------------------------------*/

B3.ui.animation = {
	showing: 'actions',
	in: null,
	out: null,
	frames: 0,
	interval: 0
};

B3.ui.animation.show = function(wind, render) {
	if(B3.ui.animation.showing == wind || !B3.ui.ids['controls-windows-' + wind]) {return false;}

	var tabs = B3.ui.ids['controls-titlebar'].getElementsByTagName('a');
	for(var i = 0; i < tabs.length; i++) {tabs[i].className = 'disabled';}
	B3.ui.ids['controls-titlebar-jobs'].className = '';
	B3.ui.ids['controls-titlebar-settings'].className = '';

	if(B3.ui.selection.module) {
		B3.ui.ids['controls-titlebar-actions'].className = 'hilighted';

		if(B3.ui.selection.targets) {
			B3.ui.ids['controls-titlebar-targets'].className = 'hilighted';
			B3.ui.ids['controls-titlebar-params'].className = '';
		}
		else if(B3.ui.modules[B3.ui.selection.module].notargets) {
			B3.ui.ids['controls-titlebar-targets'].className = 'hilighted disabled';
			B3.ui.ids['controls-titlebar-params'].className = '';
		}
		else {B3.ui.ids['controls-titlebar-targets'].className = '';}

		if(B3.ui.selection.params) {
			B3.ui.ids['controls-titlebar-params'].className = 'hilighted';
			B3.ui.ids['controls-titlebar-run'].className = '';
		}
	}
	else {B3.ui.ids['controls-titlebar-actions'].className = '';}

	B3.ui.ids['controls-titlebar-' + wind].className = 'hilighted';
	B3.ui.ids['controls-titlebar-' + wind].className += ' active';

	if(!B3.ui.animation.out) {B3.ui.animation.out = B3.ui.ids['controls-windows-' + B3.ui.animation.showing];}
	B3.ui.animation.showing = wind;
	if(render || render == undefined) {B3.ui.render[wind]();}

	if(B3.ui.animation.interval != 0) { //something is already running
		clearInterval(B3.ui.animation.interval);
		B3.ui.animation.in.style.left = 0;
		B3.ui.animation.out.style.display = 'none';
		B3.ui.animation.out = B3.ui.animation.in;
	}
	B3.ui.animation.in = B3.ui.ids['controls-windows-' + wind];
	B3.ui.animation.in.style.left = B3.ui.ids['controls-windows'].offsetWidth + 'px';
	B3.ui.animation.in.style.display = 'block';
	B3.ui.animation.frames = Math.floor(B3.settings.framerate * .3);
	B3.ui.animation.interval = setInterval(B3.ui.animation.frame, 1000 / B3.settings.framerate);

	return true;
}

B3.ui.animation.frame = function() {
	if(B3.ui.animation.frames <= 0) { //last frame
		clearInterval(B3.ui.animation.interval);
		B3.ui.animation.interval = 0;
		B3.ui.animation.frames = 0;

		B3.ui.animation.in.style.left = '';
		B3.ui.animation.out.style.display = '';
		B3.ui.animation.out = null;
		B3.ui.animation.in = null;
	}
	else {
		B3.ui.animation.out.style.left = B3.ui.animation.out.offsetLeft - (B3.ui.animation.in.offsetLeft / B3.ui.animation.frames) + 'px';
		B3.ui.animation.in.style.left = B3.ui.animation.in.offsetLeft - (B3.ui.animation.in.offsetLeft / B3.ui.animation.frames) + 'px';
		B3.ui.animation.frames--;
	}
}