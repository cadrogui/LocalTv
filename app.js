var fileSource = './source.mp4';
var subtitleSource = './source.srt';

var http = require('http'),
    fs = require('fs'),
    util = require('util'),
	OS = require('os'),
	spawn = require('child_process').spawn,
	airplay = require('airplay');
	
var browser = airplay.createBrowser();
 
var tmpDir = OS.tmpdir();
var tmpFile = tmpDir + '/localTV.mp4';

function init(){
	console.log('Starting LocalTV');
	
	fs.exists(tmpFile, function(exists){
		if(exists) fs.unlink(tmpFile)
	});
	
	var ffmpeg = spawn('./ffmpeg', [
		'-i', fileSource,
		'-sub_charenc', 'CP1252',
		'-i', subtitleSource,
		'-map', '0:v',
		'-map', '0:a',
		'-c', 'copy',
		'-map', '1',
		'-c:s:0', 'mov_text',
		'-metadata:s:s:0', 'language=esp',
		tmpFile
	]); 
	
	ffmpeg.on('close', function(){
		console.log('Burning subtitle finished');
		initServer();
	})
}

function initServer(){
	console.log('Starting http Server');
	
	http.createServer(function (req, res) {
	
		var path = tmpFile;
		var stat = fs.statSync(path);
		var total = stat.size;
		
		if (req.headers['range']) {
		var range = req.headers.range;
		var parts = range.replace(/bytes=/, "").split("-");
		var partialstart = parts[0];
		var partialend = parts[1];
		
		var start = parseInt(partialstart, 10);
		var end = partialend ? parseInt(partialend, 10) : total-1;
		var chunksize = (end-start)+1;
		
		var file = fs.createReadStream(path, {start: start, end: end});
		res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
		file.pipe(res);
		} else {
		console.log('ALL: ' + total);
		res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
		fs.createReadStream(path).pipe(res);
		}
		
	}).listen(1337, '192.168.0.100');
	
	startStream();
}

function startStream(){
	browser.on('deviceOnline', function(device) {
		device.play('http://192.168.0.100:1337', 0);
	});
	
	browser.start();
	console.log('Staring stream to AppleTv');
}

init();