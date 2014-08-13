#### Stream local files to appleTV with subtitle support
---
![LocalTV Main Screen](http://legalintelligence.cl/localtv/home.png)
![LocalTV Movie Screen](http://legalintelligence.cl/localtv/movie.png)
![LocalTV Burning subtitle Screen](http://legalintelligence.cl/localtv/burning.png)
![LocalTV Streaming Screen](http://legalintelligence.cl/localtv/streaming.png)
![LocalTV Update Screen](http://legalintelligence.cl/localtv/update.png)

This code uses node-airplay to stream to appleTV, and ffmpeg ~~(at the moment you must have installed ffmpeg in /usr/bin/)~~ to burn subtitle track without re-encode the video file, ~~you can download a ffmpeg binary from [Here](http://www.evermeet.cx/ffmpeg/ffmpeg-2.3.1.7z)~~

The app only support *.mp4 files and *.srt for subtitles, the app has a poster download feature. (in my roadmap i hope develop a autodownload subtitle file for spanish users)

~~At this time, the code is inmature to release a stable version, and no have a GUI, but the core is ready, im working fast as i can.~~

Now i have a beta release only for Mac OSX, ive tested this app on my MacBoock Pro with Mavericks, and works really fine, ~~i have an issue when i stream large movies, 1 hour or more, but it has by my router, cause this has no sreaming capabilies, my router is an linksys with a DDWRT, i recommend a 5ghz band router.~~

For the code of the file server i used the code of Paolo Rossi, you can look it [Here](https://gist.github.com/paolorossi/1993068). I want do some modifications in the near future, to adapt better to my code, and extend some functionalities.

~~Actually i have an issue when the streaming start, its works fine for 1 minute only cause the connection to appleTV timed out.~~

---
#### Instructions to use:
* Drag the movie to the "Movie" section (only .mp4 files)
* Drag the Subtitle to the "Subtile" section (only .srt files)

#### You can download the STABLE Release from [Here](http://legalintelligence.cl/localtv/LocalTV_0.2.1.dmg) (Last Updated: 12/08/2014 - 14:39)

#### Changelog
* 09/08/2014
* First Stable realease
* Bugs fixes (ip server, drag files on diferent area cause crash, uncaught error handle)
* Add resume playback, when the streams go out or when you stop the stream on your atv
* Playlist for see tv shows has started to develop

* 11/08/2014
* Check updates feature
* dmg compressed container
* Bug fix at resume playback feature
* Add no poster screen
* Stability bug fixes

* 12/08/2014
* Add analytics

#### Known Issues
* LocalTV airplay icon always stay red, thats meens LocalTV didnt found a atv device, the issue is caused by a blocking connection in your mac, sometimes the PF Firewall causes that, you can manage with this app [IceFloor](http://www.hanynet.com/icefloor/), turn off the PF Firewall and thats all.
* LocalTV may crash when the filename of the movie hasn't this name format [MovieName.year ex: Divergent.2014.720p.BluRay.x264.YIFY.mp4], im working to solve this issue

#### LocalTV streaming to my AppleTV

![LocalTV Streaming Screen](http://legalintelligence.cl/localtv/cap.png)
