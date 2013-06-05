define(['jquery', 'lib/environment'], function($, env) {

  function enableModeration () {
    // Moderate a tldr after having set its distribution and
    // sharing channels
    $('.moderationDone').on('click', function (event) {
      var $button = $(event.currentTarget)
        , $listItem = $button.parent().parent()
        , tldrId = $listItem.data('tldr-id')
        , $checkBoxes = $listItem.find('input[type="checkbox"]')
        , $channels = $listItem.find('input[kind="channel"]')
        , $sharing = $listItem.find('input[kind="sharing"]')
        , i, newDistributionChannels = {}, profile_ids = []
        ;

      // Update distribution channels
      for (i = 0; i < $channels.length; i += 1) {
        newDistributionChannels[$($channels[i]).attr('channel')] = $($channels[i]).attr('checked') ? true : false;
      }
      $.ajax({ url: env.apiUrl + '/tldrs/' + tldrId + '/distribution-channels'
             , data: newDistributionChannels
             , type: 'PUT'
             })
       .done(function () {});

      // Share through Buffer
      for (i = 0; i < $sharing.length; i += 1) {
        if ($($sharing[i]).attr('checked')) {
          profile_ids.push($($sharing[i]).attr('bufferid'));
        }
      }
      $.ajax({ url: env.apiUrl + '/tldrs/' + tldrId + '/sharing-buffer'
             , data: { profile_ids: profile_ids }
             , type: 'PUT'
             })
       .done(function () {});

      // Remove from DOM now and mark as moderated
      $listItem.remove();
      $.ajax({ url: env.apiUrl + '/tldrs/' + tldrId + '/moderate'
             , type: 'GET'
             })
      .done(function() {});
    });


    // Delete a tldr
    $('.deleteTldr').on('click', function (event) {
      var $button = $(event.currentTarget)
        , $listItem = $button.parent().parent()
        , tldrId = $listItem.data('tldr-id')
        , doit = confirm("Are you really sure you want to delete this tldr?")
        ;

      if (doit) {
        $listItem.remove();
        $.ajax({ url: env.apiUrl + '/tldrs/' + tldrId + '/delete'
               , type: 'GET'
               })
        .done(function() {});
      }
    });


    // Stop distributing the tldr on all channels but don't mark it
    // as moderated yet
    $('.blockTldr').on('click', function (event) {
      var $button = $(event.currentTarget)
        , $listItem = $button.parent().parent()
        , tldrId = $listItem.data('tldr-id')
        , $channels = $listItem.find('input[kind="channel"]')
        , i, newDistributionChannels = {}
        ;

      // Update distribution channels
      for (i = 0; i < $channels.length; i += 1) {
        newDistributionChannels[$($channels[i]).attr('channel')] = false;
        $($channels[i]).removeAttr('checked');
      }
      $.ajax({ url: env.apiUrl + '/tldrs/' + tldrId + '/distribution-channels'
             , data: newDistributionChannels
             , type: 'PUT'
             })
       .done(function () {});
    });
  }

  return enableModeration;
});

