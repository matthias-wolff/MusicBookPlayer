# MusicBookPlayer&ensp;[&rang;&rang;&thinsp;Demo](https://matthias-wolff.github.io/MusicBookPlayer/demo)
DHTML audio player displaying booklet pages for audio tracks and parts of audio tracks. 

| Cover Page Example | Part-of-Track Page Example | Contents Page Example | 
| :---: |  :---: |  :---: | 
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/MusicBookPlayer_Screenshot_01.jpg" style="width:20rem" alt="MusicBookPlayer: Cover page example"/> | <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/MusicBookPlayer_Screenshot_02.jpg" style="width:20rem" alt="MusicBookPlayer: Cover page example"/> | <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/MusicBookPlayer_Screenshot_03.jpg" style="width:20rem" alt="MusicBookPlayer: Cover page example"/> |

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
3. Contents page (1&times;)

MusicBookPlayer is a DHTML/Javascript-based player for music books. It features audio controls (play/pause, time rail), play list controls (next, previous, contents), and a [live audio spectrum analyzer](https://audiomotion.dev/#/) &ndash; see screenshots above.

**[Click here to see a demo](https://matthias-wolff.github.io/MusicBookPlayer/demo).**

<a id="cyomb"></a>
## 2&emsp;Create Your Own Music Book
The MusicBookPlayer library is to allow you creating your own music books. It is optimized for smartphones but it will work on tablets and desktop devices as well. MusicBookPlayer will run locally and on webservers.

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
1. Create a folder for the music book on your local device or your webserver and copy the audio and image filesyour book to that folder (see [demo folder](https://github.com/matthias-wolff/MusicBookPlayer/blob/main/demo/) for an example).
2. Create an `index.html` file containing the following code in the music book folder:
```html
<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="Content-Type" content="text/html"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/> 
  <link rel="shortcut icon" href="https://matthias-wolff.github.io/MusicBookPlayer/img/MusicBookPlayer.ico"/>
  <link rel="icon" href="https://matthias-wolff.github.io/MusicBookPlayer/img/MusicBookPlayer.ico"/>
  <link rel="stylesheet" type="text/css" media="screen" href="https://matthias-wolff.github.io/MusicBookPlayer/css/styles.css"/>
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
  <script type="text/javascript" src="https://matthias-wolff.github.io/MusicBookPlayer/js/mediaelement-and-player.min.js"></script>
  <script type="text/javascript" src="https://matthias-wolff.github.io/MusicBookPlayer/js/musicbookplayer.js"></script>
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
        title : 'Track title',            // Mandatory for tracks
        audio : 'TrackAudio.mp3',         // Mandatory for tracks
        image : 'TrackImage.jpg',         // Mandatory but not enforced
        descr : 'Track description',      // Optional
      });
    // More audio pages...
    MusicBookPlayer.addTocPage();         // Add table-of-contents page (see API description below)
  </script>

  <!-- Create spectrum analyzer (must be at end of page body!) -->
  <script src="https://matthias-wolff.github.io/MusicBookPlayer/js/audioMotion.js" type="module"></script>

</body>
</html>
```
3. _Optionally:_ If you want to host an own installation of MusicBookPlayer, check out or fork the MusicBookPlayer library and copy the contents to a local folder or to a folder on your webserver. In the `index.html` file of your music book, replace all occurrances of `https://matthias-wolff.github.io/MusicBookPlayer/` by the URL of your copy of the MusicBookPlayer library.<br>**Note:** All `*.md` files and the `demo` folder of your copy can be deleted.
4. Initialize your music book in Javascript section `<!-- Initialize Music Book here -->` of `index.html` (see [API Documentation](#apidoc) below).

<a id="customization"></a>
### 2.3&emsp;Customization
The player skin is competely controlled by a stylesheet. Download [`css/styles.css`](https://github.com/matthias-wolff/MusicBookPlayer/blob/main/css/styles.css), modify it to your needs and have your HTML include your style file instead of the default one &ndash; that's it.

<a id="apidoc"></a>
## 3&emsp;API Documentation
MusicBookPlayer is implemented as a singleton, i.e., you can have only one instance per HTML page. If you want multiple instances, please use `&lt;frame&grt;`s or `&lt;iframe&grt;`s. To create your own music book you will need only three static methods:
1. [`MusicBookPayer.create(props)`](#MusicBookPayer.create),
2. [`MusicBookPayer.addAudioPage(props)`](#MusicBookPayer.addAudioPage), and
3. [`MusicBookPayer.addTocPage()`](#MusicBookPayer.addTocPage).

[Click here to see the full documentation](https://matthias-wolff.github.io/MusicBookPlayer/docs/MusicBookPlayer/1.0.0/MusicBookPlayer.html).

<a id="MusicBookPayer.create"></a>
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
    <tr><td><code>image</code></td><td>string</td><td> </td><td>Cover image URL, absolute or relative<br> to <code>mediaBaseURI</code></td></tr>
    <tr><td><code>descr</code></td><td>string</td><td>&lt;optional&gt;</td><td>Description text, may contain HTML</td></tr>
  </table></td></tr>
</table>

#### Returns:
The singleton. The object is also stored in `MusicBookPlayer.instance` and can later be retrieved by `MusicBookPlayer.getInstance()`. 

<a id="MusicBookPayer.addAudioPage"></a>
### `static MusicBookPayer.addAudioPage(props)`
Adds a new audio page to the MusicBookPlayer. If a TOC page exists, the method will update the TOC.

#### Parameters:
<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td><code>props</code></td><td>Object</td><td>Page properties</td></tr>
  <tr><td></td><td></td><td><b><i>Properties</i></b><table>
    <tr><th>Name</th><th>Type</th><th>Attributes</th><th>Description</th></tr>
    <tr><td><code>title</code></td><td>string</td><td> </td><td>Page title<sup>1)</sup></td></tr>
    <tr><td><code>artist</code></td><td>string</td><td>&lt;optional&gt;</td><td>Artist name<sup>2)</sup></td></tr>
    <tr><td><code>audio</code></td><td>string</td><td> </td><td>Audio URL<sup>3)&thinsp;4)</sup></td></tr>
    <tr><td><code>image</code></td><td>string</td><td> </td><td>Image URL<sup>4)</sup></td></tr>
    <tr><td><code>descr</code></td><td>string</td><td>&lt;optional&gt;</td><td>Description text, may contain HTML</td></tr>
    <tr><td><code>part</code></td><td>string</td><td>&lt;optional&gt;</td><td>Part title. If page is a track, the part title<br> can be used as a subtitle.</td></tr>
    <tr><td><code>poffs</code></td><td>float</td><td>&lt;optional&gt;</td><td>The time offset in seconds if the page is<br> part of a track<sup>5)</sup></td></tr>
  </table>
  <b><i>Footnotes</i></b><br>
  <sup>1)</sup> If omitted, the title of the previous page will be copied if a previous page<br> exists. Otherwise, the method will throw an exception.<br>
  <sup>2)</sup> If omitted, the book's artist name will be used.<br>
  <sup>3)</sup> absolute or relative to mediaBaseURI, see method <code>create()</code><br>
  <sup>4)</sup> Mandatory for tracks, omit for parts! Method will throw an exception if the<br> <code>audio</code> property is missing creating a track page. Track audio URLs must be<br> unique throughout the music book!<br>
  <sup>5)</sup> Mandatory for all parts in a sequence of parts except the first one, omit for<br> tracks! Method will throw an exception of the <code>ptoffs</code> property is missing<br> creating the 2nd, 3rd, etc. part of a track.
  </td></tr>
</table>

#### Returns:
The newly created page

<a id="MusicBookPayer.addTocPage"></a>
### `static MusicBookPayer.addTocPage()`

<a id="testedConfigs"></a>
## 4&emsp;Tested Configurations
|                                                                                                       | Browser | Version | OS         | MusicBookPlayer | Particular Issues |
| ----------------------------------------------------------------------------------------------------- | :------ | :------ | :--------- | :-------------: | :---------------- |
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/chrome.svg"  style="width:24px"/> | Chrome  | 93.0    | Android    | r89 (8afa629)   | _none_            |
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/chrome.svg"  style="width:24px"/> | Chrome  | 93.0    | Windows 10 | r89 (8afa629)   | _none_            |
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/edge.svg"    style="width:24px"/> | Edge    | 93.0    | Windows 10 | r89 (8afa629)   | _none_            |
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/firefox.svg" style="width:24px"/> | Firefox | 91.4    | Android    | r89 (8afa629)   | _none_            |
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/firefox.svg" style="width:24px"/> | Firefox | 93.0    | Windows 10 | r89 (8afa629)   | _none_            |
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/safari.svg"  style="width:24px"/> | Safari  | 14.1    | Big Sur    | r89 (8afa629)   | _none_            |
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/safari.svg"  style="width:24px"/> | Safari  | 14.6    | iOS (iPad) | r89 (8afa629)   | init: play button grey |
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/samsung.svg" style="width:24px"/> | Samsung | 9.0     | Android    | r89 (8afa629)   | _none_            |
| <img src="https://matthias-wolff.github.io/MusicBookPlayer/docs/img/uc.svg"      style="width:24px"/> | UC      | 12.10   | Android    | r89 (8afa629)   | no spectrum analyzer |
|                                                                                                       | _all_   | _all_   |iOS (iPhone)| r89 (8afa629)   | big problems...   |

More to be tested. **Help wanted** (see [issue #2](https://github.com/matthias-wolff/MusicBookPlayer/issues/2))!

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

