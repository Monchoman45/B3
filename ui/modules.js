/*------------------------------------------------------------------------------------------------
     UI modules
  ------------------------------------------------------------------------------------------------*/

/*----------- Basic -----------*/
B3.ui.modules.delete = {
	group: 'Basic',
	label: 'Mass delete',
	params: 
	  '<div><label for="B3-delete-summary">Summary:</label> <input type="text" id="B3-delete-summary" name="summary" /></div>'
	+ '<div><label for="B3-delete-batch">Batch size:</label> <input type="number" id="B3-delete-batch" name="batch" value="50" /></div>',
	prepare: function(params) {
		if(params.batch <= 0) {params.batch = 1;}
		return params;
	},
	run: function(titles, params) {
		var job = new B3.jobs.Job();

		for(var i = 0; i < titles.length; i += params.batch) {
			job.delete(titles.slice(i, i + params.batch), params.summary);
		}
	}
};

/*----------- Maintenance -----------*/
B3.ui.modules.doubleredirects = {
	group: 'Maintenance',
	label: 'Resolve double redirects',
	notargets: true,
	params:
	  '<div><label for="B3-doubleredirects-summary">Summary:</label> <input id="B3-doubleredirects-summary" type="text" name="summary" /></div>'
	+ '<div><label for="B3-doubleredirects-batch">Batch size:</label> <input id="B3-doubleredirects-batch" type="number" name="batch" value="50" /></div>'
	+ '<div><label for="B3-doubleredirects-poly">Resolve poly redirects</label><input type="checkbox" id="B3-doubleredirects-poly" name="poly" /></div>'
	/*+ '<p>A poly redirect is any double redirect that, when resolved, is still a double redirect. This makes them triple, quadruple, quintuple, etc redirects. Consider this case:</p>'
	+ '<pre>Redir 3 -> Redir 2 -> Redir 1 -> Page</pre>'
	+ '<p>Both <code>Redir 2</code> and <code>Redir 3</code> are listed as double redirects, because they redirect to a redirect. However, when resolved, the result will be:</p>'
	+ '<pre>'
		+ 'Redir 3 -> Redir 1 -> Page\n'
		+ '           Redir 2 -> Page'
	+ '</pre>'
	+ '<p><code>Redir 2</code> is fixed, but <code>Redir 3</code> is still a double redirect. <a href="/wiki/Special:DoubleRedirects" title="Special:DoubleRedirects">Special:DoubleRedirects</a> will list <code>Redir 3</code> as fixed, and will not detect that it is still a double redirect until the page is cached again.</p>'
	+ '<p>Poly redirects are rare, and most of the poly redirects that do exist are likely triple redirects. Resolving them directly is processor intensive, and particularly for large batch sizes, can result in your browser flagging the page as unresponsive (you can safely dismiss the message, but the script may take a long time to finish). In most cases, you can resolve double redirects faster without checking for poly redirects, and not have to worry about leaving anything behind. Particularly if you have a large number of double redirects to resolve, it\'ll be easier on your computer to ignore poly redirects, and simply check the list again the next day.</p>'*/,
	run: function(titles, params) {
		var job = new B3.jobs.Job();
		//do stuff and things
	}
};