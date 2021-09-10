# MusicBookPlayer.js
DHTML audio player displaying booklet pages for audio tracks

<a id="contents"></a>**Contents**<br>
[1&emsp;Introduction](#intruduction)<br>
[2&emsp;Create Your Own Music Book](#cyomb)<br>
&emsp;&ensp;[2.1&emsp;Prerequisites](#prerequisites)<br>
&emsp;&ensp;[2.2&emsp;Setup](#setup)<br>
[3&emsp;API Documentation](#apidoc)<br>
[References](#references)

<a id="intruduction"></a>
## 1&emsp;Introduction
A music book is playlist of audio files (also called _tracks_) including a HTML/Javascript-based player. A music book consists of one or several _pages_ per audio file. Each page displays an image and, optionally, a description text. If there are several pages for one audio file, we will call the respective audio segments _parts_. Each part is defined by an offset in its audio file. The structure of a music book is as follows:
1. Cover page (1x)
2. Audio track or part pages (Nx)
3. Table of contents (1x, created automatically)

`MusicBookPlayer.js` features audio controls (play/pause, time rail), play list contols (next, previous, contents), and a [live audio spectrum analyzer](https://audiomotion.dev/#/). In a browser, a music book will be displayed like this (click on images to enlarge):

| Cover page example | Part page example | Contents page example | 
| :---: |  :---: |  :---: | 
| <img src="docs/img/MusicBookPlayer_Screenshot_01.jpg" style="width:20rem" alt="MusicBookPlayer: Cover page example"/> | <img src="docs/img/MusicBookPlayer_Screenshot_02.jpg" style="width:20rem" alt="MusicBookPlayer: Cover page example"/> | <img src="docs/img/MusicBookPlayer_Screenshot_03.jpg" style="width:20rem" alt="MusicBookPlayer: Cover page example"/> |

<a id="cyomb"></a>
## 2&emsp;Create Your Own Music Book
The `MusicBookPlayer.js` library is to allow you creating your own music books. It is optimized for smartphones but it will work on tablets and desktop devices as well. `MusicBookPlayer.js` will run locally and on webservers.

<a id="prerequisites"></a>
### 2.1&emsp;Prerequisites
To setup your own music book, you need the following:
1. a bunch of audio files<sup>1)</sup>
2. a cover image for the book<sup>2)</sup>
3. an image for each page of the book<sup>2)</sup>
4. optionally, a description text for the book and for each page<sup>3)</sup>

<sup>1)</sup> preferably MP3s<br>
<sup>2)</sup> preferably square JPEGs, e.g. 600 x 600 px<br>
<sup>3)</sup> may contain HTML markup

<a id="setup"></a>
### 2.2&emsp;Setup
1. Create a folder for the music book on your local device or your webserver and copy the audio and image files to that folder (see [demo folder](demo/) for an example).
2. Create an `index.html` file containing the following code in the music book folder:
```html
<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="Content-Type" content="text/html"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/> 
  <link rel="shortcut icon" href="https://matthias-wolff.github.io/MusicBookPlayer.js/img/MusicBookPlayer.ico"/>
  <link rel="icon" href="https://matthias-wolff.github.io/MusicBookPlayer.js/img/MusicBookPlayer.ico"/>
  <link rel="stylesheet" type="text/css" media="screen" href="https://matthias-wolff.github.io/MusicBookPlayer.js/css/styles.css"/>
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
  <script type="text/javascript" src="https://matthias-wolff.github.io/MusicBookPlayer.js/js/mediaelement-and-player.min.js"></script>
  <script type="text/javascript" src="https://matthias-wolff.github.io/MusicBookPlayer.js/js/musicbookplayer.js"></script>
</head>
<body>

  <!-- Initialize Music Book here -->  
  <script type="text/javascript">
    MusicBookPlayer.create({              // Create music book (see API description below)
        //mediaBaseURI: document.baseURI, // Can be omitted when document base URI
        title : 'Music book title',       // Mandatory
        artist: 'Music book artist',      // Mandatory
        image : 'CoverImage.jpg',         // Mandatory 
        descr : 'Music book descripion',  // Optional
      });
    MusicBookPlayer.addPage({             // Add a page (see API description below)
        tid   : 1,                        // Mandatory: Track ID
        title : 'Track title',            // Mandatory
        audio : 'TrackAudio.mp3',         // Mandatory for tracks
        image : 'TrackImage.jpg',         // Mandatory
        descr : 'Track description',      // Optional
      });
    // More pages...
  </script>

  <!-- Create spectrum analyzer (must be on end of page body1!) -->
  <script src="https://matthias-wolff.github.io/MusicBookPlayer.js/js/audioMotion.js" type="module"></script>

</body>
</html>
```
3. _Optionally:_ If you want to host an own installation of `MusicBookPlayer.js`, check out or fork the `MusicBookPlayer.js` library and copy the contents to a local folder or to a folder on your webserver. In the `index.html` file of your music book, replace all occurrances of `https://matthias-wolff.github.io/MusicBookPlayer.js/` by the URL of your copy of the `MusicBookPlayer.js` library.<br>**Note:** All `*.md` files and the `demo` folder of your copy can be deleted.
4. Initialize your music book in Javascript section `<!-- Initialize Music Book here -->` of `index.html` (see [API Documentation](#apidoc) below).

<a id="apidoc"></a>
## 3&emsp;API Documentation
<span style="background-color:#FFFF00;"><b>[TODO:</b> ...<b>]</b></span>

<a id="references"></a>
## References
<span style="background-color:#FFFF00;"><b>[TODO:</b> ...<b>]</b></span>
