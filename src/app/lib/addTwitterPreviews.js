/*
 * Powertip View
 *
 */

define(
[ 'jquery'
, 'underscore'
, 'lib/environment'
, 'lib/utils'
, 'chromepowertip'
],
function
( $
, _
, env
, utils
) {


  function addTwitterPreviews ($nodesList, options) {
    var $twitterNodes
      , entries
      , $linksList
      ;

    $nodesList = $('a[href], iframe[src*="twitter.com"]').add($nodesList);

    entries = _.map($nodesList, function(node) {
      var href = node.href || node.src
        , matches
        , entry
        , result
        ;

        matches = href.match(/twitter\.com\/(#!\/)?([A-Za-z0-9_]{1,15})\/?$/);
        if (matches) {
          result = { node: node , entry: matches ? matches[2].toLowerCase() : null};
          return result;
        }
        matches = href.match(/twitter\.com\/widgets\/follow_button.*(\?|&)screen_name=([A-Za-z0-9_]{1,15})/);
        if (matches) {
          result = { node: node , entry: matches ? matches[2].toLowerCase() : null};
          return result;
        }
        result = { node: node };
        return result;
    });
    // filter null values
    entries = _.filter(entries, function(entry) { return entry.entry && entry.entry.length;});

    DEVMODE && console.log('[Preview Popover] Twitter nodes length', entries.length, $nodesList.length);
    if (!entries.length) {
      return; // there is no link to search a tldr for
    }
    $.ajax({ url: env.proxyBaseUrl + '/twitter'
           , type: 'POST'
           , dataType: 'json'
           , accepts: 'application/json'
           , contentType: 'application/json'
           , data: JSON.stringify({ batch: _.uniq(_.pluck(entries, 'entry'))})
    }).done( function (data, textStatus, jqXHR) {
      _.each(data, function (result) {
        var matches = _.where(entries, { entry: result.entry.toLowerCase() })
          , $label
          , previewData = {};

         previewData.type = 'twitter';
         previewData.data = result.result;
         previewData.title = result.entry;
         previewData.id = utils.guid();

         chrome.extension.sendMessage({ action: 'STORE_PREVIEW_DATA_IN_BACKGROUND'
                                      , previewData: previewData
         });

        _.each(matches, function(entry) {
             var $node = $(entry.node) ;

         previewData.url = entry.node.href;

         // Register handler when powertip opens
         $node.on('powerTipPreRender', function() {
           chrome.extension.sendMessage({ action: 'PRERENDER_PREVIEW_POPOVER', previewId: previewData.id});

         });

         // Enable powertip
         $node.powerTip(options);
         $node.on({ powerTipOpen: function () {
                       // Send message to background.js to initiate Mixpanel tracking
                       chrome.extension.sendMessage({ action: 'TRACK_PREVIEW'
                                                    , entry: previewData.title
                                                    , type: previewData.type
                                                    , referrer: window.location.hostname
                                                    });
                     }
                   });

        });
      });
    });

  }

  return addTwitterPreviews;
});
