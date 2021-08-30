// Music Book Player - Javascripts
// Matthias Wolff

  
// == Document Loaded Callback =================================================

$(function()
{ 
  // Initialize MediaElementPlayer
  var player = new MediaElementPlayer(document.querySelector('#audio-player'), 
  {
    alwaysShowControls: true,
    features:           ['playpause','current','progress','duration'],
    startVolume:        1,
    success: function(media,node) 
    {
      musicBookPlayer.initialize();
    }
  });
});

// == Music Book Player Class ==================================================

/**
 * The MusicBookPlayer pseudo singleton
 */
var musicBookPlayer = null;

/**
 * The MusicBookPlayer class
 */
class MusicBookPlayer
{
  // -- Constructor and One-Time Initialization --
  
  /**
   * Creates the MusicBookPlayer pseudo-singleton. If a MusicBookPlayer object
   * is already existing, the method returns the pseudo-singleton. If no
   * MusicBookPlayer object is already existing, the method creates a new object
   * and writes the MusicBookPlayer HTML page into the current HTMl document.
   * 
   * @param props Object containing the following properties
   *              - mediaBaseURI Base URI of the book's media files (string)
   *              - title        Music book title (string)
   *              - artist       Artist name (string)
   *              - image        Cover image file name relative to 
   *                             <code>mediaBaseURI</code> (string)
   *              - descr        Description text (string, HTML)
   * @return The pseudo-singleton, (object, also stored in global variable 
   *         <code>musicBookPlayer</code>)
   */
  static create(props)
  {
    // Return existing object
    if (musicBookPlayer!=null)
      return musicBookPlayer;

    // Create new object
    musicBookPlayer = new MusicBookPlayer();
    musicBookPlayer.currentPage = -1;
    musicBookPlayer.pages = [];

    // Detect MediaBookPlayer Javascript base URI
    let scripts = $('script');
    for (var i=0; i<scripts.length; i++)
      if (scripts[i].src.endsWith('musicbookplayer.js'))
        musicBookPlayer.scriptBaseURI = scripts[i].baseURI;

    // Normalize mediaBaseURI
    try
    {
      // mediaBaseURI is absolute (i.e., it already includes an origin)
      let mbu = new URL(props.mediaBaseURI);
      musicBookPlayer.mediaBaseURI = mbu.toString();
    }
    catch (e)
    {
      // mediaBaseURI is relative (i.e., it does not include an origin)
      let mbu = new URL(props.mediaBaseURI,musicBookPlayer.scriptBaseURI);
      musicBookPlayer.mediaBaseURI = mbu.toString();
    }
    if (!musicBookPlayer.mediaBaseURI.endsWith('/'))
      musicBookPlayer.mediaBaseURI += '/';
    
    // Create cover page
    musicBookPlayer.addPage({
        title : props.title,
        artist: props.artist,
        image : props.image,
        descr : props.descr
      });

    // TODO: Write HTML page

    // Return newly created object
    return musicBookPlayer;
  }
  
  /**
   * Initializes the MusicBookPlayer pseudo-singleton. The method is to be 
   * invoked only after the underlying MediaElement has been loaded, i.e., in 
   * callback <code>MediaElement.success</code>.
   */
  initialize()
  {    
    // Attach MediaElement player
    musicBookPlayer.mep = document.querySelector('#audio-player');

    // Initialize UI
    musicBookPlayer.enablePlayButton(false);
    musicBookPlayer.enablePrevButton(false);
    musicBookPlayer.enableNextButton(false);

    // Add event listeners
    musicBookPlayer.mep.addEventListener('canplay', function(){
      musicBookPlayer.enablePlayButton(true);
      musicBookPlayer.updateCurrentPage();
    });
    musicBookPlayer.mep.addEventListener('ended', function (){
      musicBookPlayer.enablePlayButton(false);
      musicBookPlayer.next();
    });
    musicBookPlayer.mep.addEventListener('timeupdate', function (){
      musicBookPlayer.updateCurrentPage();
    });
  }

  // -- Book Pages --

  /**
   * Adds a new page to the MusicBookPlayer.
   * 
   * @param props Object containing the following properties
   *              - tid    One-based track number (integer)
   *              - title  Page--i.e., track or part--title (string)
   *              - artist Artist name (string)
   *              - audio  Audio file name* (string, see footnote 1)
   *              - image  Image file name* (string, see footnote 1)
   *              - descr  Description text (string, HTML)
   *              - part   Part title (string, default <code>undefined</code>: 
   *                       page is a whole track rather than a part of a track)
   *              - poffs  The time offset in seconds if the page is part of a 
   *                       track (float, default <code>undefined</code>: page 
   *                       is a whole track)
   *              Footnotes:
   *              (1) relative to <code>mediaBaseURI</code>
   * @return The newly created page
   */
  addPage(props)
  {
    // Create page and add to page list
    let page = new MusicBookPage(this.mediaBaseURI,props);
    this.pages = this.pages.concat(page);
   
    // TODO: Create page HTML

    // Return newly created page
    return page;
  }

  // -- Player Control --
  
  /**
   * Moves to a Music Book page.
   * 
   * @param n One-based index of page (integer, default 0: cover page)
   */
  goto(n=0)
  {
    n = Math.max(0,Math.min(n,this.pages.length-1));
    // TODO: Something with page[n]
    // TODO: this.currentPage = n;
  }

  /**
   * Plays the previous track or part if any.
   */
  prev()
  {
    // TODO: ...
    //window.alert("[TODO: Play previous part/track], "+this.mep);
  }

  /**
   * Plays the next track or part if any.
   */
  next()
  {
    // TODO: ...
    //window.alert("[TODO: Play next part/track]");
  }
  
  // -- UI Helpers --

  /**
   * Detects the page from the current source and time index of the audio player
   * element and updates the GUI and the <code>currentPage</code> property if 
   * the page has changed since the last time the method was invoked.
   * 
   * @param  Force GUI update (default is <code>false</code>)
   * @return The One-based page number, 0 for the cover page, or -1 in case
   *         of errors.
   */
  updateCurrentPage(force=false)
  {
    // this.mep.currentSrc
    // this.mep.currentTime
  }
  
  /**
   * Enables or disables the play button.
   * 
   * @param New state, <code>true</code> for enabled, <code>false</code> for 
   *        disabled.
   */
  enablePlayButton(state)
  {
    try
    {
      var rules = document.styleSheets[0].cssRules;
      for (var i=0; i<rules.length; i++)
        if (rules[i].selectorText=='.mejs-controls .mejs-play button')
        {
          if (state)
            rules[i].style['background-image'] = 'url(../img/play.png)';
          else
            rules[i].style['background-image'] = 'url(../img/play-disabled.png)';
        }
    }
    catch (e)
    {
      // Ignore!
    }
  }

  /**
   * Enables or disables the previous part/track button.
   * 
   * @param New state, <code>true</code> for enabled, <code>false</code> for 
   *        disabled.
   */
  enablePrevButton(state)
  {
    var btnPrev = document.querySelector('.mbp-prev button');
    if (btnPrev)
      if (state)
        btnPrev.style['background-image'] = 'url(img/prev.png)';
      else
        btnPrev.style['background-image'] = 'url(img/prev-disabled.png)';
  }

  /**
   * Enables or disables the next part/track button.
   * 
   * @param TNew state, <code>true</code> for enabled, <code>false</code> for 
   *        disabled.
   */
  enableNextButton(state)
  {
    var btnNext = document.querySelector('.mbp-next button');
    if (btnNext)
      if (state)
        btnNext.style['background-image'] = 'url(img/next.png)';
      else
        btnNext.style['background-image'] = 'url(img/next-disabled.png)';
  }

}

// == Music Book Page Class ====================================================

class MusicBookPage
{

  /**
   * Creates a new MusicBookPage.
   * 
   * @param mediaBaseURI Base URI of media files (audio and image files)
   * @param props Object containing the following properties
   *              - tid    One-based track number (integer)
   *              - title  Page--i.e., track or part--title (string)
   *              - artist Artist name (string)
   *              - audio  Audio file name* (string, see footnote 1)
   *              - image  Image file name* (string, see footnote 1)
   *              - descr  Description text (string, HTML)
   *              - part   Part title (string, default <code>undefined</code>: 
   *                       page is a whole track rather than a part of a track)
   *              - poffs  The time offset in seconds if the page is part of a 
   *                       track (float, default <code>undefined</code>: page 
   *                       is a whole track)
   *              Footnotes:
   *              (1) relative to <code>mediaBaseURI</code>
   */
  constructor(mediaBaseURI,props)
  {
    // Safely initialize
    this.tid    = (typeof props.tid   =='undefined') ? undefined : props.tid;
    this.title  = (typeof props.title =='undefined') ? undefined : props.title;
    this.artist = (typeof props.artist=='undefined') ? undefined : props.artist;
    this.descr  = (typeof props.descr =='undefined') ? undefined : props.descr;
    this.part   = (typeof props.part  =='undefined') ? undefined : props.part;
    this.ptoffs = (typeof props.ptoffs=='undefined') ? undefined : props.ptoffs;

    this.audio = undefined;
    if (typeof props.audio!='undefined')
      this.audio = (new URL(mediaBaseURI+props.audio)).toString();  
    this.image = undefined;
    if (typeof props.image!='undefined')
      this.image = (new URL(mediaBaseURI+props.image)).toString();  
  }

}

// EOF