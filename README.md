#### Stream local files to appleTV with subtitle support
---

This code uses node-airplay to srteam to appleTV, and ffmpeg to burn subtitle track without re-encode the video file

At this time, the code is inmature to release a stable version, and no have a GUI, but the core is ready, im working fast as i can.

For the code of the file server i used the code of Paolo Rossi, you can look it [Here](https://gist.github.com/paolorossi/1993068). I want do some modifications in the near future, to adapt better to my code, and extend some functionalities.

Actually i have an issue when the streaming start, its works fine for 1 minute only cause the connection to appleTV timed out.
