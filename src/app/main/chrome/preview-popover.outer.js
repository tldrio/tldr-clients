require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'underscore'
        , 'lib/blackList'
        , 'lib/addTwitterPreviews'
        , 'lib/addWikipediaPreviews'
        , 'lib/addYoutubePreviews'
        , 'lib/addArticlesPreviews'
        , 'lib/environment'
        , 'lib/utils'
        , 'lib/whitelist'
        , 'clearly'
        , 'chromepowertip'
        ],
function (
  devmodeRetroCompatibility
, $
, _
, blackList
, addTwitterPreviews
, addWikipediaPreviews
, addYoutubePreviews
, addArticlesPreviews
, env
, utils
, whitelist
, clearly
) {

  // Flag to indicate that Chrome should not inject this script twice in the page
  window.tldr_d4a6ebe3_inject_preview_popover = true;

  var options = { mouseOnToPopup: true
                , placement: 'e'
                , smartPlacement: true
                , popupId: 'tldr-popover-d4a6ebe3'
                , iframeId: 'tldr-iframe-popover-d4a6ebe3'
                , iframeSrc: env.baseUrl + '/iframe.popover.html'
                }
    , insertBadge = true
    , checkTldrDb = false
    , selector
    , doPreview = true
    , regexp;

  // We add popover containing tldrs only for whitelisted domains
  whitelist.domainsWhitelist.forEach(function(element) {
    regexp = new RegExp(element.replace(/[.]/g,'[.]').replace(/\*/g, ".*") );
    if (window.location.href.match(regexp)) {
      checkTldrDb = true;
    }
  });

  // Blacklist
  blackList.previewBlackList.forEach(function(element) {
    regexp = new RegExp("^" + element.replace(/[.]/g,'[.]').replace(/\*/g, ".*") + "$");
    if (window.location.href.match(regexp)) {
      doPreview = false;
    }
  });

  if (!doPreview) {
    return;
  }

  switch (window.location.host) {
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
    case env.host:
      selector = null;
      break;
    default:
      selector = 'a[href]';
      insertBadge = false;
  }

  registerListenerForPopoverEvents();
  if (!checkTldrDb) {
    checkAvailablePreviews();
    return;
  } else {
    checkTldrsForLinks(selector);
  }

  function checkTldrsForLinks (selector) {

    var $linksList
      , $nodesList
      , tldrizedNodesHref = []
      , dataToSend
      ;

    $nodesList = $(selector);

    // list of unique links matching the selector
    $linksList = _.uniq(_.pluck($nodesList, 'href'));
    DEVMODE && console.log('[Preview Popover] links', $linksList);

    dataToSend = { batch: $linksList , nolimit: true };
    // Make a batch request
    $.ajax({ url: env.apiUrl + '/tldrs/searchBatch'
           , type: 'POST'
           , dataType: 'json'
           , accepts: 'application/json'
           , contentType: 'application/json'
           , data: JSON.stringify(dataToSend)
           })
      .done(function (data, textStatus, jqXHR) {
        var tldrs = data.tldrs
        // This is the array containing all tldrized urls
          , urls = data.urls
          , normalizedUrl
          , tldrizedUrls = {}
          , requests = data.requests;


        // Create object with url as key and tldr as value
        _.each(tldrs, function (tldr) {
          _.each(tldr.possibleUrls, function(possibleUrl) {
            tldrizedUrls[possibleUrl] = tldr;
          });
        });

        $nodesList.each(function(i, node) {
          normalizedUrl = urls[node.href];
          var $label;
          // See if we have the tl;dr for this node
          // tldrizedUrls contains the normalizedUrls as keys
          if ( _.has(tldrizedUrls, normalizedUrl) ) {
            var data = tldrizedUrls[normalizedUrl]
            //Create the popover div
              , tldrId = data._id
              , $node = $(node)
              ;

            tldrizedNodesHref.push(node.href);
            chrome.extension.sendMessage({ action: 'STORE_TLDR_DATA_IN_BACKGROUND'
                                         , tldrData: data
            });

            if (insertBadge) {
              $label = $('<span class="tldr-label-d4a6ebe3" data-tldrid="'+data._id+'"><a href="'+ env.websiteUrl + '/tldrs/' + data._id + '/' + data.slug +'">tldr</a></span>');
              $label.on('powerTipPreRender', function() {
                chrome.extension.sendMessage({ action: 'PRERENDER_POPOVER', tldrId: tldrId, hostname: document.location.hostname });
              });
              $(node).after($label);
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
            } else {
              //Create the label
              $label = $('<span class="tldr-preview-popover-d4a6ebe3" data-tldrid="'+data._id+'">*</span>');
              // Register handler when powertip opens
              $node.on('powerTipPreRender', function() {
                chrome.extension.sendMessage({ action: 'PRERENDER_POPOVER', tldrId: tldrId});
              });
              // Insert label after link
              $node.append($label);
              // Enable powertip
              $node.powerTip(options);
              // Track opening of powertip
              $node.on({ powerTipOpen: function () {
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

          }
        });
      // Remove nodes that have already a tldr
      $nodesList = _.reject($nodesList, function (node) {
        return _.contains(tldrizedNodesHref, node.href);
      });

      checkAvailablePreviews($nodesList);

      });
  }

  function checkAvailablePreviews ($nodesList) {
    addWikipediaPreviews($nodesList, options);
    if (window.location.hostname !== 'twitter.com') {
      addTwitterPreviews($nodesList, options);
    }
    if (window.location.hostname !== 'youtube.com') {
      addYoutubePreviews($nodesList, options);
    }
    addArticlesPreviews($nodesList, options);
  }

  function registerListenerForPopoverEvents () {
    chrome.extension.onMessage.addListener(function(message, sender, callback) {
      var $node;
      if (message.action === 'SET_POPOVER_HEIGHT') {
        // the hardcoded 22 is for the tips
        $('#tldr-iframe-popover-d4a6ebe3').height(message.height + 22);
        $('#tldr-iframe-popover-d4a6ebe3').width(message.width + 14);
        $('#tldr-popover-d4a6ebe3').height(message.height + 22);
        $('#tldr-popover-d4a6ebe3').width(message.width + 14);
        chrome.extension.sendMessage({ action: 'POSITION_POPOVER' });
      }
      if (message.action === 'SWITCH_POPOVER_IN_EDIT_MODE') {
        $node = $('.tldr-preview-popover-d4a6ebe3[data-tldrid="'+ message.tldrId+'"] , .tldr-label-d4a6ebe3[data-tldrid="'+ message.tldrId+'"]');
        $node.first().data('stayhere', true);
        $('body').one('click', function () {
          $node.first().data('stayhere', false);
        });

      }
    });
  }

});
