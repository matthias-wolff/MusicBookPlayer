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
      musicBookPlayer.updateUI();
    });
    musicBookPlayer.mep.addEventListener('ended', function (){
      musicBookPlayer.updateUI();
      musicBookPlayer.next();
    });
    musicBookPlayer.mep.addEventListener('timeupdate', function (){
      musicBookPlayer.updateUI();
    });
    
    // Goto first page
    musicBookPlayer.goto(1);
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
    props.pid = this.pages.length;
    let page = new MusicBookPage(props);
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
    let src = this.pages[n].audio;
    if (src!=this.mep.src)
      this.mep.setSrc(src);
    if (typeof this.pages[n].ptoffs!='undefined')
      this.mep.setCurrentTime(this.pages[n].ptoffs);
    musicBookPlayer.updateUI(true);
  }

  /**
   * Plays the previous track or part if any.
   */
  prev()
  {
    if (this.currentPage>0)
      musicBookPlayer.goto(this.currentPage-1);
  }

  /**
   * Plays the next track or part if any.
   */
  next()
  {
    if (this.currentPage<this.pages.length-1)
      musicBookPlayer.goto(this.currentPage+1);
  }
  
  // -- UI Helpers --

  /**
   * Detects the page from the current source and time index of the audio player
   * element.
   * 
   * @return The One-based page number, 0 for the cover page, or -1 in case
   *         of errors.
   */
  detectCurrentPage()
  {
    // No current audio source -> return default
    if (this.mep.currentSrc.endsWith('/media/dummy.mp3'))
      return this.pages.length>0 ? 0 : -1;
    
    // Find all pages for current audio source
    let cp = this.pages.filter( ({audio}) => 
      audio.indexOf(this.mep.currentSrc)>=0
    );

    // No page for current audio source -> error
    if (cp.length==0)
      return -1;

    // One page for current audio source -> return pages array index
    if (cp.length==1)
      return cp[0].pid;

    // Several parts -> find current part by part time offset
    let ct = this.mep.currentTime;
    for (let i=0; i<cp.length-1; i++)
      if (ct>=cp[i].ptoffs && ct<cp[i+1].ptoffs)
        return cp[i].pid;
    return cp[cp.length-1].pid;
  }

  /**
   * Updates the UI.
   * 
   * @param  Force update (default is <code>false</code>)
   */
  updateUI(force=false)
  {
    let cp = musicBookPlayer.detectCurrentPage();
    if (musicBookPlayer.currentPage==cp && !force)
      return;

    // Set current page
    musicBookPlayer.currentPage = cp;

    // Error state or cover page
    if (cp<1)
    {
      $('#track-number'          )[0].innerHTML='';
      $('#track-number-separator')[0].innerHTML='';
      $('#track-title'           )[0].innerHTML='';
      $('#part-title'            )[0].innerHTML='';
    }
    else if (cp>0)
    {
      let s = ''+musicBookPlayer.pages[cp].tid;
      if (s.length==1) s='0'+s;
      $('#track-number'          )[0].innerHTML=s;
      $('#track-number-separator')[0].innerHTML='-';
      $('#track-title'           )[0].innerHTML=musicBookPlayer.pages[cp].title;
      if (typeof musicBookPlayer.pages[cp].part!='undefined')
        $('#part-title')[0].innerHTML=musicBookPlayer.pages[cp].part;
      else
        $('#part-title')[0].innerHTML='';
    }
    
    // Error state
    if (cp<0)
    {
      musicBookPlayer.enablePlayButton(false);
      musicBookPlayer.enablePrevButton(false);
      musicBookPlayer.enableNextButton(false);
      $('#album-title'   )[0].innerHTML='<span class="error">Error</span>';
      $('#album-artist'  )[0].innerHTML='';
      $('#track-image'   )[0].innerHTML='';
      $('#track-comments')[0].innerHTML='';
      return;
    }
    
    // Normal state
    let img = '<img class="track-image" src="'+musicBookPlayer.pages[cp].image+'">';
    musicBookPlayer.enablePlayButton(musicBookPlayer.mep.readyState>=3);
    musicBookPlayer.enablePrevButton(cp>0);
    musicBookPlayer.enableNextButton(cp<musicBookPlayer.pages.length-1);
    $('#album-title'  )[0].innerHTML=musicBookPlayer.pages[0].title;
    $('#album-artist' )[0].innerHTML=musicBookPlayer.pages[0].artist;
    $('#track-image'  )[0].innerHTML=img;
    $('#track-comment')[0].innerHTML=musicBookPlayer.pages[cp].descr;
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
   * @param props Object containing the following properties
   *              - pid    Page ID (pages array index)
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
    this.pid    = (typeof props.pid   =='undefined') ? undefined : props.pid;
    this.tid    = (typeof props.tid   =='undefined') ? undefined : props.tid;
    this.title  = (typeof props.title =='undefined') ? undefined : props.title;
    this.artist = (typeof props.artist=='undefined') ? undefined : props.artist;
    this.descr  = (typeof props.descr =='undefined') ? undefined : props.descr;
    this.part   = (typeof props.part  =='undefined') ? undefined : props.part;
    this.ptoffs = (typeof props.ptoffs=='undefined') ? undefined : props.ptoffs;

    this.audio = undefined;
    if (typeof props.audio!='undefined')
      this.audio = (new URL(musicBookPlayer.mediaBaseURI+props.audio)).toString();
    else
      this.audio = (new URL(musicBookPlayer.scriptBaseURI+'media/dummy.mp3')).toString();
    this.image = undefined;
    if (typeof props.image!='undefined')
      this.image = (new URL(musicBookPlayer.mediaBaseURI+props.image)).toString();  
  }

}

// EOF