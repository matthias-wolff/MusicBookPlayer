# MusicBookPlayer.js
DHTML audio player displaying booklet pages for audio tracks. 

<a id="contents"></a>**Contents**<br>
[1&emsp;Introduction](#intruduction)<br>
[2&emsp;Create Your Own Music Book](#cyomb)<br>
&emsp;&ensp;[2.1&emsp;Prerequisites](#prerequisites)<br>
&emsp;&ensp;[2.2&emsp;Setup](#setup)<br>
[3&emsp;API Documentation](#apidoc)<br>
[References](#references)

<a id="intruduction"></a>
## 1&emsp;Introduction
First have a look at the [demo](https://matthias-wolff.github.io/MusicBookPlayer.js/demo).

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
You will only need the two static methods described in the following. The complete documentation of `MusicBookPlayer.js` can be found [here](https://matthias-wolff.github.io/MusicBookPlayer.js/docs/index.html).

### `static MusicBookPayer.create(props)`
Creates the MusicBookPlayer pseudo-singleton. If the object is already existing, the method just returns it. If the singleton is not yet existing, the method creates it and writes the MusicBookPlayer HTML page into the current document. 

#### Parameters:
<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td>props</td><td>Object</td><td>Music book properties</td></tr>
  <tr><td></td><td></td><td><i>Properties</i><table>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
    <tr><td>mediaBaseURI</td><td>string</td><td>Absolute base URI of the book's media files (optional,<br>default undefined: use document base URI)</td></tr>
    <tr><td>title</td><td>string</td><td>Music book title</td></tr>
    <tr><td>artist</td><td>string</td><td>Artist name</td></tr>
    <tr><td>image</td><td>string</td><td>Cover image file name relative to mediaBaseURI</td></tr>
    <tr><td>descr</td><td>string</td><td>Description text (optional, may contain HTML)</td></tr>
  </table></td></tr>
</table>

#### Returns:
The pseudo-singleton, (object, also stored in global variable musicBookPlayer) 

### `static MusicBookPayer.addPage(props)`
Adds a new page to the MusicBookPlayer. 

#### Parameters:
<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td>props</td><td>Object</td><td>Page properties</td></tr>
  <tr><td></td><td></td><td><i>Properties</i><table>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
    <tr><td>tid</td><td>integer</td><td>One-based track number</td></tr>
    <tr><td>title</td><td>string</td><td>Page&mdash;i.e., track or part&mdash;title</td></tr>
    <tr><td>artist</td><td>string</td><td>Artist name (optional, default undefined: use book's artist)</td></tr>
    <tr><td>audio</td><td>string</td><td>Audio file name <sup>1) 2)</sup></td></tr>
    <tr><td>image</td><td>string</td><td>Image file name <sup>2)</sup></td></tr>
    <tr><td>descr</td><td>string</td><td>Description text (optional, may contain HTML)</td></tr>
    <tr><td>part</td><td>string</td><td>Part title (optional, default undefined: page is a whole track rather<br>than a part of a track)</td></tr>
    <tr><td>poffs</td><td>float</td><td>The time offset in seconds if the page is part of a track (optional,<br>default undefined: page is a whole track)</td></tr>
  </table>
  Footnotes:<br>
  <sup>1)</sup> mandatory, URL must be unique!<br>
  <sup>2)</sup> absolute or relative to mediaBaseURI
  </td></tr>
</table>

#### Returns:
The newly created page

<a id="references"></a>
## References
<span style="background-color:#FFFF00;"><b>[TODO:</b> ...<b>]</b></span>
