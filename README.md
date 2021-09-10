# MusicBookPlayer.js
DHTML audio player displaying booklet pages for audio tracks

[1&emsp;Introduction](#intruduction)<br>
[2&emsp;Create Your Own Music Book](#cyomb)<br>
&emsp;&ensp;[2.1&emsp;Prerequisites](#prerequisites)<br>
&emsp;&ensp;[2.2&emsp;Setup](#setup)<br>
[3&emsp;API Documentation](#apidoc)

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

See the [demo](demo folder) for a working example.

<a id="setup"></a>
### 2.2&emsp;Setup
1. Create a folder for the music book on your local device or your webserver and copy the audio and image files to that folder (see [demo](demo folder) for an example)
2. Create an `imdex.html` file containing the following HTML code in the music book folder:
```html
<video autoplay controls class="player" id="player1" height="360"
	width="100%" loop muted poster="/path/to/poster.jpg"
	preload="none" src="/path/to/media.mp4"
	style="max-width: 100%" tabindex="0" title="MediaElement">
</video>
```
3. _Optionally:_ If you want to host an own installation of `MusicBookPlayer.js`, check out or fork the `MusicBookPlayer.js` library and copy the contents to a local folder or to a folder on your webserver. In the `index.html` file of your music book, replace all occurrances of `https://matthias-wolff.github.io/MusicBookPlayer.js/` by the URL of your copy of the `MusicBookPlayer.js` library.<br>**Note:** All `*.md` files and the `demo` folder of your copy can be deleted.
4. ...

<a id="apidoc"></a>
## API Documentation
