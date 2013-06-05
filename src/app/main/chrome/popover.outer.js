require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'underscore'
        , 'lib/environment'
        , 'chromepowertip'
        ],
function (
  devmodeRetroCompatibility
, $
, _
, env
) {

  // Make sure we do the injection just once
  // as the cb in background is triggered even when
  // the page is not reloaded
  if (window.tldr_d4a6ebe3_inject_popover) {
    return;
  }
  window.tldr_d4a6ebe3_inject_popover = true;

  function attachTldrBadges () {
    var hostname = window.location.hostname
      , selector
      ;

    switch (hostname) {
      case 'twitter.com':
        selector = 'a.twitter-timeline-link';
        break;
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
      registerListenerForPopoverEvents();
      injectBadges(selector);
    }
  }


  function injectBadges (selector) {
    var $linksList
      , $nodesList
      , expandedUrls = {}
      , i
      ;

    $nodesList = $(selector);
    // list of unique links matching the selector
    $linksList = _.uniq(_.pluck($nodesList, 'href'));
    DEVMODE && console.log('links', $linksList);

    // Also get the expanded (i.e. non minified) urls so that the same tldr can
    // be displayed for the same content even though the URL is not the same
    for (i = 0; i < $nodesList.length; i += 1) {
      expandedUrls[$($nodesList[i]).attr('href')] = $($nodesList[i]).data('expanded-url');
    }

    // Make a batch request
    $.ajax({ url: env.apiUrl + '/tldrs/searchBatch'
           , type: 'POST'
           , dataType: 'json'
           , accepts: 'application/json'
           , contentType: 'application/json'
           , data: JSON.stringify({ batch: $linksList, expandedUrls: expandedUrls })
           })
      .done(function (data, textStatus, jqXHR) {
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
              , $iframe
              , $div
              , tldrId = data._id
              , options = { mouseOnToPopup: true
                           , placement: 'e'
                           , smartPlacement: true
                           , popupId: 'tldr-popover-d4a6ebe3'
                           , iframeId: 'tldr-iframe-popover-d4a6ebe3'
                           , iframeSrc: env.baseUrl + '/iframe.popover.html'
                           }
              ;

            chrome.extension.sendMessage({ action: 'STORE_TLDR_DATA_IN_BACKGROUND'
                                         , tldrData: data
            });

            //Create the label
            $label = $('<span class="tldr-label-d4a6ebe3" data-tldrid="'+data._id+'"><a href="'+ env.websiteUrl + '/tldrs/' + data._id + '/' + data.slug +'">tldr</a></span>');
            // Register handler when powertip opens
            $label.on('powerTipPreRender', function() {
              chrome.extension.sendMessage({ action: 'PRERENDER_POPOVER', tldrId: tldrId});

            });

            // Insert label after link
            $(node).after($label);
            // Enable powertip
            $label.powerTip(options);
            // Track opening of powertip
            $label.on({ powerTipOpen: function () {
                          DEVMODE && console.log('[CRX] powertip opened');
                          // Send request to increment readCount
                          $.ajax({ url: env.apiUrl + '/tldrs/'+ tldrId
                                 , type: 'PUT'
                                 , dataType: 'json'
                                 , accepts: 'application/json'
                                 , contentType: 'application/json'
                                 , data: JSON.stringify({ incrementReadCount: 1 })
                                 });

                          // Send message to background.js to initiate Mixpanel tracking
                          chrome.extension.sendMessage({ action: 'TRACK_HOVER'
                                                       , url: node.href
                                                       , referrer: window.location.hostname
                                                       });
                        }
                      });
          }
        });
      });
    }


    function registerListenerForPopoverEvents () {
      chrome.extension.onMessage.addListener(function(message, sender, callback) {
        var $label;
        if (message.action === 'SET_POPOVER_HEIGHT') {
          //DEVMODE && console.log('setting poppover height', message.height);
          // the hardcoded 22 is for the tips
          $('#tldr-iframe-popover-d4a6ebe3').height(message.height + 22);
          chrome.extension.sendMessage({ action: 'POSITION_POPOVER' });
        }
        if (message.action === 'SWITCH_POPOVER_IN_EDIT_MODE') {
          $label = $('.tldr-label-d4a6ebe3[data-tldrid="'+ message.tldrId+'"]');
          $label.first().data('stayhere', true);
          $('body').one('click', function () {
            $label.first().data('stayhere', false);
          });

        }
        if (message.action === 'CTA_IMPROVE_SUMMARY') {
          chrome.extension.sendMessage(message);
        }
      });
    }

    attachTldrBadges();
});
