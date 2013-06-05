/*
 * Powertip View
 *
 */

define(
[ 'jquery'
, 'lib/environment'
, 'powertip'
],
function
( $
, env
) {


  function attachPowertips (opts) {
    DEVMODE && console.log('[Powertips] Attaching Powertips ');
    var $labels
      , options = { mouseOnToPopup: true
                  , placement: 'e'
                  , smartPlacement: true
                  , popupId: 'tldr-popover-d4a6ebe3'
                  }
      , from = opts.from || ''   // Leave empty and no MP event will be sent
      ;

    $labels = $('.tldr-label-d4a6ebe3');
    $labels.each(function () {
      var $label = $(this)
        , powertipId = $label.data('powertip-id')
        ;
      // Attach the label to the corresponding tl;dr powertip
      $label.data('powertiptarget', powertipId);
      $label.powerTip(options);
      $label.on({ powerTipOpen: function () {
                                  DEVMODE && console.log('[PowertipView] powertip opened');
                                  if (from !== '') { mixpanel.tldr_d4a6ebe3.track('[TldrRead]', { from: from }); }
                                  // Get the id of the displayed tldr
                                  var id = $(this).data('tldr-id');
                                  if (id) {
                                    // Send request to increment readCount
                                    $.ajax({ url: env.apiUrl + '/tldrs/'+ id
                                           , type: 'PUT'
                                           , dataType: 'json'
                                           , accepts: 'application/json'
                                           , contentType: 'application/json'
                                           , data: JSON.stringify({ incrementReadCount: 1 })
                                           });
                                  }
                                  $('body').trigger('tldr-powertip-open');
                                  mixpanel.tldr_d4a6ebe3.people.increment({ "readCount": 1
                                                                          , "readViaWebsite": 1
                                                                          , "readsSinceLastContribution": 1
                                                                          });

                                }
                });
    });
  }

  return attachPowertips;
});
