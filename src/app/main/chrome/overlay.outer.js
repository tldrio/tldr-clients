require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'Mustache'
        , 'underscore'
        , 'lib/environment'
        , 'lib/metadata-scraper'
        , 'lib/utils'
        , 'text!templates/chrome/onboardingFirstRead.mustache'
        , 'chromepowertip'
        ],
function (
  devmodeRetroCompatibility
, $
, Mustache
, _
, env
, metadataScraper
, utils
, onboardingFirstReadTemplate
) {

    // Flag to indicate that Chrome should not inject this script twice in the page
    window.tldr_d4a6ebe3_inject_overlay = true;

    //State variables
    var CTAshown = false
      , onboardingShown = false;

    function setupOverlay () {
      var overlay = $('<div></div>').attr('id', 'tldr-overlay-ext-d4a6ebe3')
        , wrapper = $('<div></div>').attr('id', 'tldr-wrapper-ext-d4a6ebe3')
        , subwrapper = $('<div></div>').attr('id', 'tldr-subwrapper-ext-d4a6ebe3')
        , header = $('<div></div>').attr('id', 'tldr-header-ext-d4a6ebe3').html('<span class="tldr-brand">tl;dr</span>')
        , dragger = $('<div></div>').attr('id', 'tldr-dragger-ext-d4a6ebe3').attr('draggable', 'true')
        , closeButtonWrapper = $('<div></div>').attr('id', 'tldr-close-iframe-ext-d4a6ebe3')
        , closeButton = $('<button></button>').attr('id', 'tldr-btn-close-iframe-ext-d4a6ebe3')
        , iframe = $('<iframe></iframe>').attr('src', env.baseUrl + '/iframe.crx.html?url=' + encodeURIComponent(window.location.href))
                                         .attr('id', 'tldr-iframe-ext-d4a6ebe3')
        , self = overlay[0]
        , start = {}
        , currentPos = {}
        , diff = {}
        , overlayContainer
        , zoom = $('html').css('zoom');

      overlayContainer = $('<div></div>').attr('id', 'tldr-overlay-container-ext-d4a6ebe3')
                                             .attr('style','display:none;');
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
      utils.loadCssFile(chrome.extension.getURL('assets/css/overlay.outer.css'));
      $('body').append(overlayContainer);
    }

    function checkForOnboardingRead() {

      chrome.extension.sendMessage({ action: 'GET_ONBOARDING_READ_STATUS'
                                   , domain: window.location.hostname }
                                   , function(validForReadOnboarding) {
        if (validForReadOnboarding) {
          $(window).one('scroll', function() {
            utils.loadCssFile(chrome.extension.getURL('assets/css/overlay.css'));
            setTimeout(function() {
              onboardingShown = true;
              showOnboardingContainer('READ');
            }, 500);
          });
        }
      });
    }


    function showOnboardingContainer(type) {
      var onboardingMessage =  onboardingFirstReadTemplate
        , onboardingImg = 'assets/img/tldr-present.png'
        , onboardingContainer = $('<div></div>', { id: 'tldr-d4a6ebe3-onboarding-container'})
                                 .css('display','none')
        , onboardingPowertip = $('<div></div>')
                                 .addClass('tldr-d4a6ebe3-powertip')
                                 .html(Mustache.render(onboardingMessage, {imgPath: chrome.extension.getURL(onboardingImg)}))
        , closeButton = $('<button></button>')
                        .addClass('tldr-d4a6ebe3-close-onboarding')
                        .html('x')
                        .click(function() {
                          onboardingContainer.fadeOut();
                        });

      onboardingPowertip.prepend(closeButton);
      onboardingContainer.append(onboardingPowertip);

      $('body').append(onboardingContainer);
      $('body').one('click', function() {
        onboardingContainer.fadeOut();
      });
      onboardingContainer.fadeIn();
      chrome.extension.sendMessage({ action: 'ONBOARDING_SHOWN', type: type});

      // AUto dismiss after a certain time
      setTimeout(function() {
        onboardingContainer.fadeOut();
      }, 6000);
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

      chrome.extension.onMessage.addListener(function(message, sender, callback) {
        var metadata
          , after
          , visible;

        switch(message.action) {
          case 'SET_IFRAME_HEIGHT':
            $('#tldr-iframe-ext-d4a6ebe3').height(message.height);
            break;
          case 'CLOSE_IFRAME':
            $('#tldr-overlay-container-ext-d4a6ebe3').toggle();
            break;
          case 'SCRAPE_METADATA':
             // scrape it
             metadata = metadataScraper.getAvailableMetaData(window.location.pathname);
             // send it back to provider
             chrome.extension.sendMessage({ action: 'STORE_METADATA', metadata: metadata});
             break;
          case 'SWITCH_IFRAME_MODE':
            mode = message.mode;
            break;
          case 'INIT_DONE':
            $('#tldr-overlay-container-ext-d4a6ebe3').show();
            break;
        }
      });
    }

    if ($('#tldr-overlay-container-ext-d4a6ebe3').length === 0) {
      checkForOnboardingRead();
      chrome.extension.onMessage.addListener(function(message, sender, callback) {
        var visible
          , after;

        if ( message.action === 'TOGGLE_TLDR') {
          if (!$('#tldr-overlay-container-ext-d4a6ebe3').length) {
            registerListenerForIframeEvents();
            setupOverlay();
            visible = false;
          } else {
            visible = $('#tldr-overlay-container-ext-d4a6ebe3').is(':visible');
            $('#tldr-overlay-container-ext-d4a6ebe3').toggle();
          }
          // The tldr will appear so we increment readCount
          if (!visible) {
            if (onboardingShown) {
              $('#tldr-d4a6ebe3-onboarding-container').fadeOut();
              after = 'onboarding';
            }
            if (CTAshown) {
              $('#tldr-d4a6ebe3-cta-contribution-container').animate({ right: '-190px'});
              after = 'CTA';
            }
            chrome.extension.sendMessage({ action: 'SHOW_IFRAME_CRX', after: after});
          }
        }
      });
      if (window.tldr_cta_improve_summary) {
        registerListenerForIframeEvents();
        setupOverlay();
      }

    }

});
