var fileSource = './source.mp4';
var subtitleSource = './source.srt';

var http = require('http'),
	fs = require('fs'),
	util = require('util'),
	OS = require('os'),
	spawn = require('child_process').spawn,
	airplay = require('airplay-js'),
	path = require('path');
//	gui = require('nw.gui');	

var browser = airplay.createBrowser();
 
var tmpDir = OS.tmpdir();
var tmpFile = tmpDir + '/localTV.mp4';

var sourceSize;
var tmpFileSize;

var devices = [];

browser.on( 'deviceOn', function( device ) {
	devices.push(device);
});

browser.on( 'error', function( error ) {
	console.log(error);
	document.getElementById('status').innerHTML = error
});

function render(fileSource, subtitleSource){
	console.log('Starting LocalTV');
	console.log('Burning Subtitle into ' + fileSource);
	
	document.getElementById('spinner').style.display = "block";
		
	var stat = fs.statSync(fileSource);
	sourceSize = stat.size;
		
	fs.exists(tmpFile, function(exists){
		if(exists) fs.unlink(tmpFile)
	});
	
	var ffmpeg = spawn('/usr/bin/ffmpeg', [
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
	
	ffmpeg.stderr.pipe(process.stdout);
				
	ffmpeg.on('close', function(code){
		if(code == 0){
			document.getElementById('spinner').style.display = "none";
			document.getElementById('streamingScr').style.display = "block";
			
			console.log('Burning subtitle finished');
			initServer();
		}
	})

	ffmpeg.on('error', function(error){
		console.log(error, 'ffmpeg error');
	});

}

function readCache(){
	console.log('Reading Cached File');
	document.getElementById('streamingScr').style.display = "block";
	initServer();
}

function initServer(){
	console.log('Starting HTTP server');
	
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
			
		  }else{		
			
			res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
			fs.createReadStream(path).pipe(res);
		}
		
	}).listen(1337, '192.168.0.100', function(){
		console.log('HTTP Server Started');
		startStream();
	});

	return false;		
}

function startStream(){	
	console.log('Streaming to AppleTV');
	
	var stat = fs.statSync(tmpFile);
	tmpFileSize = stat.size;	
				
	devices[0].play('http://192.168.0.100:1337', 0, function(status){
		console.info(status, 'Playing video');
	});

}

var dropMovie;
var dropSubtitle;

var MovieFile;
var SubtitleFile;

var total = 0;

dropMovie = document.getElementById('movie');
dropMovie.addEventListener("dragenter", dragEnterMovieFile, false);
dropMovie.addEventListener("dragover", dragOverMovieFile, false);
dropMovie.addEventListener("drop", dropMovieFile, false);

function dragEnterMovieFile(e){
	e.stopPropagation();
 	e.preventDefault();
}

function dragOverMovieFile(e){
	e.stopPropagation();
 	e.preventDefault();
}

function dropMovieFile(e){
	e.stopPropagation();
 	e.preventDefault();
  	
	console.log(event.dataTransfer.files[0].path, 'Movie');
	MovieFile = event.dataTransfer.files[0].path;
	document.getElementById('movieFileName').innerHTML = 'Movie: ' + MovieFile;
	total = total + 1;
	requestStream();
}

dropSubtitle = document.getElementById('subtitle');
dropSubtitle.addEventListener("dragenter", dragEnterSubtitleFile, false);
dropSubtitle.addEventListener("dragover", dragOverSubtitleFile, false);
dropSubtitle.addEventListener("drop", dropSubtitleFile, false);

function dragEnterSubtitleFile(e){
	e.stopPropagation();
 	e.preventDefault();
}

function dragOverSubtitleFile(e){
	e.stopPropagation();
 	e.preventDefault();
}

function dropSubtitleFile(e){
	e.stopPropagation();
 	e.preventDefault();
  	
	console.log(event.dataTransfer.files[0].path, 'Subtitle');
	SubtitleFile = event.dataTransfer.files[0].path;
	document.getElementById('subtitleFileName').innerHTML = 'Sub: ' + SubtitleFile;
	total = total + 1;	
	requestStream();
}

function requestStream(){
	if(total == 2){
		render(MovieFile, SubtitleFile);		
	}
}

//init();
//initServer();