/**
 * @file Music Book Player - Javascripts
 * @author Matthias Wolff
 */

// == Document Loaded Callback =================================================

$(function()
{ 
  // Initialize MediaElementPlayer
  new MediaElementPlayer(document.querySelector('#audio-player'), 
  {
    alwaysShowControls: true,
    features:           ['playpause','current','progress','duration'],
    startVolume:        1,
    autoRewind:         false,
    success: function(media,node) 
    {
      MusicBookPlayer.initialize();
    }
  });
});

// == Music Book Player Class ==================================================

/**
 * The music book player HTML page body.
 */
const musicBookPlayer_html = `
<!-- Begin of <MusicBookPlayerURL>/html/bodytemplate.html -->

<!-- Music Book Player -->
<header>
  <div class="audio-player">
    <div class="audio-player-header">
      <div class="album-info">
        <h1 id="album-title">Music Book Player</h1>
         <h2 id="album-artist">by Matthias Wolff</h2>
      </div>
      <div id="spectrum-analyzer" class="spectrum-analyzer"></div>
    </div>
    <audio id="audio-player" 
      style="width:100%; height:40%;" controls="controls" 
      src="https://matthias-wolff.github.io/MusicBookPlayer.js/media/coverdummy.mp3">
    </audio>
  </div>
  <div class="track-controls">
    <div class="track-info">
      <div class="track-title-container">
        <div class="track-number" id="track-number"></div>
         <div class="track-number-separator" id="track-number-separator"></div>
         <div class="track-title">
           <h1 id="track-title">Loading...</h1>
           <h2 id="part-title"></h2>
        </div>
      </div>
    </div>
    <div class="mejs-button mbp-prev" onclick="musicBookPlayer.prev();">
      <button type="button" aria-controls="mep_0" 
        title="Previous Track/Part" aria-label="Previous Part/Track"
      ></button>
    </div>
    <div class="mejs-button mbp-next" onclick="musicBookPlayer.next();">
      <button type="button" aria-controls="mep_0" 
        title="Next Track/Part" aria-label="Next Part/Track"
      ></button>
    </div>
    <div class="mejs-button mbp-cnts" onclick="musicBookPlayer.gotoToc();">
      <button type="button" aria-controls="mep_0" 
        title="Contents/Cover Page" aria-label="Contents/Cover Page"
      ></button>
    </div>
  </div>
</header>

<!-- Music Book Content -->
<main style="background-image:url(§{scriptBaseURI}img/loading.svg);">
  <div class="content" id="content"></div>
  <div class="credits" id="credits">
    <aside class="with-close-button">
      <button class="close"onclick="musicBookPlayer.showCredits(false);" title="Close" aria-label="Close"></button>
      <h1>Music Book Player</h1>
      <p>
        by <a target="_blank" href="https://www.b-tu.de/en/fg-kommunikationstechnik/team/staff/prof-dr-ing-habil-matthias-wolff">Matthias Wolff</a>,
        hosted on <a target="_blank" href="https://github.com/matthias-wolff/MusicBookPlayer.js">GitHub</a>
      </p>
      <h1 style="margin-top: 0.35rem;">Based upon</h1>
      <ul>
        <li><a target="_blank" href="https://jquery.com/">jQuery</a></li>
        <li>
          <a target="_blank" href="https://github.com/mediaelement/mediaelement">MediaElement.js</a>
          <ul>
            <li><a target="_blank" href="https://github.com/mediaelement/mediaelement/tree/master/docs">Documentation</a>. (retrieved Aug. 27, 2021)</li>
            <li>designmodo: <a target="_blank" href="https://designmodo.com/audio-player/"> How to Create an Audio Player in jQuery, HTML5 &amp; CSS3</a>. (retrieved Aug. 27, 2021)</li>
            <li>design shack: <a target="_blank" href="https://designshack.net/articles/css/custom-html5-audio-element-ui/">Creating a Custom HTML5 Audio Element UI</a>. (retrieved Aug. 27, 2021)</li>
          </ul>
        </li>
        <li><a target="_blank" href="https://audiomotion.dev/#/">Spectrum Analyzer</a> by audioMotion</li>
        <li>
          Lazy debouncer
          <ul>
            <li>J. Albers-Zoller: <a target="_blank" href="https://wiki.selfhtml.org/wiki/JavaScript/Tutorials/Debounce_und_Throttle">SelfHTML, JavaScript/Tutorials/Debounce und Throttle</a>. (retrieved Sept. 8, 2021)</li>
            <li>J. Ashkenas: <a target="_blank" href="https://underscorejs.org/">Underscore.js</a>. (retrieved Sept. 8, 2021)</li>
          </ul>
        </li>
        <li><a target="_blank" href="https://loading.io">Loading animation</a> by PlotDB Ltd.</li>
      </ul>
    </aside>
  </div>
</main>

<!-- Scripts -->
<!-- §{MUSICBOOK_DEF} -->
<!-- End of <MusicBookPlayerURL>/html/bodytemplate.html -->
`;

/**
 * The MusicBookPlayer pseudo singleton
 */
var musicBookPlayer = null;

/**
 * The MusicBookPlayer class
 */
class MusicBookPlayer
{  
  // -- Public API --
  
  /**
   * Creates the MusicBookPlayer pseudo-singleton. If the object is already
   * existing, the method just returns it. If the singleton is not yet existing,
   * the method creates it and writes the MusicBookPlayer HTML page into the 
   * current document.
   * 
   * @param {Object} props - Music book properties
   * @param {string} [props.mediaBaseURI=undefined] - Absolute base URI of the 
   *        book's media files, i.e., audio and image files. If omitted, the 
   *        HTML document base URI will be used, which means that the media 
   *        files are located in the same folder as <code>index.html</code>.
   * @param {string} props.title - Music book title
   * @param {string} props.artist - Artist name
   * @param {string} props.image - Cover image file name relative to 
   *        <code>mediaBaseURI</code>
   * @param {string} [props.descr=undefined] - Description text, may contain 
   *        HTML
   * @return The pseudo-singleton object. The object is also stored in a global 
   *         variable named <code>musicBookPlayer</code>.
   */
  static create(props)
  {
    // Return existing object                                                   // ------------------------------------
    if (musicBookPlayer!=null)                                                  // MusicBookPlayer singleton exists
      return musicBookPlayer;                                                   //   Return it

    // Create new object                                                        // ------------------------------------
    musicBookPlayer = new MusicBookPlayer();                                    // The MusicBookPlayer singleton
    musicBookPlayer.title       = props.title;                                  // Music book title
    musicBookPlayer.artist      = props.artist;                                 // Music book artist
    musicBookPlayer.currentPage = -1;                                           // Current page ID (zero-based)
    musicBookPlayer.tocPage     = -1;                                           // TOC page ID (zero-based)
    musicBookPlayer.pages       = [];                                           // Array of pages

    // Detect MediaBookPlayer Javascript base URI                               // ------------------------------------
    let scripts = $('script');                                                  // List HTML script tags
    for (var i=0; i<scripts.length; i++)                                        //   Iterate script tags
      if (scripts[i].src.endsWith('js/musicbookplayer.js'))                     //     MusicBookPlayer's script tags
      {                                                                         //     >>
        let uri = scripts[i].src.replace('js/musicbookplayer.js','')            //       Get source and remove file
        musicBookPlayer.scriptBaseURI = uri;                                    //       Set field
        break;                                                                  //       Stop iterating
      }                                                                         //     <<

    // Normalize mediaBaseURI                                                   // -------------------------------------
    let mbu = document.baseURI;                                                 // Default: document base URI
    if (props.mediaBaseURI)                                                     // Media base URI specified
      mbu = props.mediaBaseURI;                                                 //   Use specification
    musicBookPlayer.mediaBaseURI = MusicBookPlayer.getFolderURL(mbu);           // Trim tailing HTML file name if any

    // Early UI initialization                                                  // ------------------------------------
    musicBookPlayer.editHtmlHead(props.title,props.artist);                     // Set document title
    musicBookPlayer.editHtmlBody();                                             // Load and apply body template
    window.scroll(0,0);                                                         // Reset window scroll position
    
    // Create cover page (first page of book)                                   // ------------------------------------
    let sbu = musicBookPlayer.scriptBaseURI;                                    // Shortcut script base URI field name
    MusicBookPlayer.addAudioPage({                                                   // Add cover page >>
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
   * Adds a new audio page to the MusicBookPlayer.
   * 
   * @param {Object} props - Page properties
   * @param {integer} props.tid - One-based track number.
   * @param {string} props.title - Page title
   * @param {string} [props.artist=undefined] -  Artist name. If omitted, the
   *        book's artist name will be used.
   * @param {string} props.audio - Audio file name <sup>1) 2)</sup>
   * @param {string} props.image - Image file name <sup>2)</sup>
   * @param {string} [props.descr=undefined] - Description text, may contain 
   *        HTML
   * @param {string} [props.part=undefined] - Part title. If omitted, the 
   *        page is a whole track rather than a part of a track.
   * @param {float} [props.poffs=undefined] - The time offset in seconds if the 
   *        page is part of a track
   * @see Footnotes:<br>
   *      <sup>1)</sup> Mandatory for tracks. Omit for parts! Track URL must be 
   *      unique!<br>
   *      <sup>2)</sup> absolute or relative to <code>mediaBaseURI</code>
   * @return The newly created page
   */
  static addAudioPage(props)
  {
    // Get singleton instance
    let mbp = musicBookPlayer;

    // Create page music book page from properties object
    let page = props;
    page.pid = musicBookPlayer.pages.length;
    if (typeof page.title =='undefined') page.title ='';
    if (typeof page.artist=='undefined') page.artist=mbp.artist;
    page.audio = MusicBookPlayer.normalizeURL(mbp.mediaBaseURI,page.audio);
    if (typeof page.image!='undefined')
      page.image = MusicBookPlayer.normalizeURL(mbp.mediaBaseURI,props.image);
    else
      page.image = '';
    if (typeof page.descr=='undefined') page.descr='';
    if (typeof page.part!='undefined' && typeof page.ptoffs=='undefined')
      page.ptoffs = 0;
      
    // Create page HTML
    let cnte = document.getElementById('content');
    let img  = '';
    if (page.image)
      img = '\n'+`      <div class="track-image"><img class="track-image" src="${page.image}"></div>`;
    let h = 
    cnte.innerHTML += `    <section class="page" id="page-${page.pid}">${img}
      <div class="track-comment">${page.descr}</div>
    </section>
`;

    // Add new page to list of pages
    mbp.pages = mbp.pages.concat(page);
    return page;
  }

  // -- Constructor and One-Time Initialization --
  
  /**
   * Initializes the MusicBookPlayer pseudo-singleton. The method is to be 
   * invoked only after the underlying MediaElement has been loaded, i.e., in 
   * callback <code>MediaElement.success</code>.
   */
  static initialize()
  {
    // Pre-checks
    if (musicBookPlayer.tocPage>=0)
      return;
    
    // Add table of contents
    MusicBookPlayer.addContentsPage();

    // Make contents division element visible
    // HACK: Initially invisible to prevent graphic artifacts on reloading page
    document.querySelector('.content'        ).style.visibility = 'visible';
    document.querySelector('.mbp-cnts button').style.visibility = 'visible';
    document.querySelector('.mbp-next button').style.visibility = 'visible';
    document.querySelector('.mbp-prev button').style.visibility = 'visible';
    
    // Remove loading animation CSS rule
    document.getElementsByTagName('main')[0].style['background-image']='';

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

  /**
   * Adds an contents page displaying a hyperlinked list of pages. If a contents
   * page is already existing, the method does nothing.
   * 
   * @return The newly created or existing contents page
   */
  static addContentsPage()
  {
    if (musicBookPlayer.tocPage>=0)                                             // TOC page already exists
    {                                                                           // >>
      let tocPage = musicBookPlayer.pages[musicBookPlayer.tocPage];             //   Get existing TOC page
      tocPage.descr = musicBookPlayer.makeToc();                                //   Rewrite TOC
      document.querySelector(`#page-${tocPage.pid} .track-comment`).innerHTML   //   Update HTML 
        = tocPage.descr;                                                        //   ...
      return tocPage;                                                           //   Return existing TOC page
    }                                                                           // <<

    let tocPage = MusicBookPlayer.addAudioPage({                                     // Add new TOC page >>
      title: 'Contents',                                                        //   Title
      audio: MusicBookPlayer.normalizeURL(                                      //   Dummy audio file
                  musicBookPlayer.scriptBaseURI,                                //   ...
                 'media/contentsdummy.mp3'                                      //   ...
                ),                                                              //   ...
      descr: musicBookPlayer.makeToc(),                                         //   Description: Write TOC
    });                                                                         // <<
    musicBookPlayer.tocPage = tocPage.pid;                                      // Set TOC page ID field
    return tocPage;                                                             // Return newly created TOC page
  }

  // -- DHTML --

  /**
   * Creates the title tag inner text.
   * 
   * @param title  Music book title
   * @param artist Artist name
   */
  editHtmlHead(title,artist)
  {
    title  = title  ? title.toString().toUpperCase() : '[UNKNOWN TITLE]';       // Music book title
    artist = artist ? artist.toString() : "Unknown Artist";                     // Artist name
    let headElem = document.querySelector('head');                              // DOM element of <head> tag
    let elem     = document.querySelector(`head title`);                        // DOM element of <title> tag
    if (!elem)                                                                  // No title tag present
    {                                                                           // >>
      elem = document.createElement('title');                                   //   Create title tag
      elem.innerText = `:: ${title} :: ${artist}`;                              //   Set title text
      headElem.appendChild(elem);                                               //   Append title tag to head tag
    }                                                                           // <<
  }

  /**
   * Loads the HTML body template and writes it to the current document.
   */
  editHtmlBody()
  {
    let elem  = document.querySelector('body');
    let html  = musicBookPlayer_html;
    html = html.replace('§{scriptBaseURI}',this.scriptBaseURI)
    let parts = html.split('<!-- §{MUSICBOOK_DEF} -->');
    elem.innerHTML = parts[0]+elem.innerHTML+parts[1];
  }
  
  /**
   * Creates HTML code of the table of contents page.
   */
  makeToc()
  {
    // Make TOC header and cover page entry
    let s = `<table class="toc">
  <tr>
    <td class="track-title" colspan="3">
      <h1><a href="javascript:musicBookPlayer.tocGoto(0,false);">Cover</a></h1>
    </td>
  </tr>`
    
    // Make TOC entries of other pages
    for (let i=1; i<this.pages.length; i++)
    {
      // Skip contents pages
      if (i==this.tocPage)
        continue;

      // Template tag values
      let p1  = this.pages[i].ptoffs!='undefined'                               // Page is first part of several
                && this.pages[i].audio!=this.pages[i-1].audio                   // ...
                && i<this.pages.length-1                                        // ...
                && this.pages[i].audio==this.pages[i+1].audio;                  // ...
      let p2  = this.pages[i].ptoffs!='undefined'                               // Page is 2nd, 3rd, etc. part
                && this.pages[i].audio==this.pages[i-1].audio;                  // ...
      let tid = '' + (this.pages[i].tid<10 ? '0' : '') + this.pages[i].tid;     // Track number
      let lnk = `javascript:musicBookPlayer.tocGoto(${this.pages[i].pid},true);`// Hyperlink to page
      let tit = this.pages[i].title + (                                         // Title...
                    !p1 && !p2 && this.pages[i].part                            // ...plus subtitle
                    ? ` <span class="part-title">${this.pages[i].part}</span>`  // ...
                    : ''                                                        // ...
                  );                                                            // ...
      let d =                                                                   // Tag values
      {                                                                         // >>
        tid  : !p2 ? `<a href="${lnk}">${tid}</a>` : '',                        //   Track number HTML
        tnos : !p2 ? `<a href="${lnk}">&nbsp;-&nbsp;</a>` : '',                 //   Track number separator HTML
        title: !p2 ? `<h1><a href="${lnk}">${tit}</a></h1>` : '',               //   Title HTML
        part : p1 || p2                                                         //   Part HTML
               ? `<h2><a href="${lnk}">${this.pages[i].part}</a></h2>`          //   ...
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
  <tr>
    <td class="track-title" colspan="3">
      <h1><a href="javascript:musicBookPlayer.showCredits();">Credits</a></h1>
    </td>
  </tr>
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
   * Scrolls to the TOC page (and keeps the current page active).
   */
  gotoToc()
  {
    musicBookPlayer.scrollTo(this.tocPage);
  }
  
  /**
   * Moves from the TOC page to another page. If parameter <code>pid</code>
   * refers to the current page, just scroll back and do not rewind audio.
   * 
   * @param pid One-based index of page, 0 for cover page (integer)
   * @param play If <code>true</code>, play page's audio file, if 
   *        <code>false</code>, stop playing, if <code>undefined</code>, retain
   *        playing state. 
   */
  tocGoto(pid,play)
  {
    if (musicBookPlayer.currentPage==musicBookPlayer.tocPage)                   // Currently on TOC page
      musicBookPlayer.goto(pid,play);                                           //    Normal goto
    if (musicBookPlayer.currentPage!=pid)                                       // Move to other than current page
      musicBookPlayer.goto(pid,play);                                           //    Normal goto
    musicBookPlayer.scrollTo(pid);                                              // Scroll to current page
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
    {
      if (this.currentPage==this.tocPage) // HACK: Explicitly scroll to predecessor of contents
        musicBookPlayer.scrollTo(this.currentPage-1);
      musicBookPlayer.goto(this.currentPage-1,this.currentPage>1 && play);
    }
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
   * Retrieves the page ID for the current scroll position of the content 
   * division element.
   */
  pageIdFromScrollPos()
  {
    let cnte  = document.getElementById('content');                             // Get content division element
    let spos  = cnte.scrollLeft;                                                // Current scroll position
    let spmax = cnte.scrollWidth;                                               // Maximum scroll position
    return Math.round(spos/spmax*musicBookPlayer.pages.length);                 // Page ID for current scroll position    
  }
  
  /**
   * Content division element scroll event hander.
   */
  handleScrollEvent()
  {
    let pid = musicBookPlayer.pageIdFromScrollPos();                            // Page ID for current scroll position
    if (pid==musicBookPlayer.currentPage)                                       // Scrolled to current page
      return;                                                                   //   Do nothing
    if (pid==musicBookPlayer.tocPage)                                      // Scrolled to contents page
      return;                                                                   //   Do nothing
    musicBookPlayer.goto(pid);                                                  // Change page
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
    if (immediate)                                                              // Immediate scrolling requested
      cnte.style.scrollBehavior = 'auto';                                       //   Set immediate scroll behavior
    cnte.scrollLeft = pid * cnte.scrollWidth / this.pages.length                // Scroll to page
    if (immediate)                                                              // Immediate scrolling requested
      cnte.style.scrollBehavior = '';                                           //   Restore scrl. behavior to CSS rule
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

    // Scroll to current page unless contents page is displayed while different
    // page is active
    let stayOnToc = musicBookPlayer.pageIdFromScrollPos()==this.tocPage;
    if (cp>=0 && (!stayOnToc || force))
      musicBookPlayer.scrollTo(cp);

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
    try
    {
      let img  = state ? 'play.svg' : 'play-disabled.svg';
      let rule = MusicBookPlayer.getCssRule('.mejs-controls .mejs-play button');
      rule.style.backgroundImage = `url(../img/${img})`;
    }
    catch (e)
    {
      // Probably CSS cross-origin access error -> ignore
      console.log(e);
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
        btnPrev.style['background-image'] = `url(${this.scriptBaseURI}img/prev.svg)`;
      else
        btnPrev.style['background-image'] = `url(${this.scriptBaseURI}img/prev-disabled.svg)`;
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
        btnNext.style['background-image'] = `url(${this.scriptBaseURI}img/next.svg)`;
      else
        btnNext.style['background-image'] = `url(${this.scriptBaseURI}img/next-disabled.svg)`;
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
        btnCnts.style['background-image'] = `url(${this.scriptBaseURI}img/contents.svg)`;
      else
        btnCnts.style['background-image'] = `url(${this.scriptBaseURI}img/contents-disabled.svg)`;
  }

  /**
   * Shows or hides the credits pseudo window.
   * 
   * @param: visible New visibility state of credits (boolean, default 
   *         <code>true</code>)
   */
  showCredits(visible=true)
  {
    let v = visible ? 'visible' : 'hidden';
    document.getElementById('credits').style.visibility = v;
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

  /**
   * Gets the absulute URL of an HTML resource folder.
   * 
   * @param baseURL  Base URL
   * @param resource Absolute or relative resource path. If the path name ends
   *                 with '.html' or '.htm', the entire HTML file name will be
   *                 removed to obtain the folder URL which contains the file.
   * @return The absolute URL as described above
   */
  static getFolderURL(resource,baseURL)
  {
    let url    = new URL(resource,baseURL);                                     // Make absolute URL of path
    let origin = url.origin;                                                    // Get origin
    let path   = url.pathname.split('/');                                       // Get and split path
    if (                                                                        // Path ends with
      path[path.length-1].endsWith('.html') ||                                  //   .html -or-
      path[path.length-1].endsWith('.htm')                                      //   .htm
    ){                                                                          // >> (i.e. with an HTML file name)
      path = path.slice(0,path.length-1);                                       //   Remove file name
    }                                                                           // <<
    path = origin+path.join('/');                                               // Make URL path
    if (!path.endsWith('/'))                                                    // Not ending with a slash
      path += '/';                                                              //   Append a slash
     return path;                                                                // Return base URL path
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

/**
 * Define String.endsWith if missing.
 * @see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
 */
if (!String.prototype.endsWith) 
{
  String.prototype.endsWith = function(searchString, position) 
  {
    var subjectString = this.toString();
    if (
      typeof position      !== 'number' || 
      !isFinite(position)               || 
      Math.floor(position) !== position || 
      position > subjectString.length
    ) 
    {
      position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
}

// EOF