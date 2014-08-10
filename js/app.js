var http = require('http'),
	fs = require('fs'),
	util = require('util'),
	OS = require('os'),
	spawn = require('child_process').spawn,
	airplay = require('airplay-js'),
	path = require('path'),
	request = require('request'),
	gui = require('nw.gui');

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});
	
var coverUrl;

var regex = /(.+?)\W?(\d{4})/g;
var regex2 = /([a-zA-Z]+)/g;

var browser = airplay.createBrowser();
 
var tmpDir = OS.tmpdir();
var tmpFile = tmpDir + '/localTV.mp4';

var sourceSize;
var tmpFileSize;

var portServer = 1337;
var ipServer;

var devices = [];

var timer;

var lastPosition;
var totalDuration;

var hashTempFIle;

var rendering = false;

var mb = new gui.Menu({type:"menubar"});
mb.createMacBuiltin("LocalTV");
gui.Window.get().menu = mb;

browser.on( 'deviceOn', function( device ) {
	devices.push(device);
//	console.log(devices, 'atv data founds');
});

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	ipServer = add;
})

function fileHash(fileName){
	var crypto = require('crypto');	
	var shasum = crypto.createHash('sha1');
	
	var s = fs.ReadStream(fileName);
	s.on('data', function(d) {
	  shasum.update(d);
	});
	
	s.on('end', function() {	  
	  hashTempFIle = shasum.digest('hex')
	  
	 // console.log(hashTempFIle, 'Hash temp file');
	});
}

var hasRequested = false;

var DEBUG = true;

//FIX multiple playback request

function render(fileSource, subtitleSource){
	
	if(typeof hashTempFIle === 'undefined' && typeof lastPosition != 'undefined'){
		
		if(hasRequested == false){
			
			hasRequested = true;
					
			console.log('Burning Subtitle');
					
			fileL = path.basename(fileSource);
					
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
					startStream();
					
					hasRequested = false;		
				}
			})
		
			ffmpeg.on('error', function(error){
				console.log(error, 'ffmpeg error');
			});
		}
		
	}else{
		console.log('Direct Stream');
		startStream();
	}
		

}

function initServer(){
	console.log('Starting HTTP server');
	
	var server = http.createServer(function (req, res) {
	
		var path = tmpFile;
		var stat = fs.statSync(path);
		var total = stat.size;
		
		req.on("close", function() {
			document.getElementById('streamingScr').style.display = "none";	
			streamStatus();
		});
		
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
		
						
	}).listen(portServer, ipServer, function(){
		console.log('HTTP Server Started');
	});
}

function startStream(){	
	console.log('Streaming to AppleTV');
	var position;
	
	var stat = fs.statSync(tmpFile);
	tmpFileSize = stat.size;	
	
	if(devices.length > 0){
	
		devices.forEach(function(device){
			console.log(device);
			
			if(lastPosition){
				position = lastPosition/totalDuration;
			}else{
				postion = 0;
			}
						
			device.play('http://'+ipServer+':'+portServer, position, function(status){
				console.info(status, 'Playing video');				
				
				if(DEBUG === true) console.info(status.body, 'body request play');
				
				fileHash(tmpFile);
			});
			
		});			

	}else{
		message('no AppleTV Found');
	}
}

var looping = true;

//FIX

function AirplayStatus(){

	if(looping == true){
		setTimeout(function(){
			console.log(looping, 'Discovering atv');
			
			if(devices.length > 0){
				console.log('AppleTV Found');
				
				if(DEBUG === true)console.log(devices);
				
				document.getElementById('iconAirplayStatus').src = 'img/iconAirplayGreen.png'
				//clearInterval(timer);
				looping = false;
			}else if(devices.length === 0){
//				document.getElementById('iconAirplayStatus').src = 'img/iconAirplayRed.png'	
			}
			process.nextTick(AirplayStatus);
		}, 1000);
	}
}

function streamStatus(){
	if(DEBUG === true) console.log('straemStatus init');
	
	devices[0].status(function(s){
		
		if(DEBUG === true) console.warn(s, 'streamStatus')
		
		if(typeof s === 'undefined'){
			document.getElementById('streamingScr').style.display = "none";	
		}else{
			document.getElementById('streamingScr').style.display = "block";
			
			if(lastPosition >= s.position){
				lastPosition = s.position;
				totalDuration = s.duration;
			}
			
			if(DEBUG === true) console.log(lastPosition, 'streamStatus running');
		}
	})
}


function message(m){
	console.log(m);
}

var dropMovie;
var dropSubtitle;

var MovieFile;
var SubtitleFile;

var doc = document.documentElement

doc.ondrop = function(event){
	event.preventDefault && event.preventDefault();
	
	elId = event.target.id;
	
	switch(elId){
	
		case('movie'):
			dropMovieFile(event);
		break;
		
		case('subtitle'):
			dropSubtitleFile(event);
		break;
		
		default:
			doNothing(event);
		
	}
}

doc.ondragover = function(event){
	elId = event.target.id;
	
	switch(elId){
	
		case('movie'):
			dragEnterMovieFile(event);
		break;
		
		case('subtitle'):
			dragEnterSubtitleFile(event);
		break;
	
		default:
			doNothing(event);
	}
}

function doNothing(e){
	e.stopPropagation();
 	e.preventDefault();
}


function dragEnterMovieFile(e){
	e.stopPropagation();
 	e.preventDefault();
	document.getElementById('okMovie').src = '';
}

function dropMovieFile(e){
	e.stopPropagation();
 	e.preventDefault();
  	
	MovieFile = event.dataTransfer.files[0].path;
	
	hashTempFIle = undefined;
	lastPosition = 0;
	totalDuration = 0;
	
	var str = path.basename(MovieFile);
	arrMovieName = str.match(regex);

	// FIX Homeland.S03E02 no year
	
	MovieName = arrMovieName[0].replace(/\./g, ' ');
	
	MovieName = MovieName.match(regex2);
			
	fs.exists(tmpDir + arrMovieName[0] + ".jpg", function(exists){
		if(exists){
			document.getElementById('okMovie').src = 'img/ok.png';	
			document.getElementById('movieCoverGUI').src = tmpDir + arrMovieName[0] + ".jpg"	
		}else{
			document.getElementById('spinnerCover').style.display = "block"
			
			request({url:"http://www.omdbapi.com", qs:{t:MovieName.join(' ')}}, function(err, response, body) {
				if(err) { 
					console.log(err); 
					return; 
				}
				
				var json = JSON.parse(body)
		//		console.log(body, 'body response moviedb');
				
				if(json.Poster === 'N/A'){
					document.getElementById('movieCoverGUI').src = "img/noCover.png";
					document.getElementById('spinnerCover').style.display = "none"
					document.getElementById('okMovie').src = 'img/ok.png';
				}else{
		
					document.getElementById('movieCoverGUI').src = json.Poster					
					document.getElementById('spinnerCover').style.display = "none"
					document.getElementById('okMovie').src = 'img/ok.png';
					
					saveCover(json.Poster, arrMovieName[0]);
				}
			});
		}
	});
}

function saveCover(url, movieFileName){
	console.log('saving cover to hdd');
	
	var cover = fs.createWriteStream(tmpDir + movieFileName +".jpg");
	var request = http.get(url, function(response) {
	  response.pipe(cover);
	});
}

function dragEnterSubtitleFile(e){
	e.stopPropagation();
 	e.preventDefault();
	document.getElementById('okSubtitle').src = '';
}

function dropSubtitleFile(e){
	e.stopPropagation();
 	e.preventDefault();
  	
	SubtitleFile = event.dataTransfer.files[0].path;
	document.getElementById('okSubtitle').src = "img/ok.png";
}

function requestStream(){
	console.log('requesting stream');
	render(MovieFile, SubtitleFile);
}

initServer();
AirplayStatus();

//streamStatus();