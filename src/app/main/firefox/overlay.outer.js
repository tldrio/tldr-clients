require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'Mustache'
        , 'underscore'
        , 'lib/environment'
        , 'lib/metadata-scraper'
        , 'lib/utils'
        , 'firefoxpowertip'
        ],
function (
  devmodeRetroCompatibility
, $
, Mustache
, _
, env
, metadataScraper
, utils
) {


    function setupOverlay () {
      var overlay = $('<div></div>').attr('id', 'tldr-overlay-ext-d4a6ebe3')
        , wrapper = $('<div></div>').attr('id', 'tldr-wrapper-ext-d4a6ebe3')
        , subwrapper = $('<div></div>').attr('id', 'tldr-subwrapper-ext-d4a6ebe3')
        , header = $('<div></div>').attr('id', 'tldr-header-ext-d4a6ebe3').html('<span class="tldr-brand">tl;dr</span>')
        , dragger = $('<div></div>').attr('id', 'tldr-dragger-ext-d4a6ebe3').attr('draggable', 'true')
        , closeButtonWrapper = $('<div></div>').attr('id', 'tldr-close-iframe-ext-d4a6ebe3')
        , closeButton = $('<button></button>').attr('id', 'tldr-btn-close-iframe-ext-d4a6ebe3')
        , iframe = $('<iframe></iframe>').attr('src', env.extensionBaseUrl + '/overlay.firefox.html?url=' + encodeURIComponent(window.location.href))
                                         .attr('id', 'tldr-iframe-ext-d4a6ebe3')
        , self = overlay[0]
        , start = {}
        , currentPos = {}
        , diff = {}
        , overlayContainer
        , zoom = $('html').css('zoom');

      overlayContainer = $('<div></div>').attr('id', 'tldr-overlay-container-ext-d4a6ebe3')
                                         .addClass('firefox');
      overlay.css('zoom', 1 / zoom);

      self.wrapper = wrapper[0];
      self.dragger = dragger[0];

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
        document.getElementById('tldr-iframe-ext-d4a6ebe3').style.pointerEvents = 'none';
        DEVMODE &&  console.log('dragstart', start);
        // This has to be set for FF to fire drag/dragover events
        event.dataTransfer.setData('text/plain', 'Drag dragger');
      });

      self.dragger.addEventListener('dragend', function (event) {
        document.getElementById('tldr-iframe-ext-d4a6ebe3').style.pointerEvents = 'auto';
      });

      closeButton.on('click', function() { overlayContainer.toggle(); });

      subwrapper.append(dragger);
      subwrapper.append(header);
      subwrapper.append(iframe);
      wrapper.append(subwrapper);
      overlay.append(wrapper);
      overlayContainer.append(overlay);
      closeButtonWrapper.append(closeButton);
      wrapper.append(closeButtonWrapper);
      utils.loadCssFile(env.extensionBaseUrl + '/assets/css/overlay.outer.css');
      $('body').append(overlayContainer);
    }

    function getIframe() {
      return  $('#tldr-iframe-ext-d4a6ebe3')[0];
    }

    function registerListenerForIframeEvents () {
      // mode holds state of the extension iframe. either 'read' or 'edit'
      var mode;
      // Prevent automatic closing or reloading of the underlying page
      // This should only be activated in edit mode to prevent understandable frustration
      window.onbeforeunload = function () {
        if ($('#tldr-overlay-container-ext-d4a6ebe3').css('display') !== 'none' && mode === 'edit') {
          return "Your tl;dr is not saved yet and you will lose all your work if you leave this page!";
        }
      };

    window.addEventListener('message', function (event) {
      var message = event.data
        , metadata
        , after
        , visible;

        switch(message.action) {
          case 'SET_IFRAME_HEIGHT':
            $('#tldr-iframe-ext-d4a6ebe3').height(message.height + 1);
            break;
          case 'CLOSE_IFRAME':
            $('#tldr-overlay-container-ext-d4a6ebe3').toggle();
            break;
          case 'SCRAPE_METADATA':
             // scrape it
             metadata = metadataScraper.getAvailableMetaData(window.location.pathname);
             // send it back to provider
             var iframe = getIframe();
             if (iframe) {
               iframe.contentWindow.postMessage({ action: 'STORE_METADATA', metadata: metadata}, '*');
             }
             break;
          case 'SWITCH_IFRAME_MODE':
            mode = message.mode;
            break;
          case 'INIT_DONE':
            $('#tldr-overlay-container-ext-d4a6ebe3').css('opacity', '1');
            break;
          case 'GET_TLDR_DATA_FOR_IFRAME':
            self.port.emit('GET_TLDR_DATA_FOR_IFRAME');
            break;
          case 'SYNC_USER_DATA':
            self.port.emit('SYNC_USER_DATA', message.data);
            break;
          case 'TLDR_SAVED':
            self.port.emit('TLDR_SAVED', message.data);
            break;
        }
      });
    }

    // Relay event to overlay.inner
    self.port.on('GET_TLDR_DATA_FOR_IFRAME', function (data) {
      var iframe = getIframe();
      if (iframe) {
       iframe.contentWindow.postMessage({ action: 'GET_TLDR_DATA_FOR_IFRAME', tldrData: data }, '*');
       iframe.contentWindow.postMessage({ action: 'SHOW_OVERLAY', url: window.location.href }, '*');
      }
    });

    // Relay event to overlay.inner
    self.port.on('SYNC_USER_DATA', function (data) {
      var iframe = getIframe();
      if (iframe) {
        iframe.contentWindow.postMessage({ action: 'SYNC_USER_DATA', data: data }, '*');
      }
    });

    self.port.on('TOGGLE_TLDR', function (data) {
      var visible
        , after;

      if (!$('#tldr-overlay-container-ext-d4a6ebe3').length) {
        registerListenerForIframeEvents();
        setupOverlay();
        visible = false;
      } else {
        visible = $('#tldr-overlay-container-ext-d4a6ebe3').is(':visible');
        $('#tldr-overlay-container-ext-d4a6ebe3').toggle();
      }

      // The tldr will appear so we increment readCount. This will work only on toggle not creation as the iframe won't be finish loading
      if (!visible) {
        getIframe().contentWindow.postMessage({ action: 'SHOW_OVERLAY', url: window.location.href }, '*');
      }
    });

    if (unsafeWindow.tldr_cta_improve_summary) {
      registerListenerForIframeEvents();
      setupOverlay();
    }

});
