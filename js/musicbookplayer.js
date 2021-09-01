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
    musicBookPlayer.contentsPage = -1;
    musicBookPlayer.pages = [];

    // Detect MediaBookPlayer Javascript base URI
    let scripts = $('script');
    for (var i=0; i<scripts.length; i++)
      if (scripts[i].src.endsWith('musicbookplayer.js'))
        musicBookPlayer.scriptBaseURI = scripts[i].baseURI;

    // Normalize mediaBaseURI
    let mbu = new URL(props.mediaBaseURI,musicBookPlayer.scriptBaseURI);
    musicBookPlayer.mediaBaseURI = mbu.toString();
    if (!musicBookPlayer.mediaBaseURI.endsWith('/'))
      musicBookPlayer.mediaBaseURI += '/';
    
    // Create cover page (first page of book)
    musicBookPlayer.addPage({
        title : props.title,
        artist: props.artist,
        audio : MusicBookPlayer.normalizeURL(musicBookPlayer.scriptBaseURI,'media/coverdummy.mp3'),
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
    musicBookPlayer.mep.addEventListener('play', function(){
      musicBookPlayer.updateUI();
    });
    musicBookPlayer.mep.addEventListener('playing', function(){
      musicBookPlayer.updateUI();
    });
    musicBookPlayer.mep.addEventListener('canplay', function(){
      musicBookPlayer.updateUI();
    });
    musicBookPlayer.mep.addEventListener('pause', function(){
      musicBookPlayer.updateUI();
    });
    musicBookPlayer.mep.addEventListener('ended', function (){
      musicBookPlayer.updateUI();
      if (musicBookPlayer.currentPage < musicBookPlayer.pages.length-1)
        musicBookPlayer.next(true);
    });
    musicBookPlayer.mep.addEventListener('progress', function(){
      musicBookPlayer.updateUI();
    });
    musicBookPlayer.mep.addEventListener('timeupdate', function (){
      musicBookPlayer.updateUI();
    });
    
    // Goto cover page
    musicBookPlayer.goto(0);
  }

  // -- Book Pages --

  /**
   * Adds a new page to the MusicBookPlayer.
   * 
   * @param props Object containing the following properties
   *              - tid    One-based track number (integer)
   *              - title  Page--i.e., track or part--title (string)
   *              - artist Artist name (string)
   *              - audio  Audio file name (string) 1),2)
   *              - image  Image file name (string) 2)
   *              - descr  Description text (string, HTML)
   *              - part   Part title (string, default <code>undefined</code>: 
   *                       page is a whole track rather than a part of a track)
   *              - poffs  The time offset in seconds if the page is part of a 
   *                       track (float, default <code>undefined</code>: page 
   *                       is a whole track)
   *              Footnotes:
   *              1) mandatory, URL must be unique!
   *              2) absolute or relative to <code>mediaBaseURI</code>
   * @return The newly created page
   */
  addPage(props)
  {
    // Create page music book page from properties object
    let page = props;
    page.pid = this.pages.length;
    if (typeof page.title =='undefined') page.title ='';
    if (typeof page.artist=='undefined') page.artist='';
    page.audio = MusicBookPlayer.normalizeURL(this.mediaBaseURI,page.audio);
    if (typeof page.image!='undefined')
      page.image = MusicBookPlayer.normalizeURL(this.mediaBaseURI,props.image);
    else
      page.image = '';
    if (typeof page.descr=='undefined') page.descr='';
    if (typeof page.part!='undefined' && typeof page.ptoffs=='undefined')
      page.ptoffs = 0;
      
    // TODO: Create page HTML
    
    // Add new page to list of pages
    this.pages = this.pages.concat(page);
    return page;
  }

  /**
   * Adds an contents page displaying a hyperlinked list of pages. If a contents
   * page is already existing, the method does nothing.
   * 
   * @return The newly created or existing contents page
   */
  addContentsPage()
  {
    if (this.contentsPage<0)
    {
      musicBookPlayer.addPage({
        title : 'Contents',
        artist: this.pages[0].artist,
        audio : MusicBookPlayer.normalizeURL(
                    musicBookPlayer.scriptBaseURI,
                   'media/contentsdummy.mp3'
                  ),
        descr : musicBookPlayer.makeContents()
      }); 
      this.contentsPage = this.pages.length-1;
    }
    return this.pages[this.contentsPage];
  }

  // -- DHTML --
  
  /**
   * Creates HTML code of the table of contents page.
   */
  makeContents()
  {
    // Create TOC entry of cover page
    let s = '<h1 class="track-title"><a href="javascript:musicBookPlayer.goto(0,false)">Cover</a></h1>\n';
    
    // Create TOC entries of other pages
    for (let i=1; i<this.pages.length; i++)
    {
      // Skip contents pages
      if (i==this.contentsPage)
        continue;

      // Initialize
      let l = 'javascript:musicBookPlayer.goto('+this.pages[i].pid+',true)';
      let t = ''+this.pages[i].tid;
      if (t.length<2)
        t = '0'+t;
      let p = this.pages[i].ptoffs!='undefined' 
              && this.pages[i].audio==this.pages[i-1].audio; // 2nd, 3rd, etc. part
      let v = p ? 'style="visibility:hidden; height:0;"' : '';
      
      // Create TOC entry HTML
      s += '<div class="track-title-container" style="padding-top: 0.25rem;">\n';
      s += '  <div class="track-number" '+v+'><a href="'+l+'">'+t+'</a></div>\n';
      s += '  <div class="track-number-separator" '+v+'>-</div>\n';
      s += '  <div>\n';
      if (!p)
      {
        s += '    <h1 class="track-title"><a href="'+l+'">'+this.pages[i].title;
        if (this.pages[i].part)
          s+= ' <span class="part-title">'+this.pages[i].part+'</span>';
        s += '</a></h1>\n';
      }
      else if (this.pages[i].part)
        s += '    <h2 class="part-title"><a href="'+l+'">'+this.pages[i].part+'</a></h2>\n';
      s += '  </div>\n';
      s += '</div>\n';
    }
    return s;
  }
  
  // -- Player Control --
  
  /**
   * Moves to the specified page.
   * 
   * @param pid One-based index of page, 0 for cover page (integer)
   * @param play If <code>true</code>, play page's audio file, if 
   *        <code>false</code>, stop playing, if <code>undefined</code>, retain
   *        playing state. 
   */
  goto(pid,play)
  {
    pid = Math.max(0,Math.min(pid,this.pages.length-1));
    if (typeof play=='undefined')
      play = !this.mep.paused;
    let src = this.pages[pid].audio;
    if (src!=this.mep.src)
      this.mep.setSrc(src);
    if (typeof this.pages[pid].ptoffs!='undefined')
      this.mep.setCurrentTime(this.pages[pid].ptoffs);
    else
      this.mep.setCurrentTime(0);
    if (play)
    {
      this.mep.play();
      musicBookPlayer.fixTogglePlayPauseButton(false);
    }
    else
    {
      this.mep.pause();
      musicBookPlayer.fixTogglePlayPauseButton(true);
    }
    musicBookPlayer.updateUI();
  }

  /**
   * Moves to the contents page. If no contents page exists, move to cover page.
   */
  gotoContents()
  {
    if (this.contentsPage>=0)
      musicBookPlayer.goto(this.contentsPage);
    else
      musicBookPlayer.goto(0);
  }
  
  /**
   * Moves to the previous page if any.
   * 
   * @param play If <code>true</code>, play page's audio file, if 
   *        <code>false</code>, stop playing, if <code>undefined</code>, retain
   *        playing state. 
   */
  prev(play)
  {
    if (typeof play=='undefined')
      play = !this.mep.paused;
    if (this.mep.currentTime>2)
      this.mep.setCurrentTime(0);
    else if (this.currentPage>0)
      musicBookPlayer.goto(this.currentPage-1,this.currentPage>1 && play);
  }

  /**
   * Moves to the next page if any.
   * 
   * @param play If <code>true</code>, play page's audio file, if 
   *        <code>false</code>, stop playing, if <code>undefined</code>, retain
   *        playing state. 
   */
  next(play)
  {
    if (typeof play=='undefined')
      play = !this.mep.paused;
    if (this.currentPage<this.pages.length-1)
      musicBookPlayer.goto(this.currentPage+1,play);
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
    
    // Update button states
    if (cp<0)
    {
      musicBookPlayer.enablePlayButton(false);
      musicBookPlayer.enablePrevButton(false);
      musicBookPlayer.enableNextButton(false);
    }
    else
    {
      musicBookPlayer.enablePlayButton(musicBookPlayer.mep.readyState>=3);
      musicBookPlayer.enablePrevButton(cp>0);
      musicBookPlayer.enableNextButton(cp<musicBookPlayer.pages.length-1);
    }
    musicBookPlayer.fixTogglePlayPauseButton(this.mep.paused);
    
    // If page did not change and not forced -> that was it...
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
      let s = '';
      if (typeof musicBookPlayer.pages[cp].tid!='undefined')
      {
        s += musicBookPlayer.pages[cp].tid;
        if (s.length==1) s='0'+s;
      }
      if (s)
      {
        $('#track-number'          )[0].innerHTML=s;
        $('#track-number-separator')[0].innerHTML='-';
        $('#track-title'           )[0].innerHTML=musicBookPlayer.pages[cp].title;
      }
      else
      {
        $('#track-number'          )[0].innerHTML=musicBookPlayer.pages[cp].title;
        $('#track-number-separator')[0].innerHTML='';
        $('#track-title'           )[0].innerHTML='';
      }
      if (typeof musicBookPlayer.pages[cp].part!='undefined')
        $('#part-title')[0].innerHTML=musicBookPlayer.pages[cp].part;
      else
        $('#part-title')[0].innerHTML='';
    }
    
    // Error state
    if (cp<0)
    {
      $('#album-title'   )[0].innerHTML='<span class="error">Error</span>';
      $('#album-artist'  )[0].innerHTML='';
      $('#track-image'   )[0].innerHTML='';
      $('#track-comments')[0].innerHTML='';
      return;
    }
    
    // Normal state
    let img = '<img class="track-image" src="'+musicBookPlayer.pages[cp].image+'">';
    if (!musicBookPlayer.pages[cp].image) img='';
    $('#album-title'  )[0].innerHTML=musicBookPlayer.pages[0].title;
    $('#album-artist' )[0].innerHTML=musicBookPlayer.pages[cp].artist;
    $('#track-image'  )[0].innerHTML=img;
    $('#track-comment')[0].innerHTML=musicBookPlayer.pages[cp].descr;
  }

  /**
   * HACK: Fix toggling of MediaElement's play/pause button.
   * 
   * @param: play If <code>true</code>, show "play" icon, otherwise show "pause"
   *         icon.
   */
  fixTogglePlayPauseButton(play)
  {
    let btndiv = document.querySelector('.mejs-controls .mejs-playpause-button');
    if (!btndiv)
      return;
    try
    {
      let cls = btndiv.className.split(' ');
      for (let i=0; i<cls.length; i++)
        if (cls[i]=='mejs-play' || cls[i]=='mejs-pause')
          cls[i] = 'mejs-'+(play ? 'play' : 'pause');
      cls = cls.join(' ');
      if (btndiv.className!=cls)
        btndiv.className = cls;
    }
    catch (e)
    {
      console.log(e);
    }
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

  // -- Other Helpers --
  
  /**
   * Normalizes a resource's URL.
   * 
   * @param baseURL  Base URL
   * @param resource Absolute or relative resource path
   * @return <code>resource</code> if the committed value is a full URL, or the
   *         concatenation of <code>baseURL</code> and <code>resource</code>
   *         if the committed value of <code>resource</code> was relative
   */
  static normalizeURL(baseURL,resource)
  {
    let url = new URL(resource,baseURL);
    return url.toString();
//    let url = null;
//    try
//    {
//      // resource is absolute (i.e., it includes an origin)
//      url = new URL(resource);
//    }
//    catch (e)
//    {
//      // resource is relative (i.e., it does not include an origin)
//      url = new URL(baseURL,resource);
//    }
//    return url.toString();
  }
  
}

// EOF