# MusicBookPlayer.js&ensp;[&rang;&rang;&thinsp;Demo](https://matthias-wolff.github.io/MusicBookPlayer.js/demo)
DHTML audio player displaying booklet pages for audio tracks and parts of audio tracks. 

| Cover Page Example | Part-of-Track Page Example | Contents Page Example | 
| :---: |  :---: |  :---: | 
| <img src="https://matthias-wolff.github.io/MusicBookPlayer.js/docs/img/MusicBookPlayer_Screenshot_01.jpg" style="width:20rem" alt="MusicBookPlayer: Cover page example"/><br>&nbsp; | <img src="https://matthias-wolff.github.io/MusicBookPlayer.js/docs/img/MusicBookPlayer_Screenshot_02.jpg" style="width:20rem" alt="MusicBookPlayer: Cover page example"/><br>&nbsp;(click on images to enlarge) | <img src="https://matthias-wolff.github.io/MusicBookPlayer.js/docs/img/MusicBookPlayer_Screenshot_03.jpg" style="width:20rem" alt="MusicBookPlayer: Cover page example"/><br>&nbsp; |

<a id="contents"></a>**Contents**<br>
[1&emsp;Introduction](#intruduction)<br>
[2&emsp;Create Your Own Music Book](#cyomb)<br>
&emsp;&ensp;[2.1&emsp;Prerequisites](#prerequisites)<br>
&emsp;&ensp;[2.2&emsp;Setup](#setup)<br>
&emsp;&ensp;[2.2&emsp;Customization](#customization)<br>
[3&emsp;API Documentation](#apidoc)<br>
[4&emsp;Tested Configurations](#testedConfigs)<br>
[References](#references)

<a id="intruduction"></a>
## 1&emsp;Introduction
A music book is playlist of audio tracks, each accompanied by an image and an optional description text &ndash; much like a good old-fashioned audio CD with a booklet. Each audio track may be split into several _parts_ which show their own images and description texts. A music book is structured as follows:
1. Cover page (1&times;)
2. Audio pages (<var>n</var>&times;, one per audio track or serveral part pages per audio track)
3. Contents page (1&times;, created automatically)

`MusicBookPlayer.js` is a DHTML/Javascript-based player for music books. It features audio controls (play/pause, time rail), play list controls (next, previous, contents), and a [live audio spectrum analyzer](https://audiomotion.dev/#/) &ndash; see screenshots above.

**[Click here to see a demo](https://matthias-wolff.github.io/MusicBookPlayer.js/demo).**

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
1. Create a folder for the music book on your local device or your webserver and copy the audio and image filesyour book to that folder (see [demo folder](https://github.com/matthias-wolff/MusicBookPlayer.js/blob/main/demo/) for an example).
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
    MusicBookPlayer.addAudioPage({        // Add an audio page (see API description below)
        tid   : 1,                        // Mandatory: Track ID
        title : 'Track title',            // Mandatory
        audio : 'TrackAudio.mp3',         // Mandatory for tracks
        image : 'TrackImage.jpg',         // Mandatory
        descr : 'Track description',      // Optional
      });
    // More audio pages...
  </script>

  <!-- Create spectrum analyzer (must be on end of page body1!) -->
  <script src="https://matthias-wolff.github.io/MusicBookPlayer.js/js/audioMotion.js" type="module"></script>

</body>
</html>
```
3. _Optionally:_ If you want to host an own installation of `MusicBookPlayer.js`, check out or fork the `MusicBookPlayer.js` library and copy the contents to a local folder or to a folder on your webserver. In the `index.html` file of your music book, replace all occurrances of `https://matthias-wolff.github.io/MusicBookPlayer.js/` by the URL of your copy of the `MusicBookPlayer.js` library.<br>**Note:** All `*.md` files and the `demo` folder of your copy can be deleted.
4. Initialize your music book in Javascript section `<!-- Initialize Music Book here -->` of `index.html` (see [API Documentation](#apidoc) below).

<a id="customization"></a>
### 2.3&emsp;Customization
The player skin is competely controlled by a stylesheet. Download [`css/styles.css`](https://github.com/matthias-wolff/MusicBookPlayer.js/blob/main/css/styles.css), modify it to your needs and have your HTML include your style file instead of the default one &ndash; that's it.

<a id="apidoc"></a>
## 3&emsp;API Documentation
You will only need the two static methods described in the following. [Click here to see the full documentation](https://matthias-wolff.github.io/MusicBookPlayer.js/docs/MusicBookPlayer.js/1.0.0/MusicBookPlayer.html).

### `static MusicBookPayer.create(props)`
Creates the MusicBookPlayer pseudo-singleton. If the object is already existing, the method just returns it. If the singleton is not yet existing, the method creates it and writes the MusicBookPlayer HTML page into the current document. 

#### Parameters:
<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td><code>props</code></td><td>Object</td><td>Music book properties</td></tr>
  <tr><td></td><td></td><td><b><i>Properties</i></b><table>
    <tr><th>Name</th><th>Type</th><th>Attributes</th><th>Description</th></tr>
    <tr><td><code>mediaBaseURI</code></td><td>string</td><td>&lt;optional&gt;</td><td>Absolute base URI of the book's<br> media files, i.e., audio and image<br> files. If omitted, the HTML document<br> base URI will be used, which means<br> that themedia files are located in the<br> same folder as <code>index.html</code>.</td></tr>
    <tr><td><code>title</code></td><td>string</td><td> </td><td>Music book title</td></tr>
    <tr><td><code>artist</code></td><td>string</td><td> </td><td>Artist name</td></tr>
    <tr><td><code>image</code></td><td>string</td><td> </td><td>Cover image file name relative to<br> <code>mediaBaseURI</code></td></tr>
    <tr><td><code>descr</code></td><td>string</td><td>&lt;optional&gt;</td><td>Description text, may contain HTML</td></tr>
  </table></td></tr>
</table>

#### Returns:
The pseudo-singleton, (object, also stored in global variable musicBookPlayer) 

### `static MusicBookPayer.addAudioPage(props)`
Adds a new audio page to the MusicBookPlayer. 

#### Parameters:
<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td><code>props</code></td><td>Object</td><td>Page properties</td></tr>
  <tr><td></td><td></td><td><b><i>Properties</i></b><table>
    <tr><th>Name</th><th>Type</th><th>Attributes</th><th>Description</th></tr>
    <tr><td><code>tid</code></td><td>integer</td><td> </td><td>One-based track number</td></tr>
    <tr><td><code>title</code></td><td>string</td><td> </td><td>Page title</td></tr>
    <tr><td><code>artist</code></td><td>string</td><td>&lt;optional&gt;</td><td>Artist name. If omitted, the book's<br> artist name will be used.</td></tr>
    <tr><td><code>audio</code></td><td>string</td><td> </td><td>Audio file name <sup>1) 2)</sup></td></tr>
    <tr><td><code>image</code></td><td>string</td><td> </td><td>Image file name <sup>2)</sup></td></tr>
    <tr><td><code>descr</code></td><td>string</td><td>&lt;optional&gt;</td><td>Description text, may contain HTML</td></tr>
    <tr><td><code>part</code></td><td>string</td><td>&lt;optional&gt;</td><td>Part title. If omitted, the page is a whole<br> track rather than a part of a track.</td></tr>
    <tr><td><code>poffs</code></td><td>float</td><td>&lt;optional&gt;</td><td>The time offset in seconds if the page is<br> part of a track</td></tr>
  </table>
  Footnotes:<br>
  <sup>1)</sup> Mandatory for tracks. Omit for parts! Track URL must be unique!<br>
  <sup>2)</sup> absolute or relative to <code>mediaBaseURI</code>
  </td></tr>
</table>

#### Returns:
The newly created page

<a id="testedConfigs"></a>
## 4&emsp;Tested Configurations
|                                                                                      | Browser | Version | OS         | Particular Issues                   |
| ------------------------------------------------------------------------------------ | :------ | :------ | :--------- | :---------------------------------- |
| ![Chrome](https://matthias-wolff.github.io/MusicBookPlayer.js/docs/img/chrome.png)   | Chrome  | 93.0    | Android    | Minor: Cover dummy track not played |
| ![Chrome](https://matthias-wolff.github.io/MusicBookPlayer.js/docs/img/chrome.png)   | Chrome  | 93.0    | Windows 10 | Minor: Cover dummy track not played |
| ![Edge](https://matthias-wolff.github.io/MusicBookPlayer.js/docs/img/edge.png)       | Edge    | 93.0    | Windows 10 | Minor: Cover dummy track not played |
| ![Firefox](https://matthias-wolff.github.io/MusicBookPlayer.js/docs/img/firefox.png) | Firefox | 91.4    | Android    | _none_                              |
| ![Firefox](https://matthias-wolff.github.io/MusicBookPlayer.js/docs/img/firefox.png) | Firefox | 93.0    | Windows 10 | _none_                              |

More to be tested. **Help wanted** (see [issue #2](https://github.com/matthias-wolff/MusicBookPlayer.js/issues/2))!

<a id="references"></a>
## References
* [jQuery](https://jquery.com/)
* [MediaElement.js](https://github.com/mediaelement/mediaelement)
  * [Documentation](https://github.com/mediaelement/mediaelement/tree/master/docs). (retrieved Aug. 27, 2021)
  * designmodo: [How to Create an Audio Player in jQuery, HTML5 & CSS3](https://designmodo.com/audio-player/). (retrieved Aug. 27, 2021)
  * design shack: [Creating a Custom HTML5 Audio Element UI](https://designshack.net/articles/css/custom-html5-audio-element-ui/). (retrieved Aug. 27, 2021)
* [Spectrum Analyzer](https://audiomotion.dev/#/) by audioMotion
* Lazy debouncer:
  * J. Albers-Zoller: [SelfHTML, JavaScript/Tutorials/Debounce und Throttle](https://wiki.selfhtml.org/wiki/JavaScript/Tutorials/Debounce_und_Throttle). (retrieved Sept. 8, 2021)
  * J. Ashkenas: [Underscore.js](https://underscorejs.org/">Underscore.js). (retrieved Sept. 8, 2021)
* [Loading animation](https://loading.io) by PlotDB Ltd.

