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


  function addWikipediaPreviews ($nodesList, options) {
    var $wikipediaNodes
      , entries
      , $linksList
      ;

    $nodesList = $nodesList || $('a[href]');
    $wikipediaNodes = _.filter($nodesList, function (node) {
      return node.href.match('wikipedia.org/wiki/');
    });
    DEVMODE && console.log('[Preview Popover] Wiki nodes length', $wikipediaNodes.length, $nodesList.length);

    entries = _.map($wikipediaNodes, function(node) {
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
        entry = entry.toLowerCase();
        result.entry = entry;
        return result;
      } else {
        result.entry = null;
        return result;
      }
    });
    // filter null values
    entries = _.filter(entries, function(entry) { return entry.entry && entry.entry.length;});

    if (!entries.length) {
      return; // there is no link to search a tldr for
    }
    $.ajax({ url: env.proxyBaseUrl + '/duckduckgo'
           , type: 'POST'
           , dataType: 'json'
           , accepts: 'application/json'
           , contentType: 'application/json'
           , data: JSON.stringify({ batch: _.uniq(_.pluck(entries, 'entry'))})
    }).done( function (data, textStatus, jqXHR) {
      _.each(data, function (result) {
        var matches = _.where(entries, { entry: result.entry_lowercase })
          , previewData = {}
          , $label;

           previewData.type = 'wikipedia';
           previewData.previewText = result.previewText;
           previewData.title = result.heading;
           previewData.id = utils.guid();

           chrome.extension.sendMessage({ action: 'STORE_PREVIEW_DATA_IN_BACKGROUND'
                                        , previewData: previewData
           });
           //Create the label
           $label = $('<span class="tldr-preview-popover-d4a6ebe3" data-previewId="'+previewData.id+'">*</span>');

        _.each(matches, function(entry) {
             var $node = $(entry.node) ;

           previewData.url = entry.node.href;

           // Register handler when powertip opens
           $node.on('powerTipPreRender', function() {
             chrome.extension.sendMessage({ action: 'PRERENDER_PREVIEW_POPOVER', previewId: previewData.id});
           });

           if (!window.location.host.match(/wikipedia.org/)) {
             // Insert label after link
             $node.append($label);
           }
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

  return addWikipediaPreviews;
});
