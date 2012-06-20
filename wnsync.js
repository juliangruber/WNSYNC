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
	  , cmd;

	if (process.env.OS == "Windows_NT") {
		cmd = path.join('rsync','rsync.exe');
	} else {
		cmd = 'rsync'
	}


	var sync = function() {
		console.log('sync');

		child_process.exec(cmd, function(error, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			isSyncing = false;
		});
	}

	sync();

	setInterval(function() {
		if (syncPending && filesChanged == 0) {
			sync();
			syncPending = false;
		}
		filesChanged = 0;
	}, 100);

	fs.watch('./', function(event, path) {
		filesChanged++;
		syncPending = true;
	});

})()