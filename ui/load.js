/*------------------------------------------------------------------------------------------------
     Onload listener / HTML
  ------------------------------------------------------------------------------------------------*/

B3.ui.onload = function(event) {
	if(wgCanonicalNamespace == 'Special' && wgTitle == 'B3') {
		document.title = 'B3 - ' + wgSiteName;
		if(skin == 'oasis') {
			var body = document.getElementById('WikiaArticle');
			if(document.getElementById('WikiaPageHeader')) {
				document.getElementById('WikiaPageHeader').getElementsByTagName('h1')[0].textContent = 'B3';
				document.getElementById('WikiaPageHeader').getElementsByTagName('h2')[0].textContent = 'Browser-based bot framework';
			}
		}
		else {
			var body = document.getElementById('bodyContent');
			document.getElementById('firstHeading').textContent = 'B3';
		}

		while(body.children.length > 0) {body.removeChild(body.children[0]);}
		if(document.getElementById('AdminDashboardHeader')) {
			var div = document.createElement('div');
				div.className = 'AdminDashboardGeneralHeader AdminDashboardArticleHeader';
				var h1 = document.createElement('h1');
					h1.textContent = 'B3';
				div.appendChild(h1);
			body.appendChild(div);
		}

		B3.ui.window = document.createElement('div');
			B3.ui.window.id = 'b3';
			B3.ui.ids['b3'] = B3.ui.window;
			B3.ui.window.style.height = window.innerHeight - 50 + 'px';
			B3.ui.window.addEventListener('mouseup', B3.ui.listeners.resize.mouseup);

			var controls = document.createElement('div');
				B3.ui.ids['controls'] = controls;
				controls.id = 'b3-controls';

				var titlebar = document.createElement('div');
					B3.ui.ids['controls-titlebar'] = titlebar;
					titlebar.id = 'b3-controls-titlebar';

					var t_actions = document.createElement('a');
						B3.ui.ids['controls-titlebar-actions'] = t_actions;
						t_actions.id = 'b3-controls-titlebar-actions';
						t_actions.className = 'hilighted active';
						t_actions.setAttribute('data-window', 'actions');
						t_actions.textContent = 'Action';
						t_actions.addEventListener('click', B3.ui.listeners.titlebar.click);
					titlebar.appendChild(t_actions);
					var t_span = document.createElement('span');
						t_span.className = 'B3-titlebar-arrow';
						t_span.innerHTML = '&raquo;';
					titlebar.appendChild(t_span);
					var t_targets = document.createElement('a');
						B3.ui.ids['controls-titlebar-targets'] = t_targets;
						t_targets.id = 'b3-controls-titlebar-targets';
						t_targets.className = 'disabled';
						t_targets.setAttribute('data-window', 'targets');
						t_targets.textContent = 'Targets';
						t_targets.addEventListener('click', B3.ui.listeners.titlebar.click);
					titlebar.appendChild(t_targets);
					titlebar.appendChild(t_span.cloneNode(true));
					var t_params = document.createElement('a');
						B3.ui.ids['controls-titlebar-params'] = t_params;
						t_params.id = 'b3-controls-titlebar-params';
						t_params.className = 'disabled';
						t_params.setAttribute('data-window', 'params');
						t_params.textContent = 'Params';
						t_params.addEventListener('click', B3.ui.listeners.titlebar.click);
					titlebar.appendChild(t_params);
					titlebar.appendChild(t_span.cloneNode(true));
					var t_run = document.createElement('a');
						B3.ui.ids['controls-titlebar-run'] = t_run;
						t_run.id = 'b3-controls-titlebar-run';
						t_run.className = 'disabled';
						t_run.setAttribute('data-window', 'run');
						t_run.textContent = 'Run';
						t_run.addEventListener('click', B3.ui.listeners.titlebar.click);
					titlebar.appendChild(t_run);
					titlebar.appendChild(t_span.cloneNode(true));
					var t_jobs = document.createElement('a');
						B3.ui.ids['controls-titlebar-jobs'] = t_jobs;
						t_jobs.id = 'b3-controls-titlebar-jobs';
						t_jobs.setAttribute('data-window', 'jobs');
						t_jobs.textContent = 'Jobs';
						t_jobs.addEventListener('click', B3.ui.listeners.titlebar.click);
					titlebar.appendChild(t_jobs);
					var t_settings = document.createElement('a');
						B3.ui.ids['controls-titlebar-settings'] = t_settings;
						t_settings.id = 'b3-controls-titlebar-settings';
						t_settings.setAttribute('data-window', 'settings');
						t_settings.textContent = 'Settings';
						t_settings.addEventListener('click', B3.ui.listeners.titlebar.click);
					titlebar.appendChild(t_settings);
				controls.appendChild(titlebar);

				var windows = document.createElement('div');
					B3.ui.ids['controls-windows'] = windows;
					windows.id = 'b3-controls-windows';
					var w_actions = document.createElement('div');
						B3.ui.ids['controls-windows-actions'] = w_actions;
						w_actions.id = 'b3-controls-windows-actions';
						w_actions.style.display = 'block';
						var w_actions_form = document.createElement('form');
							B3.ui.ids['controls-windows-actions-form'] = w_actions_form;
							w_actions_form.id = 'b3-controls-windows-actions-form';
						w_actions.appendChild(w_actions_form);
					windows.appendChild(w_actions);
					var w_targets = document.createElement('div');
						B3.ui.ids['controls-windows-targets'] = w_targets;
						w_targets.id = 'b3-controls-windows-targets';
						var w_targets_form = document.createElement('form');
							B3.ui.ids['controls-windows-targets-form'] = w_targets_form;
							w_targets_form.id = 'b3-controls-windows-targets-form';
						w_targets.appendChild(w_targets_form);
					windows.appendChild(w_targets);
					var w_params = document.createElement('div');
						B3.ui.ids['controls-windows-params'] = w_params;
						w_params.id = 'b3-controls-windows-params';
						var w_params_form = document.createElement('form');
							B3.ui.ids['controls-windows-params-form'] = w_params_form;
							w_params_form.id = 'b3-controls-windows-params-form';
						w_params.appendChild(w_params_form);
					windows.appendChild(w_params);
					var w_run = document.createElement('div');
						B3.ui.ids['controls-windows-run'] = w_run;
						w_run.id = 'b3-controls-windows-run';
						var w_run_form = document.createElement('form');
							B3.ui.ids['controls-windows-run-form'] = w_run_form;
							w_run_form.id = 'b3-controls-windows-run-form';
						w_run.appendChild(w_run_form);
					windows.appendChild(w_run);
					var w_jobs = document.createElement('div');
						B3.ui.ids['controls-windows-jobs'] = w_jobs;
						w_jobs.id = 'b3-controls-windows-jobs';
						var w_jobs_form = document.createElement('form');
							B3.ui.ids['controls-windows-jobs-form'] = w_jobs_form;
							w_jobs_form.id = 'b3-controls-windows-jobs-form';
						w_jobs.appendChild(w_jobs_form);
					windows.appendChild(w_jobs);
					var w_settings = document.createElement('div');
						B3.ui.ids['controls-windows-settings'] = w_settings;
						w_settings.id = 'b3-controls-windows-settings';
						var w_settings_form = document.createElement('form');
							B3.ui.ids['controls-windows-settings-form'] = w_settings_form;
							w_settings_form.id = 'b3-controls-windows-settings-form';
						w_settings.appendChild(w_settings_form);
					windows.appendChild(w_settings);
				controls.appendChild(windows);
			B3.ui.window.appendChild(controls);

			var resize = document.createElement('div');
				B3.ui.ids['resize'] = resize;
				resize.id = 'b3-resize';
				resize.addEventListener('mousedown', B3.ui.listeners.resize.mousedown);
			B3.ui.window.appendChild(resize);

			var queue = document.createElement('div');
				B3.ui.ids['queue'] = queue;
				queue.id = 'b3-queue';
				queue.addEventListener('mouseup', B3.ui.listeners.queueresize.mouseup);
				var q_active = document.createElement('ul');
					B3.ui.ids['queue-active'] = q_active;
					q_active.id = 'b3-queue-active';
				queue.appendChild(q_active);
				var q_resize = document.createElement('div');
					B3.ui.ids['queue-resize'] = q_resize;
					q_resize.id = 'b3-queue-resize';
					q_resize.addEventListener('mousedown', B3.ui.listeners.queueresize.mousedown);
				queue.appendChild(q_resize);
				var q_waiting = document.createElement('ul');
					B3.ui.ids['queue-waiting'] = q_waiting;
					q_waiting.id = 'b3-queue-waiting';
				queue.appendChild(q_waiting);
			B3.ui.window.appendChild(queue);
		body.appendChild(B3.ui.window);

		titlebar.style.bottom = controls.offsetHeight - titlebar.offsetHeight + 'px';
		windows.style.top = titlebar.offsetHeight + 'px';

		//B3-queue has width:20em; in the stylesheet, calc the left and right properties, then set it to auto so it scales
		queue.style.left = (B3.ui.window.offsetWidth - queue.offsetWidth) / B3.ui.window.offsetWidth * 100 + '%';
		resize.style.right = queue.offsetWidth / B3.ui.window.offsetWidth * 100 + '%';
		controls.style.right = (queue.offsetWidth + 5) / B3.ui.window.offsetWidth * 100 + '%';
		queue.style.width = 'auto';

		q_active.style.bottom = (queue.offsetHeight - q_active.offsetHeight) / queue.offsetHeight * 100 + '%';
		q_resize.style.top = q_active.offsetHeight / queue.offsetHeight * 100 + '%';
		q_waiting.style.top = (q_active.offsetHeight + 5) / queue.offsetHeight * 100 + '%';
		q_active.style.height = 'auto';

		B3.ui.render.actions();

		window.addEventListener('resize', B3.ui.listeners.window.resize);

		B3.ui.init = true;
	}
}

if(B3.init) {B3.ui.onload();}
else {B3.add_listener('init', B3.ui.onload);}
