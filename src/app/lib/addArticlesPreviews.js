/*
 * Powertip View
 *
 */

define(
[ 'jquery'
, 'underscore'
, 'lib/environment'
, 'lib/utils'
, 'lib/whitelist'
, 'chromepowertip'
],
function
( $
, _
, env
, utils
, whitelist
) {

  function addArticlesPreviews ($nodesList, options) {
    var $twitterNodes
      , entries
      , $linksList
      ;

    $nodesList = $('a[href]').add($nodesList);

    entries = _.map($nodesList, function(node) {
      var href = node.href || node.src
        , matches
        , entry
        , result
        ;

        matches = _.contains(whitelist.previewWhitelist, node.hostname);
        if (matches) {
          result = { node: node , entry: href};
          return result;
        }
        result = { node: node };
        return result;
    });
    // filter null values
    entries = _.filter(entries, function(entry) { return entry.entry && entry.entry.length;});

    DEVMODE && console.log('[Preview Popover] Articles nodes length', entries.length, $nodesList.length);
    if (!entries.length) {
      return; // there is no link to search a tldr for
    }
    $.ajax({ url: env.proxyBaseUrl + '/articles'
           , type: 'POST'
           , dataType: 'json'
           , accepts: 'application/json'
           , contentType: 'application/json'
           , data: JSON.stringify({ batch: _.uniq(_.pluck(entries, 'entry'))})
    }).done( function (data, textStatus, jqXHR) {
      _.each(data, function (result) {
        var entry = _.find(entries, function (entry) { return _.contains(result.urls, entry.entry); })
          , $label
          , previewData = _.clone(result)
          , $node = $(entry.node)
          ;

         previewData.type = 'article';
         previewData.id = utils.guid();

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
  return addArticlesPreviews;
});
