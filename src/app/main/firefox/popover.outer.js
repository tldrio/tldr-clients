require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'underscore'
        , 'lib/environment'
        , 'lib/utils'
        , 'firefoxpowertip'
],
function (
  devmodeRetroCompatibility
  , $
  , _
  , env
  , utils
) {


  function sendUrlsForPowertipsToBackground () {
    var hostname = window.location.hostname
    , selector
    , $linksList
    , $nodesList
    ;

    switch (hostname) {
      case 'news.ycombinator.com':
        selector = '.title > a';
        break;
      case 'www.reddit.com':
        selector = '.title > a';
        break;
      case 'longreads.com':
        case 'www.longreads.com':
        selector = '.article > .h-title > a';
        break;
      case 'thefeature.net':
        selector = '.post > h2 > a';
        break;
      case 'techmeme.com':
        case 'www.techmeme.com':
        selector = '.item > .ii > strong > a';
        break;
      case 'blog.eladgil.com':
        selector = '.post-body a[href*="blog.eladgil"], .post-title a[href*="blog.eladgil"]';
        break;
      case 'getpocket.com':
        if (window.location.href.match(/getpocket.com\/(read|list|unread)/)) {
          selector = '.title > strong > .item';
        }
        else if (window.location.href.match('getpocket.com/a/read')) {
          selector = 'li.original > a';
        }
        break;
      case 'pinboard.in':
        if (window.location.pathname === '/recent/' || window.location.pathname === '/popular/') {
        selector = '.bookmark_title';
      }
        break;
    }

    if (selector) {
      utils.loadCssFile(env.extensionBaseUrl + '/assets/css/popover.outer.css');
      $nodesList = $(selector);
      // list of unique links matching the selector
      $linksList = _.uniq(_.pluck($nodesList, 'href'));
      DEVMODE && unsafeWindow.console.log('links', $linksList);
      // Send urls to background so it can call the server
      self.port.emit('SEND_URLS_FOR_POWERTIPS_TO_BACKGROUND', $linksList);

      // retrieve the results from the background
      self.port.on('SEND_TLDRS_FOR_POWERTIPS_TO_CONTENT_SCRIPT', function (data) {

        var tldrs = data.tldrs
        // This is the array containing all tldrized urls
        , urls = data.urls
        , normalizedUrl
        , tldrizedUrls = {};


        // Create object with url as key and tldr as value
        _.each(tldrs, function (tldr) {
          _.each(tldr.possibleUrls, function(possibleUrl) {
            tldrizedUrls[possibleUrl] = tldr;
          });
        });

        $nodesList.each(function(i, node) {
          normalizedUrl = urls[node.href];
          // See if we have the tl;dr for this node
          // tldrizedUrls contains the normalizedUrls as keys
          if ( _.has(tldrizedUrls, normalizedUrl) ) {
            var data = tldrizedUrls[normalizedUrl]
            //Create the popover div
            , $label
            , iframe
            , $div
            , tldrId = data._id
            , options = { mouseOnToPopup: true
              , placement: 'e'
              , smartPlacement: true
              , popupId: 'tldr-popover-d4a6ebe3'
              , iframeId: 'tldr-iframe-popover-d4a6ebe3'
              , iframeSrc: env.extensionBaseUrl + '/popover.firefox.html'
            }
            ;

            self.port.emit('STORE_TLDR_DATA_IN_BACKGROUND', { tldrData: data });

            //Create the label
            $label = $('<span class="tldr-label-d4a6ebe3" data-tldrid="'+data._id+'"><a href="'+ env.websiteUrl + '/tldrs/' + data._id + '/' + data.slug +'">tldr</a></span>');
            // Register handler when powertip opens
            $label.on('powerTipPreRender', function() {
              //Ask the background for the latest version of the tldrData
              self.port.emit('PRERENDER_POPOVER', { _id: data._id });
            });

            // Insert label after link
            $(node).after($label);

            // Enable powertip
            $label.powerTip(options);
            // Track opening of powertip
            $label.on({ powerTipOpen: function () {
                DEVMODE && console.log('[CRX] powertip opened');
                self.port.emit('POPOVER_OPENED', { tldrId: tldrId });

                iframe = getIframe();
                if (iframe) {
                  iframe.contentWindow.postMessage({ action: 'TRACK_HOVER', url: node.href, referrer: window.location.hostname }, '*');
                }

              }
            });
          }
        });
      });
    }
  }

  function getIframe() {
    return $('#tldr-iframe-popover-d4a6ebe3')[0] ;
  }

  function registerListenerForPopoverEvents () {

    // Relay event
    self.port.on('SEND_POPOVER_TIP', function (data) {
      var iframe = getIframe();
      if (iframe) {
        iframe.contentWindow.postMessage({ action: 'PLACE_POPOVER_TIP', placement: data.placement }, '*');
      }
    });

    // Relay event
    self.port.on('REMOVE_POPOVER_TIP', function (data) {
      var iframe = getIframe();
      if (iframe) {
        iframe.contentWindow.postMessage({ action: 'REMOVE_POPOVER_TIP'}, '*');
      }
    });

    // Relay event
    self.port.on('SYNC_USER_DATA', function (data) {
      var iframe = getIframe();
      if (iframe) {
        iframe.contentWindow.postMessage({ action: 'SYNC_USER_DATA', data: data }, '*');
      }
    });

    // We retrieve the last updated version of the data
    self.port.on('PRERENDER_POPOVER', function (data) {
      var iframe = getIframe();
      if (iframe) {
        iframe.contentWindow.postMessage({ action: 'PRERENDER_POPOVER', tldrData: data.tldrData } , '*');
      }
    });


    window.addEventListener('message', function (event) {
      var message = event.data
        , $label;
      switch(message.action) {
        case 'SET_POPOVER_HEIGHT':
          //DEVMODE && unsafeWindow.console.log('setting poppover height', message.height);
          // the hardcoded 22 is for the tips
          $('#tldr-iframe-popover-d4a6ebe3').height(message.height + 22);
          self.port.emit('POSITION_POPOVER');
          break;
        case 'SWITCH_POPOVER_IN_EDIT_MODE':
          $label = $('.tldr-label-d4a6ebe3[data-tldrid="'+ message.tldrId+'"]');
          $label.first().data('stayhere', true);
          $('body').one('click', function () {
            $label.first().data('stayhere', false);
          });
          break;
        case 'UPDATE_TLDR_DATA':
          self.port.emit('UPDATE_TLDR_DATA', { tldrData: message.tldrData });
          break;
        case 'SYNC_USER_DATA':
          self.port.emit('SYNC_USER_DATA', message.data);
          break;
      }
    });
  }

  registerListenerForPopoverEvents();
  sendUrlsForPowertipsToBackground();
});
