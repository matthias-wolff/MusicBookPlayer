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
   * @param  mediaBaseURI Base URI of the book's media files (string)
   * @param  title        Music book title (string)
   * @param  artist       Artist name (string)
   * @param  image        Cover image file name relative to 
   *                      <code>mediaBaseURI</code> (string)
   * @param  descr        Description text (string, HTML)
   * @return The pseudo-singleton, (object, also stored in global variable 
   *         <code>musicBookPlayer</code>)
   */
  static create(mediaBaseURI,title,artist,image,descr)
  {
    // Return existing object
    if (musicBookPlayer!=null)
      return musicBookPlayer;

    // Create new object
    musicBookPlayer = new MusicBookPlayer();
    musicBookPlayer.mediaBaseURI = mediaBaseURI;
    musicBookPlayer.currentPage = 0;
    musicBookPlayer.pages = [];
    
    // Create cover page
    musicBookPlayer.addPage(title,artist,undefined,image,descr);

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
    // Detect MediaBookPlayer Javascript base URI
    var scripts = $('script');
    for (var i=0; i<scripts.length; i++)
      if (scripts[i].src.endsWith('musicbookplayer.js'))
        musicBookPlayer.scriptBaseURI = scripts[i].baseURI;

    // Attach MediaElement player
    musicBookPlayer.mep = document.querySelector('#audio-player');

    // Initialize UI
    musicBookPlayer.enablePlayButton(false);
    musicBookPlayer.enablePrevButton(false);
    musicBookPlayer.enableNextButton(false);

    // Add event listeners
    musicBookPlayer.mep.addEventListener('canplay', function(){
      musicBookPlayer.enablePlayButton(true);
    });
    musicBookPlayer.mep.addEventListener('ended', function (){
      musicBookPlayer.enablePlayButton(false);
      musicBookPlayer.next();
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
    this.pages = this.pages.concat(new MusicBookPage(props));
   
    // TODO: Create page HTML

    // Return newly created page
    return this.pages[this.pages.length-1];
  }

  // -- Player Control --
  
  /**
   * Moves to a Music Book page.
   * 
   * @param n One-based index of page (integer, default 0: cover page)
   */
  goto(n=0)
  {
    n = math.max(0,math.min(n,this.pages.length-1));
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
  constructor(props)
  {
    // Safely initialize
    this.tid    = (typeof props.tid   =='undefined') ? undefined : props.tid;
    this.title  = (typeof props.title =='undefined') ? undefined : props.title;
    this.artist = (typeof props.artist=='undefined') ? undefined : props.artist;
    this.audio  = (typeof props.audio =='undefined') ? undefined : props.audio;
    this.image  = (typeof props.image =='undefined') ? undefined : props.image;
    this.descr  = (typeof props.descr =='undefined') ? undefined : props.descr;
    this.part   = (typeof props.part  =='undefined') ? undefined : props.part;
    this.ptoffs = (typeof props.ptoffs=='undefined') ? undefined : props.ptoffs;
  }

}

// EOF