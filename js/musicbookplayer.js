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
    features          : ['playpause','current','progress','duration'],
    startVolume       : 1,
    autoRewind        : false,
    success: function(media,node) 
    {
      MusicBookPlayer.getInstance().initialize();
    }
  });
});

// == Music Book Player Class ==================================================

/**
 * The MusicBookPlayer class
 * @public
 */
class MusicBookPlayer
{  
  // -- Public API --
  
  /**
   * Creates the MusicBookPlayer singleton. If the object already exists, the 
   * method will just return it. If the singleton does not yet exist, the method
   * creates it and writes the MusicBookPlayer HTML page and the music book 
   * title page into the current document. 
   * @public
   * 
   * @param {object} props - Music book properties
   * @param {string} [props.mediaBaseURI=undefined] - Absolute base URI of the 
   *        book's media files, i.e., audio and image files. If omitted, the 
   *        HTML document base URI will be used, which means that the media 
   *        files are located in the same folder as <code>index.html</code>.
   * @param {string} props.title - Music book title
   * @param {string} props.artist - Artist name
   * @param {string} props.image - Cover image URL, absolute or relative to 
   *        <code>mediaBaseURI</code>
   * @param {string} [props.descr=undefined] - Description text, may contain 
   *        HTML
   * @return The singleton. The object is also stored in
   *         <code>MusicBookPlayer.instance</code> and can later be retrieved by
   *         <code>MusicBookPlayer.getInstance()</code>.
   */
  static create(props)
  {
    // Check argument                                                          // -------------------------------------
    if (typeof props!='object')                                                // No argument or argument not an object
      throw 'MusicBookPlayer.create: Missing argument (property object).';     //   Not acceptable

    // Return existing or create new singleton instance                        // -------------------------------------
    if (MusicBookPlayer.instance)                                              // Singleton instance exists
      return MusicBookPlayer.instance;                                         //   Return it
    MusicBookPlayer.instance = new MusicBookPlayer();                          // Create singleton instance
    let mbp = MusicBookPlayer.instance;                                        // Short-cut identifier

    // Initialize singleton instance                                           // -------------------------------------
    // - Set fields from properties                                            // - - - - - - - - - - - - - - - - - - -
    mbp.title  = props.title;                                                  // Music book title
    mbp.artist = props.artist;                                                 // Music book artist

    // - Detect MediaBookPlayer Javascript base URI                            // - - - - - - - - - - - - - - - - - - -
    let scripts = $('script');                                                 // List HTML script tags
    for (var i=0; i<scripts.length; i++)                                       //   Iterate script tags
      if (scripts[i].src.endsWith('js/musicbookplayer.js'))                    //     MusicBookPlayer's script tags
      {                                                                        //     >>
        let uri = scripts[i].src.replace('js/musicbookplayer.js','')           //       Get source and remove file
        mbp.scriptBaseURI = uri;                                               //       Set field
        break;                                                                 //       Stop iterating
      }                                                                        //     <<

    // - Normalize mediaBaseURI                                                // -------------------------------------
    let mbu = document.baseURI;                                                // Default: document base URI
    if (props.mediaBaseURI)                                                    // Media base URI specified
      mbu = props.mediaBaseURI;                                                //   Use specification
    mbp.mediaBaseURI = MusicBookPlayer.getFolderURL(mbu);                      // Trim tailing HTML file name if any

    // Early UI initialization                                                 // ------------------------------------
    mbp.editHtmlHead(props.title,props.artist);                                // Set document title
    mbp.editHtmlBody();                                                        // Load and apply body template
    window.scroll(0,0);                                                        // Reset window scroll position
    
    // Create cover page (first page of book)                                  // ------------------------------------
    let sbu = mbp.scriptBaseURI;                                               // Shortcut script base URI field name
    MusicBookPlayer.addAudioPage({                                             // Add cover page >>
        title : props.title,                                                   //   Music book title
        artist: props.artist,                                                  //   Music book artist
        audio : MusicBookPlayer.normalizeURL(sbu,'media/coverdummy.mp3'),      //   Cover page dummy audio file
        image : props.image,                                                   //   Cover image
        descr : props.descr                                                    //   Music book description
      });                                                                      // <<
    
    // Return newly created object                                             // ------------------------------------
    return mbp;                                                                // Return singleton
  }
  
  /**
   * Adds a new audio page to the MusicBookPlayer. If a TOC page exists, the
   * method will update the TOC.
   * @public
   * 
   * @param {object} props - Page properties
   * @param {string} [props.title=undefined] - Page title<sup>1)</sup>
   * @param {string} [props.artist=undefined] - Artist name<sup>2)</sup>
   * @param {string} [props.audio=undefined] - Audio URL<sup>3)&thinsp;4)</sup>
   * @param {string} [props.image=undefined] - Image URL<sup>3)</sup>
   * @param {string} [props.descr=undefined] - Description text, may contain 
   *        HTML
   * @param {string} [props.part=undefined] - Part title. If page is a track,
   *        the part title can be used as a subtitle.
   * @param {float} [props.poffs=undefined] - The time offset in seconds if the 
   *        page is part of a track<sup>5)</sup>
   * @see <b><i>Footnotes</i></b><br>
   *      <sup>1)</sup> If omitted, the title of the previous page will be 
   *      copied if a previous page exists. Otherwise, the method will throw an 
   *      exception.<br>
   *      <sup>2)</sup> If omitted, the book's artist name will be used.<br>
   *      <sup>3)</sup> absolute or relative to <code>mediaBaseURI</code>, see 
   *      method <code>create()</code><br>
   *      <sup>4)</sup> Mandatory for tracks, omit for parts! Method will throw
   *      an exception if the <code>audio</code> property is missing creating a 
   *      track page. Track audio URLs must be unique throughout the music book!
   *      <br>
   *      <sup>5)</sup> Mandatory for all parts in a sequence of parts except
   *      the first one, omit for tracks! Method will throw an exception of the
   *      <code>ptoffs</code> property is missing creating the 2nd, 3rd, etc. 
   *      part of a track.
   * @return The newly created page
   */
  static addAudioPage(props)
  {
    // Check argument                                                          // -------------------------------------
    if (typeof props!='object')                                                // No argument or argument not an object
      throw 'MusicBookPlayer.addAudioPage: Missing argument (property object).';//  Not acceptable
    
    // Initialize                                                              // -------------------------------------
    let mbp = MusicBookPlayer.getInstance();                                   // Get MusicBookPlayer singleton
    let page = new Object;                                                     // Create new music book page
    let prev = mbp.pages.length>0 ? mbp.pages[mbp.pages.length-1] : null;      // Get previous page if any

    // Initialize new page                                                     // -------------------------------------
    page.pid    = mbp.pages.length;                                            // Set zero-based page index
    page.artist = props.artist ? props.artist : mbp.artist;                    // Specified or book's artist

    // - Audio file                                                            // - - - - - - - - - - - - - - - - - - -
    if (props.audio)                                                           // Audio file specified in properties
      page.audio = MusicBookPlayer.normalizeURL(mbp.mediaBaseURI,props.audio); //   Make absolute URL of audio file
    else if (prev)                                                             // Audio file not specified
      page.audio = prev.audio;                                                 //   Use previous (-> page is a part)
    else                                                                       // No previous page
      throw 'Missing property \'audio\' on page #${page.pid}.';                //   Not acceptable

    // - Title                                                                 // - - - - - - - - - - - - - - - - - - -
    if (props.title)                                                           // Title specified in properties
      page.title = props.title;                                                //   Use it
    else if (prev && page.audio===prev.audio)                                  // Same audio file as previous page
      page.title = prev.title;                                                 //   Copy title
    else                                                                       // Otherwise
      throw 'Missing property \'title\' on page #${page.pid}';                 //   Not acceptable

    // - Track and part fields                                                 // - - - - - - - - - - - - - - - - - - -
    if (!prev || page.audio!==prev.audio)                                      // Other audio file than previous page
    {                                                                          // >> (Page is or starts a new track)
      page.tid = prev ? prev.tid+1 : 0;                                        //   Next track ID or 0 for cover page
      if (typeof props.ptoffs!='undefined' && props.ptoffs!=0)                 //   Non-zero part offset time specified
        if (console && console.warn)                                           //     Have console
          console.warn('Ingoring property \'ptoffs\' on page #${page.pid}.');  //       Print a warning
    }                                                                          // <<
    else                                                                       // Same audio file as previous page
    {                                                                          // >> (Part of a track, but not the 1st)
      page.tid = prev.tid ? prev.tid : 0;                                      //   Same track ID or 0 for cover page
      if (typeof prev.ptoffs=='undefined')                                     //   Previous page has not part offset
        prev.ptoffs = 0;                                                       //     Set to zero (mark as first part!)
      if (typeof props.ptoffs=='number')                                       //   Part offset specified as a number
        page.ptoffs = props.ptoffs;                                            //     Set it
      else                                                                     //   Part offset not specified or NaN
        throw 'Invalid or missing propery \'ptoffs\' on page #${page.pid}.';   //     Not acceptable
    }                                                                          // <<
    if (props.part)                                                            // Part name specified in properties
      page.part = props.part;                                                  //   Set it

    // Create page DIV                                                         // -------------------------------------
    page.elem = document.createElement('section');                             // Create DOM element
    page.elem.classList.add('page');                                           // - class="page"
    page.elem.id = `page-${page.pid}`;                                         // - id="page-<pid>"

    // - Create image tag                                                      // - - - - - - - - - - - - - - - - - - -
    if (props.image)                                                           // Image specified in properties
    {                                                                          // >>
      let imgSrc = MusicBookPlayer.normalizeURL(mbp.mediaBaseURI,props.image); //   Make absolute URL of image file
      let imgDiv = document.createElement('div');                              //   Create image DIV element
      imgDiv.classList.add('track-image');                                     //   - class="track-image"
      let imgElm = document.createElement('img');                              //   Create image element
      imgElm.classList.add('track-image');                                     //   - class="track-image"
      imgElm.setAttribute('src',imgSrc);                                       //   - src="<imgSrc>"
      imgDiv.appendChild(imgElm);                                              //   Append image element to image DIV
      page.elem.appendChild(imgDiv);                                           //   Append image DIV to page DIV
      page.elem.image = imgDiv;                                                //   Store image DIV
      page.elem.image.img = imgElm;                                            //   Store image element
    }                                                                          // <<
    
    // - Create page description                                               // - - - - - - - - - - - - - - - - - - -
    let dscDiv = document.createElement('div');                                // Create page description DIV element
    dscDiv.classList.add('track-comment');                                     // - class="track-comment"
    dscDiv.innerHTML = props.descr ? props.descr :'';                          // - Insert description text as HTML
    page.elem.appendChild(dscDiv);                                             // Append description DIV to page DIV
    page.elem.descr = dscDiv;                                                  // Store description DIV
    
    // Finish up                                                               // -------------------------------------
    document.getElementById('content').appendChild(page.elem);                 // Append page DIV to content DIV
    let tocPage = mbp.isPage(mbp.tocPid);                                      // Get TOC page
    if (tocPage)                                                               // TOC page exists
      tocPage.page.descr.innerHTML = mbp.makeToc();                            //   Update TOC
    mbp.pages = mbp.pages.concat(page);                                        // Add new page to list of pages
    
    return page;
  }

  /**
   * Adds a table-of-contents page displaying a hyperlinked list of pages. If a 
   * TOC page is already existing, the method does nothing.<br>
   * <b>Note:</b> The TOC will be automatically updated on every invocation of 
   * the <code>addAudioPage()</code> method.
   * @public
   * 
   * @return The newly created or existing contents page
   */
  static addTocPage()
  {
    let mbp = MusicBookPlayer.getInstance();                                   // Get MusicBookPlayer singleton

    if (mbp.tocPid>=0)                                                         // TOC page already exists
      return mbp.pages[mbp.tocPid];                                            //   return it

    let tocPage = MusicBookPlayer.addAudioPage({                               // Add new TOC page >>
      title: 'Contents',                                                       //   Title
      audio: MusicBookPlayer.normalizeURL(                                     //   Dummy audio file
                 mbp.scriptBaseURI,                                            //   ...
                 'media/contentsdummy.mp3'                                     //   ...
                ),                                                             //   ...
      descr: mbp.makeToc(),                                                    //   Description: Write TOC
    });                                                                        // <<
    mbp.tocPid = tocPage.pid;                                                  // Set TOC page ID field
    return tocPage;                                                            // Return newly created TOC page
  }

  // -- Constructor, instance getter, and One-Time Initialization --

  /**
   * Returns the MusicBookPlayer singleton instance. Throws an exception if no 
   * such instance exists.
   * @public
   */
  static getInstance()
  {
    if (!MusicBookPlayer.instance)
      throw 'MusicBookPlayer has not been created.';
    return MusicBookPlayer.instance;
  }

  /**
   * Creates a new music book.
   * @protected
   */
  constructor()
  {
    /**
     * Music book title.
     * @type {string}
     * @protected
     */
    this.title = undefined;

    /**
     * Music book artist.
     * @type {string}
     * @protected
     */
    this.artist = undefined; 

    /**
     * Current page ID (zero-based).
     * @type {integer}
     * @protected
     */
    this.currentPid = -1; 

    /**
     * TOC page ID (zero-based).
     * @type {integer}
     * @protected
     */
    this.tocPid = -1; 

    /**
     * Array of pages.
     * @type {Object[]}
     * @protected
     */
    this.pages = [];
  }

  /**
   * Initializes the MusicBookPlayer singleton. The method is to be invoked only
   * after the underlying MediaElement has been loaded, i.e., in callback 
   * <code>MediaElement.success</code>.
   * @public
   */
  initialize()
  {
    // Pre-checks
    if (this.mep)
      return;

    // Make contents division element visible
    // HACK: Initially invisible to prevent graphic artifacts on reloading page
    document.querySelector('.content'        ).style.visibility = 'visible';
    document.querySelector('.mbp-cnts button').style.visibility = 'visible';
    document.querySelector('.mbp-next button').style.visibility = 'visible';
    document.querySelector('.mbp-prev button').style.visibility = 'visible';
    
    // Remove loading animation CSS rule
    document.getElementsByTagName('main')[0].style['background-image']='';

    // Attach and configure MediaElement player
    this.mep = document.querySelector('#audio-player');
    this.mep.setVolume(1);
    
    // Add audio event listeners
    this.mep.addEventListener('play', function(){
        MusicBookPlayer.getInstance().updateUI();
      });
    this.mep.addEventListener('playing', function(){
        MusicBookPlayer.getInstance().updateUI();
      });
    this.mep.addEventListener('canplay', function(){
        MusicBookPlayer.getInstance().updateUI();
      });
    this.mep.addEventListener('pause', function(){
        MusicBookPlayer.getInstance().updateUI();
      });
    this.mep.addEventListener('ended', function (){
        let mbp = MusicBookPlayer.getInstance();
        mbp.updateUI();
        if (mbp.currentPid < mbp.pages.length-1)
          mbp.next(true);
      });
    this.mep.addEventListener('progress', function(){
        MusicBookPlayer.getInstance().updateUI();
      });
    this.mep.addEventListener('timeupdate', function (){
        MusicBookPlayer.getInstance().updateUI();
      });
    
    // Add DOM element event listeners
    document.getElementById('content').addEventListener('scroll',
        MusicBookPlayer.handleScrollEvent.debounce(200)
      );
    
    // TODO: Replace click event handler in mediaelement-and-player.min.js:1652 (see bug #5)
    
    // Reset content scroll position and goto cover page 
    this.scrollTo(0,true);
    this.goto(0);
  }

  // -- DHTML --

  /**
   * Creates the title tag inner text.
   * @protected
   * 
   * @param {string} title  Music book title
   * @param {string} artist Music book artist
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
   * @protected
   */
  editHtmlBody()
  {
    let bodyElem = document.querySelector('body');
    let bodyHTML = `
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
        src="https://matthias-wolff.github.io/MusicBookPlayer/media/coverdummy.mp3"
      ></audio>
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
      <div class="mejs-button mbp-prev" onclick="MusicBookPlayer.getInstance().prev();">
        <button type="button" aria-controls="mep_0" 
          title="Previous Track/Part" aria-label="Previous Part/Track"
        ></button>
      </div>
      <div class="mejs-button mbp-next" onclick="MusicBookPlayer.getInstance().next();">
        <button type="button" aria-controls="mep_0" 
          title="Next Track/Part" aria-label="Next Part/Track"
        ></button>
      </div>
      <div class="mejs-button mbp-cnts" onclick="MusicBookPlayer.getInstance().gotoToc();">
        <button type="button" aria-controls="mep_0" 
          title="Contents/Cover Page" aria-label="Contents/Cover Page"
        ></button>
      </div>
    </div>
  </header>

  <!-- Music Book Content -->
  <main style="background-image:url(${MusicBookPlayer.getInstance().scriptBaseURI}img/loading.svg);">
    <div class="content" id="content"></div>
    <div class="credits" id="credits">
      <aside class="with-close-button">
        <button class="close"onclick="MusicBookPlayer.getInstance().showCredits(false);" title="Close" aria-label="Close"></button>
        <h1>Music Book Player</h1>
        <p>
          by <a target="_blank" href="https://www.b-tu.de/en/fg-kommunikationstechnik/team/staff/prof-dr-ing-habil-matthias-wolff">Matthias Wolff</a>,
          hosted on <a target="_blank" href="https://github.com/matthias-wolff/MusicBookPlayer">GitHub</a>
        </p>
        <h1 style="margin-top: 0.35rem;">Based upon</h1>
        <ul>
          <li><a target="_blank" href="https://jquery.com/">jQuery</a></li>
          <li>
            <a target="_blank" href="https://github.com/mediaelement/mediaelement">MediaElement</a>
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
  ${bodyElem.innerHTML}
  `;
    bodyElem.innerHTML = bodyHTML;
  }
  
  /**
   * Creates HTML code of the table of contents page.
   * @protected
   */
  makeToc()
  {
    let mbpi = 'MusicBookPlayer.getInstance()';                                // Javascript to get singleton instance

    // Make TOC header and cover page entry
    let html = `<table class="toc">
  <tr>
    <td class="track-title" colspan="3">
      <h1><a href="javascript:${mbpi}.tocGoto(0,false);">Cover</a></h1>
    </td>
  </tr>`;
    
    // Make TOC entries of other pages                                         // -------------------------------------
    for (let i=1; i<this.pages.length; i++)                                    // Iterate page list
    {                                                                          // >>
      if (i==this.tocPid) continue;                                            //   Skip contents pages 
      let page = this.pages[i];                                                //   Get current page
      let p1   = this.isPartPage(page) &&  this.isTrackPage(page);             //   Page is first part of several
      let p2   = this.isPartPage(page) && !this.isTrackPage(page);             //   Page is 2nd, 3rd, etc. part
      let tid  = '' + (this.pages[i].tid<10 ? '0' : '') + this.pages[i].tid;   //   Track number
      let lnk  = `javascript:${mbpi}.tocGoto(${page.pid},true);`               //   Hyperlink to page
      let tit  = this.pages[i].title + (                                       //   Title...
                     !p1 && !p2 && this.pages[i].part                          //   ...plus subtitle
                     ? ` <span class="part-title">${page.part}</span>`         //   ...
                     : ''                                                      //   ...
                   );                                                          //   ...
      let d =                                                                  //   Tag values
      {                                                                        //   >>
        tid  : !p2 ? `<a href="${lnk}">${tid}</a>` : '',                       //     Track number HTML
        tnos : !p2 ? `<a href="${lnk}">&nbsp;-&nbsp;</a>` : '',                //     Track number separator HTML
        title: !p2 ? `<h1><a href="${lnk}">${tit}</a></h1>` : '',              //     Title HTML
        part : p1 || p2                                                        //     Part HTML
               ? `<h2><a href="${lnk}">${page.part}</a></h2>`                  //     ...
               : ''                                                            //     ...
      };                                                                       //   <<
      html += `
  <tr>
    <td class="track-number">${d.tid}</td>
    <td class="track-number-separator">${d.tnos}</td>
    <td class="track-title">${d.title}${d.part}</td>
  </tr>`
    }                                                                          // <<

    // Make TOC footer
    html += `
  <tr>
    <td class="track-title" colspan="3">
      <h1><a href="javascript:${mbpi}.showCredits();">Credits</a></h1>
    </td>
  </tr>
</table>`;

    return html;
  }

  // -- Player Control --
  
  /**
   * Moves to the specified page.
   * @protected
   * 
   * @param {integer} pid - Zero-based index of page, 0 for cover page
   * @param {boolean }play - If <code>true</code>, play page'html audio file, if 
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
      this.fixTogglePlayPauseButton(false);
    }
    else
    {
      this.mep.pause();
      this.fixTogglePlayPauseButton(true);
    }
    this.updateUI();
  }

  /**
   * Scrolls to the TOC page (and keeps the current page active).
   * @protected
   */
  gotoToc()
  {
    if (this.tocPid>=0)
      this.scrollTo(this.tocPid);
    else
      this.scrollTo(0);
  }
  
  /**
   * Moves from the TOC page to another page. If parameter <code>pid</code>
   * refers to the current page, just scroll back and do not rewind audio.
   * @protected
   * 
   * @param {integer} pid - Zero-based index of page, 0 for cover page
   * @param {boolean} play - If <code>true</code>, play page's audio file, if 
   *        <code>false</code>, stop playing, if <code>undefined</code>, retain
   *        playing state. 
   */
  tocGoto(pid,play)
  {
    if (this.currentPid==this.tocPid)                    // Currently on TOC page
      this.goto(pid,play);                                          //    Normal goto
    if (this.currentPid!=pid)                                       // Move to other than current page
      this.goto(pid,play);                                          //    Normal goto
    this.scrollTo(pid);                                             // Scroll to current page
  }
  
  /**
   * Moves to the previous page if any.
   * @protected
   * 
   * @param {boolean} play - If <code>true</code>, play page's audio file, if 
   *        <code>false</code>, stop playing, if <code>undefined</code>, retain
   *        playing state. 
   */
  prev(play)
  {
    if (typeof play=='undefined')
      play = !this.mep.paused;
    let ptoffs = this.pages[this.currentPid].ptoffs;
    if (!ptoffs) ptoffs = 0;
    if (this.mep.currentTime>ptoffs+2) // Back to beginning of page's audio
    {
      this.mep.setCurrentTime(ptoffs);
    }
    else if (this.currentPid>0) // Previous page
    {
      if (this.currentPid==this.tocPid) // HACK: Explicitly scroll to predecessor of contents
        this.scrollTo(this.currentPid-1);
      this.goto(this.currentPid-1,this.currentPid>1 && play);
    }
  }

  /**
   * Moves to the next page if any.
   * @protected
   * 
   * @param {boolean} play - If <code>true</code>, play page's audio file, if 
   *        <code>false</code>, stop playing, if <code>undefined</code>, retain
   *        playing state. 
   */
  next(play)
  {
    if (typeof play=='undefined')
      play = !this.mep.paused;
    if (this.currentPid<this.pages.length-1)
      this.goto(this.currentPid+1,play);
  }

  // -- Music Book Helpers --

  /**
   * Determines whether an object is a page or if a page ID is valid.
   * @protected
   * 
   * @param {object|integer} arg - An object or a zero-based page ID.
   * @return A valid page object or <code>null</code>
   */
  isPage(arg)
  {
    // Initialize
    let page = null;
    if (typeof arg=='object' && arg!=null)
      page = arg;
    else if (typeof arg=='number' && Math.floor(arg)==arg)
    {
      if (arg>=0 && arg<this.pages.length)
        page = this.pages[arg];
      else
        return null;
    }
    else
      throw 'Argument ${arg} must be an object or an integer.';

    // Page object sanity check                                                // -------------------------------------
    if (!page) return null;                                                    // Object must exist
    if (typeof page.pid=='undefined') return null;                             // - no pid property
    if (page.pid<0 || page.pid>=this.pages.length) return null;                // - pid not in admissible range
    if (typeof page.tid=='undefined') return null;                             // - no tid property
    if (!page.audio) return null;                                              // - no or falsy audio property
    return page;
  }

  /**
   * Determines whether an object is the cover page or a page ID identifies the
   * cover page. A page is the cover page, iff its page index is 0.
   * @protected
   * 
   * @param {object|integer} arg - An object or a zero-based page ID.
   * @return A boolean
   */
  isCoverPage(arg)
  {
    let page = this.isPage(arg);                                               // Get page object for argument
    return page && (page.pid==0);                                              // Cover if page index is zero
  }

  /**
   * Determines whether an object is a track page or a page ID identifies a 
   * track page. A page is a track page, iff it has a predecessor and its audio
   * file is different from the audio file of the predecessor.<br>
   * <b>Note:</> The first page of a sequence of parts track is both, a part and
   * a track page. 
   * @protected
   * 
   * @param {object|integer} arg - An object or a zero-based page ID.
   * @return A boolean
   */
  isTrackPage(arg)
  {
    let page = this.isPage(arg);                                               // Get page object for argument
    if (page.pid==0 || page.pid==this.tocPid)                                  // Cover or TOC page
      return false;                                                            //   Not a track page
    let prev = page.pid>0 ? this.pages[page.pid-1] : null;                     // Get previous page of any
    if (!page)                                                                 // Argument does not reference a page
      return false;                                                            //   Not a track page
    if (!prev)                                                                 // No previous page, i.e., cover page
      return false;                                                            //   Not a track page
    return (page.audio!==prev.audio);                                          // Track if audio different for prev.
  }

  /**
   * Determines whether an object is a part-of-track page or a page ID 
   * identifies such a page. A page is a track page, iff its ptoffs field is
   * defined.
   * <b>Note:</> The first page of a sequence of parts track is both, a part and
   * a track page. 
   * @protected
   * 
   * @param {object|integer} arg - An object or a zero-based page ID.
   * @return A boolean
   */
  isPartPage(arg)
  {
    let page = this.isPage(arg);                                               // Get page object for argument
    if (page.pid==0 || page.pid==this.tocPid)                                  // Cover or TOC page
      return false;                                                            //   Not a track page
    return (page && typeof page.ptoffs!='undefined');                          // Part if ptoffs property exists
  }

  /**
   * Determines whether an object is the table-of-contents page or a page ID 
   * identifies that page. A page is the TOC page, iff its page index equals the
   * value of <code>MusicBookPlayer.tocPid</code>.
   * @protected
   * 
   * @param {object|integer} arg - An object or a zero-based page ID.
   * @return A boolean
   */
  isTocPage(arg)
  {
    let page = this.isPage(arg);                                               // Get page object for argument
    return page && (page.pid==this.tocPid);                                    // TOC if index equal TOC index
  }

  // -- UI Helpers --

  /**
   * Retrieves the page ID for the current scroll position of the content 
   * division element.
   * @protected
   */
  pageIdFromScrollPos()
  {
    let cnte  = document.getElementById('content');                            // Get content division element
    let spos  = cnte.scrollLeft;                                               // Current scroll position
    let spmax = cnte.scrollWidth;                                              // Maximum scroll position
    return Math.round(spos/spmax*this.pages.length);                           // Page ID for current scroll position    
  }
  
  /**
   * Content division element scroll event hander.
   * @protected
   */
  static handleScrollEvent()
  {
    let mbp = undefined;                                                       // Singleton instance
    try                                                                        // Try...
    {                                                                          // >>
      mbp = MusicBookPlayer.getInstance();                                     //   ...to get singleton instance
    }                                                                          // <<
    catch (e)                                                                  // Singleton does not (yet) exist
    {                                                                          // >>
      return;                                                                  //   Nothing to be done
    }                                                                          // <<
    let pid = mbp.pageIdFromScrollPos();                                       // Page ID for current scroll position
    if (pid==mbp.currentPid)                                                   // Scrolled to current page
      return;                                                                  //   Do nothing
    if (pid==mbp.tocPid)                                                       // Scrolled to contents page
      return;                                                                  //   Do nothing
    mbp.goto(pid);                                                             // Change page
  }  

  /**
   * Scrolls the contents area to a given page.
   * @protected
   * 
   * @param {integer} pid - Zero-based index of page, 0 for cover page
   * @param {boolean} [immediate=false] - If <code>true</code>, skip scroll 
   *        animation
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
   * @protected
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
   * @protected
   * 
   * @param {boolean} [force=false] - Force update
   */
  updateUI(force=false)
  {
    let cp = this.detectCurrentPage();
    
    // Update button states
    if (cp<0)
    {
      this.enablePlayButton(false);
      this.enablePrevButton(false);
      this.enableNextButton(false);
      this.enableCntsButton(false);
    }
    else
    {
      this.enablePlayButton(this.mep.readyState>=3);
      this.enablePrevButton(cp>0);
      this.enableNextButton(cp<this.pages.length-1);
      this.enableCntsButton(true);
    }
    this.fixTogglePlayPauseButton(this.mep.paused);
    
    // If page did not change and not forced -> that was it...
    if (this.currentPid==cp && !force)
      return;

    // Scroll to current page unless contents page is displayed while different
    // page is active
    let stayOnToc = this.pageIdFromScrollPos()==this.tocPid;
    if (cp>=0 && (!stayOnToc || force))
      this.scrollTo(cp);

    // Set current page
    this.currentPid = cp;

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
      if (typeof this.pages[cp].tid!='undefined')
      {
        s += this.pages[cp].tid;
        if (s.length==1) s='0'+s;
      }
      if (s)
      {
        $('#track-number'          )[0].innerHTML=s;
        $('#track-number-separator')[0].innerHTML='-';
        $('#track-title'           )[0].innerHTML=this.pages[cp].title;
      }
      else
      {
        $('#track-number'          )[0].innerHTML=this.pages[cp].title;
        $('#track-number-separator')[0].innerHTML='';
        $('#track-title'           )[0].innerHTML='';
      }
      if (typeof this.pages[cp].part!='undefined')
        $('#part-title')[0].innerHTML=this.pages[cp].part;
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
    $('#album-title'  )[0].innerHTML=this.pages[0].title;
    $('#album-artist' )[0].innerHTML=this.pages[cp].artist;
  }

  /**
   * HACK: Fix toggling of MediaElement's play/pause button.
   * @protected
   * 
   * @param {boolean} play - If <code>true</code>, show "play" icon, otherwise 
   *        show "pause" icon.
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
   * @protected
   * 
   * @param {boolean} state - New state, <code>true</code> for enabled, 
   *        <code>false</code> for disabled.
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
   * @protected
   * 
   * @param {boolean} state - New state, <code>true</code> for enabled, 
   *        <code>false</code> for disabled.
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
   * @protected
   * 
   * @param {boolean} state - New state, <code>true</code> for enabled, 
   *        <code>false</code> for disabled.
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
   * @protected
   * 
   * @param {boolean} state - New state, <code>true</code> for enabled, 
   *        <code>false</code> for disabled.
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
   * @protected
   * 
   * @param {boolean} [visible=true] - New visibility state of credits
   */
  showCredits(visible=true)
  {
    let v = visible ? 'visible' : 'hidden';
    document.getElementById('credits').style.visibility = v;
  }

  // -- Static Helpers --

  /**
   * Retrieves a rule from the MediaBookPlayer CSS file.<br>
   * <b>NOTE:</b> This method is prone to throwing CSS cross-origin access
   * errors and should not be used.
   * @protected
   * 
   * @param {string} selectorText - The selector text<br>
   *         FIXME: Not robust; must match CSS rule definition exactly!
   * @return The rule object or <code>null</code> if the rule was not found
   */
  static getCssRule(selectorText)
  {
    // Find MusicBookPlayer CSS link tag
    let linkTag  = null;
    let linkTags = $('link');
    for (let i=0; i<linkTags.length; i++)
      if (linkTags[i].href.endsWith('/MusicBookPlayer/css/styles.css'))
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
   * @protected
   * 
   * @param {string} baseURL - Base URL
   * @param {string} resource - Absolute or relative resource path
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
   * Gets the absolute URL of an HTML resource folder.
   * 
   * @param {string} baseURL - Base URL
   * @param {string} resource - Absolute or relative resource path. If the path 
   *        name ends with <code>'.html'</code> or <code>'.htm'</code>, the 
   *        entire HTML file name will be removed to obtain the folder URL which
   *        contains the file.
   * @return The absolute URL as described above
   */
  static getFolderURL(resource,baseURL)
  {
    let url    = new URL(resource,baseURL);                                    // Make absolute URL of path
    let origin = url.origin;                                                   // Get origin
    let path   = url.pathname.split('/');                                      // Get and split path
    if (                                                                       // Path ends with
      path[path.length-1].endsWith('.html') ||                                 //   .html -or-
      path[path.length-1].endsWith('.htm')                                     //   .htm
    ){                                                                         // >> (i.e. with an HTML file name)
      path = path.slice(0,path.length-1);                                      //   Remove file name
    }                                                                          // <<
    path = origin+path.join('/');                                              // Make URL path
    if (!path.endsWith('/'))                                                   // Not ending with a slash
      path += '/';                                                             //   Append a slash
     return path;                                                              // Return base URL path
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
 * 
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