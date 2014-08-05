var fileSource = './source.mp4';
var subtitleSource = './source.srt';

var http = require('http'),
	fs = require('fs'),
	util = require('util'),
	OS = require('os'),
	spawn = require('child_process').spawn,
	airplay = require('airplay-js'),
	path = require('path'),
	request = require('request');
//	gui = require('nw.gui');	

var coverUrl;

var regex = /(.+?)\W?(\d{4})/g;
var regex2 = /([a-zA-Z]+)/g;

var browser = airplay.createBrowser();
 
var tmpDir = OS.tmpdir();
var tmpFile = tmpDir + '/localTV.mp4';

var sourceSize;
var tmpFileSize;

var portServer = 1337;
var ipServer = "192.168.0.100";
var devices = [];

browser.on( 'deviceOn', function( device ) {
	devices.push(device);
	console.log(device);
});

browser.on( 'error', function( error ) {
	console.log(error);
	document.getElementById('status').innerHTML = error
});

function render(fileSource, subtitleSource){
	console.log('Starting LocalTV');
	console.log('Burning Subtitle into ' + fileSource);
	
	fileL = path.basename(fileSource);
	
	console.log(fileL.match(regex), 'REGEX');
	
	document.getElementById('spinner').style.display = "block";
		
	var stat = fs.statSync(fileSource);
	sourceSize = stat.size;
		
	fs.exists(tmpFile, function(exists){
		if(exists) fs.unlink(tmpFile)
	});
	
//	var ffmpeg = spawn('/usr/bin/ffmpeg', [
	var ffmpeg = spawn(path.dirname(process.execPath) + '/ffmpeg', [
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
			//initServer();
			startStream();
			statusCounter = 0;
		}
	})

	ffmpeg.on('error', function(error){
		console.log(error, 'ffmpeg error');
	});

}

function readCache(){
	console.log('Reading Cached File');
	document.getElementById('streamingScr').style.display = "block";
	startStream();
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
		
		req.on('close', function(){
			console.log('Lost Connection with AppleTV');
		});
		
	}).listen(portServer, ipServer, function(){
		console.log('HTTP Server Started');
		//startStream();
	});

	return false;		
}

function startStream(){	
	console.log('Streaming to AppleTV');
	
	var stat = fs.statSync(tmpFile);
	tmpFileSize = stat.size;	
	
	if(devices.length > 0){
	
		devices.forEach(function(device){
			console.log(device);
			device.play('http://'+ipServer+':'+portServer, 0, function(status){
				console.info(status, 'Playing video');
			});
		});			

	}else{
		message('no AppleTV Found');
	}
}

var timer;

function AirplayStatus(){
	console.log('Discovering atv');

	if(devices.length > 0){
		console.log('AppleTV Found');
		document.getElementById('iconAirplayStatus').src = 'img/iconAirplayGreen.png'
		clearInterval(timer);
	}else if(devices.length === 0){
		document.getElementById('iconAirplayStatus').src = 'img/iconAirplayRed.png'	
	
		timer = setInterval(function(){
			AirplayStatus();
		}, 2000);
		
	}
}

function message(m){
	console.log(m);
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

dropSubtitle = document.getElementById('subtitle');
dropSubtitle.addEventListener("dragenter", dragEnterSubtitleFile, false);
dropSubtitle.addEventListener("dragover", dragOverSubtitleFile, false);
dropSubtitle.addEventListener("drop", dropSubtitleFile, false);

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
  	
	MovieFile = event.dataTransfer.files[0].path;

	var str = path.basename(MovieFile);
	arrMovieName = str.match(regex);
	
	MovieName = arrMovieName[0].replace(/\./g, ' ');
	
	MovieName = MovieName.match(regex2);
	
	document.getElementById('spinnerCover').style.display = "block"
	
	request({url:"http://www.omdbapi.com", qs:{t:MovieName.join(' ')}}, function(err, response, body) {
		if(err) { console.log(err); return; }
		var json = JSON.parse(body)
		console.log(body, 'body response moviedb');
		document.getElementById('movieCoverGUI').src = json.Poster
		document.getElementById('director').innerHTML = json.Director
		document.getElementById('writer').innerHTML = json.Writer
		document.getElementById('plot').innerHTML = json.Plot
		
		document.getElementById('spinnerCover').style.display = "none"
		document.getElementById('okMovie').src = 'img/ok.png';
	});
}

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
  	
	SubtitleFile = event.dataTransfer.files[0].path;
	document.getElementById('okSubtitle').src = "img/ok.png";
}

var statusCounter = 0;

function requestStream(){
	if(statusCounter == 0){
		render(MovieFile, SubtitleFile);	
		statusCounter = statusCounter + 1;	
	}else if(statusCounter > 0){
		console.log('task already proccesing');
	}
}

var infoMovie = false;

function showInfoMovie(){
	if(infoMovie == false){
		document.getElementById('movieInfo').style.display = 'block'
		infoMovie = true;
	}else{
		document.getElementById('movieInfo').style.display = 'none'
		infoMovie = false;
	}
}

initServer();
AirplayStatus();