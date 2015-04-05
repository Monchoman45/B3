/*------------------------------------------------------------------------------------------------
     Selection functions
  ------------------------------------------------------------------------------------------------*/

B3.ui.selection = {
	module: null,
	targets: null,
	params: null
};

B3.ui.selection.run = function(targets) {
	if(!B3.ui.selection.module || !B3.ui.selection.params) {return;} //complain?

	if(!targets && !B3.ui.modules[B3.ui.selection.module].notargets) {B3.ui.targets[B3.ui.selection.targets.module].fetch(B3.ui.selection.targets.params, B3.ui.selection.run/*, some failure callback*/);}
	else {
		B3.ui.modules[B3.ui.selection.module].run(targets, B3.ui.selection.params);
		B3.ui.selection.module = null;
		B3.ui.selection.targets = null;
		B3.ui.selection.params = null;
	}
}
