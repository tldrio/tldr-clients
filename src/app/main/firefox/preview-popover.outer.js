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

  // Make sure we do the injection just once
  // as the cb in background is triggered even when
  // the page is not reloaded
  if (window.tldr_d4a6ebe3_inject_preview_popover) {
    return;
  }
  window.tldr_d4a6ebe3_inject_preview_popover = true;

  function injectPreviews () {
    var hostname = window.location.hostname
      , selector
      , $linksList
      , $nodesList
      , $remainingNodes = []
      , entries
      , options = { mouseOnToPopup: true
                   , placement: 'e'
                   , smartPlacement: true
                   , intentSensitivity: 4
                   , popupId: 'tldr-popover-d4a6ebe3'
                   , iframeId: 'tldr-iframe-popover-d4a6ebe3'
                   , iframeSrc: env.extensionBaseUrl + '/popover.firefox.html'
                   };

      if (hostname.match('en.wikipedia.org')) {
        selector = '#mw-content-text > p > a[href*="/wiki/"]';
      } else {
        selector = 'a[href*="wikipedia.org/wiki/"]';
      }

    if (window.location.href.match(new RegExp('*://(?!plus)*.google.*/*'.replace(/[.]/g,'[.]').replace(/\*/g, ".*") ))) {
      return;
    }


    $nodesList = $(selector);
    // list of unique links matching the selector

    entries = _.map($nodesList, function(node) {
      var href = node.href
        , matches = href.match(/wikipedia\.org\/wiki\/(.*)/)
        , entry
        , result = { node: node }
        ;

      if (matches && matches.length >= 2 && matches[1].length) {
        entry = decodeURIComponent(matches[1]);
        entry = entry.split('#')[0];
        if (entry.indexOf(':') !== -1) { // Remove bad urls like File: etc
          result.entry = null;
          return result;
        }
        entry = entry.replace(/[^A-Za-z0-9–_]+/g,''); // Keep alphanumerical characters
        entry = entry.replace(/[–_]+/g,' '); // REplace - and _ by space
        entry = entry.replace(/^[\r\n\s\t]+|[\r\n\s\t]+$/g, "");
        result.entry = entry;
        return result;
      } else {
        result.entry = null;
        return result;
      }
    });
    // filter null values
    entries = _.filter(entries, function(entry) { return entry.entry && entry.entry.length;});

    $nodesList = _.pluck(entries, 'node');
    $linksList = _.uniq(_.pluck($nodesList, 'href'));

    if (!$linksList.length) {
      return; // there is no link to search a tldr for
    }

    utils.loadCssFile(env.extensionBaseUrl + '/assets/css/popover.outer.css');
    registerListenerForPopoverEvents();
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

        _.each($nodesList,function(node) {
          normalizedUrl = urls[node.href];
          // See if we have the tl;dr for this node
          // tldrizedUrls contains the normalizedUrls as keys
          if ( _.has(tldrizedUrls, normalizedUrl) ) {
            // Remove entry from the batch to send to ddg
            entries = _.reject(entries, function(entry) { return entry.node.href === node.href;});

            var data = tldrizedUrls[normalizedUrl]
            //Create the popover div
              , $label
              , iframe
              , $div
              , tldrId = data._id
              , $node = $(node);

            //chrome.extension.sendMessage({ action: 'STORE_TLDR_DATA_IN_BACKGROUND'
                                         //, tldrData: data
            //});
            self.port.emit('STORE_TLDR_DATA_IN_BACKGROUND', { tldrData: data });

            //Create the label
            $label = $('<span class="tldr-preview-popover-d4a6ebe3" data-tldrid="'+data._id+'">*</span>');
            // Register handler when powertip opens
            $node.on('powerTipPreRender', function() {
              //Ask the background for the latest version of the tldrData
              self.port.emit('PRERENDER_POPOVER', { _id: data._id });
            });

            // Insert label after link
            $node.append($label);
            // Enable powertip
            $node.powerTip(options);
            // Track opening of powertip
            $node.on({ powerTipOpen: function () {
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

        DEVMODE && unsafeWindow.console.log('Wikipedia entries', entries);

        // retrieve the results from the background
        self.port.on('SEND_ENTRIES_FOR_PREVIEW_TO_CONTENT_SCRIPT', function (data) {

          _.each(data, function (result) {
             var entry = _.findWhere(entries, { entry: result.entry })
               , $label
               , previewData = {}
               , node
               , $node
               ;

             $node = $(entry.node);

             previewData.type = 'wikipedia';
             previewData.previewText = result.previewText;
             previewData.title = result.heading;
             previewData.id = utils.guid();
             previewData.url = entry.node.href;

             //chrome.extension.sendMessage({ action: 'STORE_PREVIEW_DATA_IN_BACKGROUND'
                                          //, previewData: previewData
             //});
             self.port.emit('STORE_PREVIEW_DATA_IN_BACKGROUND', { previewData: previewData });

             //Create the label
             $label = $('<span class="tldr-preview-popover-d4a6ebe3" data-previewId="'+previewData.id+'">*</span>');
             // Register handler when powertip opens
             $node.on('powerTipPreRender', function() {
               //chrome.extension.sendMessage({ action: 'PRERENDER_PREVIEW_POPOVER', previewId: previewData.id});
              self.port.emit('PRERENDER_PREVIEW_POPOVER', { previewId: previewData.id });

             });

             // Insert label after link
             $node.append($label);
             // Enable powertip
             $node.powerTip(options);

          });


         });
         self.port.emit('SEND_ENTRIES_FOR_PREVIEW_TO_BACKGROUND', _.uniq(_.pluck(entries, 'entry')));
       });

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

    self.port.on('PRERENDER_PREVIEW_POPOVER', function (data) {
      var iframe = getIframe();
      if (iframe) {
        iframe.contentWindow.postMessage({ action: 'PRERENDER_PREVIEW_POPOVER', previewData: data.previewData} , '*');
      }
    });

    window.addEventListener('message', function (event) {
      var message = event.data
        , $label;
      switch(message.action) {
        case 'CTA_IMPROVE_SUMMARY':
          self.port.emit('CTA_IMPROVE_SUMMARY', message.previewData);
          break;
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

    injectPreviews();
});
