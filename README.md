#### Stream local files to appleTV with subtitle support
---
![LocalTV Main Screen](http://legalintelligence.cl/localtv/home.png)
![LocalTV Movie Screen](http://legalintelligence.cl/localtv/movie.png)


This code uses node-airplay to srteam to appleTV, and ffmpeg (at the moment you must have installed ffmpeg in /usr/bin/) to burn subtitle track without re-encode the video file

The app only support *.mp4 files and *.srt for subtitles, the app has a poster download feature. (in my roadmap i hope develop a autodownload subtitle file for spanish users)

~~At this time, the code is inmature to release a stable version, and no have a GUI, but the core is ready, im working fast as i can.~~~

Now i have a beta release only for Mac OSX, ive tested this app on my MacBoock Pro with Mavericks, and works really fine, i have an issue when i stream large movies, 1 hour or more, but it has by my router, cause this has no sreaming capabilies, my router is an linksys with a DDWRT, i recommend a 5ghz band router.

For the code of the file server i used the code of Paolo Rossi, you can look it [Here](https://gist.github.com/paolorossi/1993068). I want do some modifications in the near future, to adapt better to my code, and extend some functionalities.

~~Actually i have an issue when the streaming start, its works fine for 1 minute only cause the connection to appleTV timed out.~~

---
#### Instructions to use:
* Drag the movie to the "Movie" section (only .mp4 files)
* Drag the Subtitle to the "Subtile" section (only .srt files)
* You can download the beta from [Here](http://legalintelligence.cl/localtv/LocalTV.zip)