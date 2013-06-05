 /**
 * Overlay
 */

define(
[ 'easyXDM'
, 'lib/environment'
, 'lib/metadata-scraper'
, 'json'
]
,
function (easyXDM, env, metadataScraper, serializer) {
  var Overlay;



  /**
   * Constructor
   *
   */

  Overlay = function (id) {
    var self = this
      , start = {}
      , currentPos = {}
      , diff = {}
      , state = 0
      , html = document.getElementsByTagName('html')[0]
      , zoom = window.getComputedStyle(html).zoom
      , konami = [38,38,40,40,37,39,37,39,66,65];



    self.id = id;
    self.el = document.createElement('div');
    self.el.id = self.id;
    // ensure overlay zoom is at 1 because weird people
    // seem to think it's funny to change the zoom on their html element
    // for instance http://bernsteinbear.com/a-quest-for-anonymity
    // doesn't work in FF but that's not a problem since the zoom effect renders OK in it
    if (zoom !== 1) {
      self.el.style.zoom = 1 / zoom;
    }
    DEVMODE && console.log('[OverlayView] init');

    //create wrapper div
    self.wrapper = document.createElement('div');
    self.wrapper.id = 'tldr-wrapper-bm-d4a6ebe3';
    self.el.appendChild(self.wrapper);

    //create subwrapper div
    self.subwrapper = document.createElement('div');
    self.subwrapper.id = 'tldr-subwrapper-bm-d4a6ebe3';
    self.wrapper.appendChild(self.subwrapper);

    // create draggable div
    self.dragger = document.createElement('div');
    self.dragger.id = 'tldr-dragger-bm-d4a6ebe3';
    self.dragger.setAttribute('draggable', 'true');
    self.subwrapper.appendChild(self.dragger);

    // create header
    self.header = document.createElement('div');
    self.header.id = 'tldr-header-bm-d4a6ebe3';
    self.header.innerHTML = '<span class="tldr-brand">tl;dr</span>';
    self.subwrapper.appendChild(self.header);

    // create consumer rpc instance
    self.createConsumer();

    // create close button
    self.closeButtonDiv = document.createElement('div');
    self.closeButtonDiv.id = 'tldr-close-iframe-bm-d4a6ebe3';
    self.closeButton = document.createElement('button');
    self.closeButton.id = 'tldr-btn-close-iframe-bm-d4a6ebe3';
    self.closeButtonDiv.appendChild(self.closeButton);
    self.wrapper.appendChild(self.closeButtonDiv);

    /**
     * Close
     * Remove from DOM - Unbind Events - Send close message to container
     */
    Overlay.prototype.close = function () {
      DEVMODE && console.log('[OverlayView] Close');

      // kill resizer
      window.clearInterval(self.resizer);

      // destroy the iframe and consumer instance
      self.consumer.destroy();


      // remove overlayView from DOM
      self.el = self.el.parentNode.removeChild(self.el);

      // unbind click
      if (self.el.removeEventListener) { // modern browsers
        self.closeButton.removeEventListener('click', self.close);
      } else if (self.el.detachEvent) { // support IE <= 8
        self.closeButton.detachEvent('click', self.close);
      }
    };

    if (self.el.addEventListener) {  // modern browsers
      // make a click on the overlay close the overlay
      self.closeButton.addEventListener('click', self.close);

      window.document.body.addEventListener('dragover', function (event) {
        currentPos = { X: event.clientX, Y: event.clientY };
        if (currentPos.Y !== 0) { // Bad dragend event chrome
          diff = { X: (currentPos.X - start.X) , Y: (currentPos.Y - start.Y) };
          self.wrapper.style.top = (start.top + diff.Y) + 'px';
          self.wrapper.style.left = (start.left + diff.X) + 'px';
        }
      });

      self.dragger.addEventListener('dragstart', function (event) {
        start = { X: event.clientX, Y: event.clientY };
        start.top = self.wrapper.style.top || '0px';
        start.top = parseInt(start.top.replace('px',''), 10);
        // the 550 is to compensate the -550px margin-left
        // for some reason self.wrapper.style.marginLeft yields empty so I hardcoded it
        // the first time the iframe is dragged the left roperty isn't set so we need to use offsetLeft
        start.left = self.wrapper.style.left || self.wrapper.offsetLeft + 550 + 'px' || '0px';
        start.left = parseInt(start.left.replace('px',''), 10);
        document.getElementById('tldr-iframe-bm-d4a6ebe3').style.pointerEvents = 'none';
        DEVMODE &&  console.log('dragstart', start);
        // This has to be set for FF to fire drag/dragover events
        event.dataTransfer.setData('text/plain', 'Drag dragger');
      });

      self.dragger.addEventListener('dragend', function (event) {
        document.getElementById('tldr-iframe-bm-d4a6ebe3').style.pointerEvents = 'auto';
      });

      window.addEventListener('keydown', function(e) {
        if ( e.keyCode === konami[state] ){
          state++;
        }
        else {
          // Thank god the konami code makes for a simple automaton we can hack like this
          if (e.keyCode === 38) {
            if (state <= 2) {
              state = 2;
            } else {
              state = 1;
            }
          } else {
            state = 0;
          }
        }
        if ( state === 10 ){
          self.konami();
          state = 0;
        }
      }, true);

    } else if (self.el.attachEvent) { // support IE <= 8
      self.closeButton.attachEvent('click', self.close);
    }

  };

  Overlay.prototype.konami = function konami () {
    var el = this.wrapper;

    function addClass( classname, element ) {
        var cn = element.className;
        //test for existance
        if( cn.indexOf( classname ) !== -1 ) {
            return;
        }
        //add a space if the element already has class
        if( cn !== '' ) {
            classname = ' '+classname;
        }
        element.className = cn+classname;
    }

    function removeClass( classname, element ) {
        var cn = element.className
          , rxp = new RegExp( '\\s?\\b'+classname+'\\b', 'g' );
        cn = cn.replace( rxp, '' );
        element.className = cn;
    }

    addClass('konami', el);
    window.addEventListener('transitionEnd', function(e) { removeClass('konami', el);});
    window.addEventListener('webkitTransitionEnd', function(e) { console.log('end');removeClass('konami', el);});

  };

  /**
   * CreateConsumer
   * Use easyXDM to create iframe and establish a link
   * to communicate between current window and iframe
   *
   */

  Overlay.prototype.createConsumer = function createConsumer () {
    var self = this
      , getOverlay = function () { return document.getElementById('tldr-overlay-bm-d4a6ebe3'); }
      , getWrapper = function () { return document.getElementById('tldr-wrapper-bm-d4a6ebe3'); }
      , getSubwrapper = function () { return document.getElementById('tldr-subwrapper-bm-d4a6ebe3'); }
      , getIframe = function () { return document.getElementById('tldr-iframe-bm-d4a6ebe3'); };

    DEVMODE && console.log('[OverlayView] Create Consumer', self.el);

    // this creates the consumer (parent document) rpc
    // which means it creates the iframe itself
    // the remote parameter will be the src attribute of the iframe
    //

    this.consumer = new easyXDM.Rpc({ remote: env.baseUrl + '/iframe.html?url='+encodeURIComponent(window.location.href) // the path to the provider
                                    , container: self.subwrapper // attach iframe to overlay
                                    , props: { id: 'tldr-iframe-bm-d4a6ebe3'
                                             , scrolling: 'no'
                                             , frameborder: '0'
                                             }
                                    },
                                    { local: { scrapeMetadata: function (success, error) {
                                                 // scrape it
                                                 var metadata = metadataScraper.getAvailableMetaData(window.location.pathname);
                                                 DEVMODE && console.log('[OverlayView] scraped metadata:', metadata);

                                                 // send it back to provider
                                                 self.consumer.storeScrapedMetadata(metadata, function () {}, function () {});
                                               }
                                             , closeOverlay: function (success, error) {
                                                 self.close();
                                               }
                                             , konami: function (success, error) {
                                                 DEVMODE && console.log('Konami');
                                                 self.konami();
                                               }
                                             , setIframeHeight: function (height, success, error) {
                                                 // first set the iframe height
                                                 getIframe().style.height = height + 'px';

                                                 // then check if browser uses webkit
                                                 var ua = navigator.userAgent.toLowerCase()
                                                   , match = /(webkit)[ \/]([\w.]+)/.exec(ua) || []
                                                   , webkit = match[1] || '';

                                                 // fix stupid webkit reflow bug
                                                 if (webkit) {
                                                   setTimeout(function() {
                                                     getWrapper().style['border-radius'] = '3px';
                                                     setTimeout(function() {
                                                       getWrapper().style['border-radius'] = '4px';
                                                     });
                                                   });
                                                 }
                                               }
                                             , switchMode: function (mode, success, error) {
                                                DEVMODE && console.log('[OverlayView] switch Mode to ', mode);
                                                if (mode === 'edit') {
                                                  // remove overlay to reveal underlying page
                                                  getOverlay().style.backgroundColor = 'transparent';
                                                  // allow selecting text on underlying page
                                                  getOverlay().style.pointerEvents = 'none';
                                                } else if (mode === 'read') {
                                                  // overlay to hide underlying page
                                                  getOverlay().style.backgroundColor = 'rgba(0,0,0,0.80)';
                                                  // prevent clicks on links or other actions on underlying page
                                                  getOverlay().style.pointerEvents = 'auto';
                                                }
                                               }
                                             }
                                    , remote: { storeScrapedMetadata: {}
                                              }
                                    , serializer: serializer
                                    });


  };


  return Overlay;
});

