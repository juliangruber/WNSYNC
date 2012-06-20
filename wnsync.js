/*
Save: (change,name),(change,name)
Save: (change,name),(change,name),(change,name)

Rename: (rename,null),(rename,new_name),(change,new_name)

Create: (rename,new_name),(rename,null),(rename,name)

Delete: (rename,null)
 */

;(function() {

	var fs = require('fs')
	  , child_process = require('child_process')
	  , path = require('path')
	  , filesChanged = 0
	  , syncPending = false
	  , isSyncing = false
	  , cmd
	  , cfg;

	/**
	 * Determin cmd based on OS
	 */
	if (process.env.OS == "Windows_NT") {
		cmd = path.join('rsync','rsync.exe');
	} else {
		cmd = 'rsync'
	}


	/**
	 * Load configuration file
	 */
	fs.stat('.wnsync.json', function(err, stats) {
		if ('object' == typeof stats) {
			cfg = require('./.wnsync.json');
			if ("string" != typeof cfg.dir) cfg.dir = '/home/'+cfg.user+'/';
			console.log(cfg);
		} else {
			throw new Error('Configuration file .wnsync.json not found')
		}
	})

	/**
	 * Execute rsync
	 */
	var sync = function() {
		console.log('sync');

		child_process.exec(cmd, function(error, stdout, stderr) {
			//console.log(stdout);
			//console.log(stderr);
			isSyncing = false;
		});
	}

	/**
	 * Perform initial synchronisation
	 */
	sync();

	/**
	 * Only start syncing if no changes happened for 100ms
	 * because
	 * - Complex FS events like `change` consist of more than
	 *   one event
	 * - More than one file could be changes, we then want
	 *   to do a batch sync
	 *
	 * `filesChanges` is reset after 100ms to see if fs.watch
	 * incremented it again.
	 *
	 * `syncPending` is needed because sync should happen if
	 * filesChanges is 0, but filesChanges is also 0 when
	 * nothing happened -> 2nd status variable
	 */
	setInterval(function() {
		if (syncPending && filesChanged == 0) {
			sync();
			syncPending = false;
		}
		filesChanged = 0;
	}, 100);

	/**
	 * Watch the file system for changes
	 */
	fs.watch('./', function(event, path) {
		filesChanged++;
		syncPending = true;
	});

})()