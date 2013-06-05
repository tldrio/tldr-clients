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

  function addYoutubePreviews ($nodesList, options) {
    var $twitterNodes
      , entries
      , $linksList
      ;

    $nodesList = $('a[href*="youtube.com"]').add($nodesList);

    entries = _.map($nodesList, function(node) {
      var href = node.href || node.src
        , matches
        , entry
        , result
        ;

        matches = href.match(/youtube.com\/watch\?v=([A-Za-z0-9\-]{1,15}$)/);
        if (matches) {
          result = { node: node , entry: matches ? matches[1] : null};
          return result;
        }
        result = { node: node };
        return result;
    });
    // filter null values
    entries = _.filter(entries, function(entry) { return entry.entry && entry.entry.length;});

    DEVMODE && console.log('[Preview Popover] Youtube nodes length', entries.length, $nodesList.length);
    if (!entries.length) {
      return; // there is no link to search a tldr for
    }
    $.ajax({ url: env.proxyBaseUrl + '/youtube'
           , type: 'POST'
           , dataType: 'json'
           , accepts: 'application/json'
           , contentType: 'application/json'
           , data: JSON.stringify({ batch: _.uniq(_.pluck(entries, 'entry'))})
    }).done( function (data, textStatus, jqXHR) {
      _.each(data, function (result) {
        var entry = _.findWhere(entries, { entry: result.entry })
          , $label
          , previewData = {}
          , $node = $(entry.node)
          ;

         previewData.type = 'youtube';
         previewData.data = result.result;
         previewData.title = result.entry;
         previewData.id = utils.guid();
         previewData.url = entry.node.href;

         chrome.extension.sendMessage({ action: 'STORE_PREVIEW_DATA_IN_BACKGROUND'
                                      , previewData: previewData
         });

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

  }
  return addYoutubePreviews;
});
