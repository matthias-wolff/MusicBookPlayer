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
    autoRewind:         false,
    success: function(media,node) 
    {
      mbp.addContentsPage();
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
    // Return existing object                                                   // ------------------------------------
    if (musicBookPlayer!=null)                                                  // MusicBookPlayer singleton exists
      return musicBookPlayer;                                                   //   Return it

    // Early UI initialization                                                  // ------------------------------------
    window.scroll(0,0); // FIXME: Only because of aside tags in body            // Reset window scroll position

    // Create new object                                                        // ------------------------------------
    musicBookPlayer = new MusicBookPlayer();                                    // The MusicBookPlayer singleton
    musicBookPlayer.currentPage = -1;                                           // Current page ID (zero-based)
    musicBookPlayer.contentsPage = -1;                                          // Contents page ID (zero-based)
    musicBookPlayer.pages = [];                                                 // Array of pages
    musicBookPlayer.scrollAniTimer = 0;                                         // Scroll animation timer ID

    // Detect MediaBookPlayer Javascript base URI                               // ------------------------------------
    let scripts = $('script');                                                  // List HTML script tags
    for (var i=0; i<scripts.length; i++)                                        //   Iterate script tags
      if (scripts[i].src.endsWith('musicbookplayer.js'))                        //     MusicBookPlayer's script tags
        musicBookPlayer.scriptBaseURI = scripts[i].baseURI;                     //       Get base URI

    // Normalize mediaBaseURI                                                   // -------------------------------------
    let mbu = new URL(props.mediaBaseURI,musicBookPlayer.scriptBaseURI);        // Make absolute media base URL
    musicBookPlayer.mediaBaseURI = mbu.toString();                              // Set field
    if (!musicBookPlayer.mediaBaseURI.endsWith('/'))                            // Media base URL not ending on a slash
      musicBookPlayer.mediaBaseURI += '/';                                      //   Append a slash
    
    // Create cover page (first page of book)                                   // ------------------------------------
    let sbu = musicBookPlayer.scriptBaseURI;                                    // Shorcut script base URI field name
    musicBookPlayer.addPage({                                                   // Add cover page >>
        title : props.title,                                                    //   Music book title
        artist: props.artist,                                                   //   Music book artist
        audio : MusicBookPlayer.normalizeURL(sbu,'media/coverdummy.mp3'),       //   Cover page dummy audio file
        image : props.image,                                                    //   Cover image
        descr : props.descr                                                     //   Music book description
      });                                                                       // <<
    
    // Return newly created object                                              // ------------------------------------
    return musicBookPlayer;                                                     // Return singleton
  }
  
  /**
   * Initializes the MusicBookPlayer pseudo-singleton. The method is to be 
   * invoked only after the underlying MediaElement has been loaded, i.e., in 
   * callback <code>MediaElement.success</code>.
   */
  initialize()
  {
    // Make contents division element visible
    // HACK: Initially invisible to prevent graphic artifacts on reloading page
    document.querySelector('.content'        ).style.visibility = 'visible';
    document.querySelector('.mbp-cnts button').style.visibility = 'visible';
    document.querySelector('.mbp-next button').style.visibility = 'visible';
    document.querySelector('.mbp-prev button').style.visibility = 'visible';
    
    // Remove loading animation CSS rule
    MusicBookPlayer.getCssRule('div.content-wrapper').style.backgroundImage='';

    // Attach and configure MediaElement player
    musicBookPlayer.mep = document.querySelector('#audio-player');
    musicBookPlayer.mep.setVolume(1);
    
    // Add audio event listeners
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
    
    // Add DOM element event listeners
    document.getElementById('content').addEventListener('scroll',
        musicBookPlayer.handleScrollEvent.debounce(100)
      );
    
    // Reset content scroll position and goto cover page 
    musicBookPlayer.scrollTo(0,true);
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
      
    // Create page HTML
    let img  = ``;
    let cnte = document.getElementById('content');
    cnte.innerHTML += `    <section class="page" id="page-${page.pid}">
      <div class="track-image"><img class="track-image" src="${page.image}"></div>
      <div class="track-comment">${page.descr}</div>
    </section>
`;
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
    // Make TOC header and cover page entry
    let s = `<table class="toc">
  <tr>
    <td class="track-title" colspan="3">
      <h1><a href="javascript:musicBookPlayer.goto(0,false)">Cover</a></h1>
    </td>
  </tr>`
    
    // Make TOC entries of other pages
    for (let i=1; i<this.pages.length; i++)
    {
      // Skip contents pages
      if (i==this.contentsPage)
        continue;

      // Template tag values
      let p1    = this.pages[i].ptoffs!='undefined'                             // Page is first part of several
                  && this.pages[i].audio!=this.pages[i-1].audio                 // ...
                  && i<this.pages.length-1                                      // ...
                  && this.pages[i].audio==this.pages[i+1].audio;                // ...
      let p2    = this.pages[i].ptoffs!='undefined'                             // Page is 2nd, 3rd, etc. part
                  && this.pages[i].audio==this.pages[i-1].audio;                // ...
      let tid   = '' + (this.pages[i].tid<10 ? '0' : '') + this.pages[i].tid;   // Track number
      let link  = `javascript:musicBookPlayer.goto(${this.pages[i].pid},true)`; // Hyperlink to page
      let title = this.pages[i].title + (                                       // Title...
                    !p1 && !p2 && this.pages[i].part                            // ...plus subtitle
                    ? ` <span class="part-title">${this.pages[i].part}</span>`  // ...
                    : ''                                                        // ...
                  );                                                            // ...
      let d =                                                                   // Tag values
      {                                                                         // >>
        tid  : !p2 ? `<a href="${link}">${tid}</a>` : '',                       //   Track number HTML
        tnos : !p2 ? `<a href="${link}">&nbsp;-&nbsp;</a>` : '',                //   Track number separator HTML
        title: !p2 ? `<h1><a href="${link}">${title}</a></h1>` : '',            //   Title HTML
        part : p1 || p2                                                         //   Part HTML
               ? `<h2><a href="${link}">${this.pages[i].part}</a></h2>`         //   ...
               : ''                                                             //   ...
      };                                                                        // <<

      // Make TOC entry HTML
      s += `
  <tr>
    <td class="track-number">${d.tid}</td>
    <td class="track-number-separator">${d.tnos}</td>
    <td class="track-title">${d.title}${d.part}</td>
  </tr>`
    }
    
    // Make TOC footer
    s += `
</table>`;
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
    let ptoffs = this.pages[this.currentPage].ptoffs;
    if (!ptoffs) ptoffs = 0;
    if (this.mep.currentTime>ptoffs+2) // Back to beginning of page's audio
    {
      this.mep.setCurrentTime(ptoffs);
    }
    else if (this.currentPage>0) // Previous page
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
   * Content division element scroll event hander.
   */
  handleScrollEvent()
  {
    let cnte  = document.getElementById('content');                             // Get content division element
    let spos  = cnte.scrollLeft;                                                // Current scroll position
    let spmax = cnte.scrollWidth;                                               // Maximum scroll position
    let pid   = Math.round(spos/spmax*musicBookPlayer.pages.length);            // Page ID for current scroll position
    if (musicBookPlayer.currentPage!=pid)                                       // Scrolled to other than current page
      musicBookPlayer.goto(pid);                                                //   Goto to other page
  }  

  /**
   * Scrolls the contents area to a given page.
   * 
   * @param pid       One-based index of page, 0 for cover page (integer)
   * @param immediate If <code>true</code>, skip scroll animation (boolean,
   *                  default is <code>false</code>)
   */
  scrollTo(pid,immediate=false)
  {
    pid = Math.max(0,Math.min(pid,this.pages.length-1));                        // Rectify page ID
    let cnte = document.getElementById('content');                              // Content division element
    let rule = MusicBookPlayer.getCssRule('div.content');                       // Get content div's CSS rule
    let sbeh = rule.style.scrollBehavior;                                       // Get scrolling behavior
    if (immediate)                                                              // Immediate scrollig requested
      rule.style.scrollBehavior = 'auto';                                       //   Set scroll behavior in CSS rule
    cnte.scrollLeft = pid * cnte.scrollWidth / this.pages.length                // Scroll to page
    if (immediate)                                                              // Immediate scrollig requested
      rule.style.scrollBehavior = sbeh;                                         //   Restore scrl. behavior in CSS rule
  }
  
  /**
   * Detects the page from the current source and time index of the audio player
   * element.
   * 
   * @return The One-based page number, 0 for the cover page, or -1 in case
   *         of errors.
   */
  detectCurrentPage()
  {
    // Find all pages for current audio source
    let cp = this.pages.filter( ({audio}) => 
      audio==this.mep.currentSrc
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
      musicBookPlayer.enableCntsButton(false);
    }
    else
    {
      musicBookPlayer.enablePlayButton(musicBookPlayer.mep.readyState>=3);
      musicBookPlayer.enablePrevButton(cp>0);
      musicBookPlayer.enableNextButton(cp<musicBookPlayer.pages.length-1);
      musicBookPlayer.enableCntsButton(true);
    }
    musicBookPlayer.fixTogglePlayPauseButton(this.mep.paused);
    
    // If page did not change and not forced -> that was it...
    if (musicBookPlayer.currentPage==cp && !force)
      return;

    // Set current page
    musicBookPlayer.currentPage = cp;
    if (cp>=0)
      musicBookPlayer.scrollTo(cp);

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
      return;
    }
    
    // Normal state
    $('#album-title'  )[0].innerHTML=musicBookPlayer.pages[0].title;
    $('#album-artist' )[0].innerHTML=musicBookPlayer.pages[cp].artist;
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
    let img  = state ? 'play.png' : 'play-disabled.png';
    let rule = MusicBookPlayer.getCssRule('.mejs-controls .mejs-play button');
    rule.style.backgroundImage = `url(../img/${img})`;
    /* -- OLD -->     
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
    /* <---- */
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
   * @param New state, <code>true</code> for enabled, <code>false</code> for 
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

  /**
   * Enables or disables the contents button.
   * 
   * @param New state, <code>true</code> for enabled, <code>false</code> for 
   *        disabled.
   */
  enableCntsButton(state)
  {
    var btnCnts = document.querySelector('.mbp-cnts button');
    if (btnCnts)
      if (state)
        btnCnts.style['background-image'] = 'url(img/contents.png)';
      else
        btnCnts.style['background-image'] = 'url(img/contents-disabled.png)';
  }
  
  // -- Static Helpers --

  /**
   * Retrieves a rule from the MediaBookPlayer CSS file.
   * 
   * @param: The selector text
   *         FIXME: Not robust; must match CSS rule definition exactly!
   * @return The rule object or <code>null</code> if the rule was not found
   */
  static getCssRule(selectorText)
  {
    // Find MusicBookPlayer CSS link tag
    let linkTag  = null;
    let linkTags = $('link');
    for (let i=0; i<linkTags.length; i++)
      if (linkTags[i].href.endsWith('/MusicBookPlayer.js/css/styles.css'))
        linkTag = linkTags[i];
    
    // Find and return CSS rule
    let sheet = linkTag.sheet ? linkTag.sheet : linkTag.styleSheet;
    var rules = sheet.cssRules;
    for (var i=0; i<rules.length; i++)
      // 
      if (rules[i].selectorText==selectorText) 
        return rules[i];

    // Das war nüscht...
    return null;
  }
  
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
  }

}

// -- Javascript Utilities --

/**
 * Generic lazy debouncer.
 * 
 * Usage: Invoke myfunction.debounce(wait) for any function. Parameter wait
 *        is the debounce waiting time in milliseconds.
 * 
 * @see J. Albers-Zoller: SelfHTML, JavaScript/Tutorials/Debounce und Throttle.
 *      https://wiki.selfhtml.org/wiki/JavaScript/Tutorials/Debounce_und_Throttle
 * @see J. Ashkenas: Underscore.js.
 *      https://underscorejs.org/
 */
Function.prototype.debounce = function(wait) 
{
  let timeout       = null;
  let debouncedFunc = this;
  return function()
  {
    let context = this;
    function later(args) 
    {
      timeout = null;
      debouncedFunc.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait, arguments);
  };
};

// EOF