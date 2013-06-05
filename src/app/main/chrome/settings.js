require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'underscore'
        , 'lib/blackList'
        ],
function (
  devmodeRetroCompatibility
, $
, _
, globalBlackList
) {

  function showSettings () {
    var disableCheck = JSON.parse(localStorage['tldr-d4a6ebe3-disableCheck'] || false)
      , blackList = JSON.parse(localStorage['tldr-d4a6ebe3-blackList']|| '[]')
      , disableEmbed = JSON.parse(localStorage['tldr-d4a6ebe3-disableEmbed'] || false)
      , disablePreview = JSON.parse(localStorage['tldr-d4a6ebe3-disablePreview'] || false);

    blackList = _.union(blackList, globalBlackList.tldrCheckBlackList);
    $('#textarea-excluded-urls').val(blackList.join('\n'));
    if (disableCheck) {
      $('#disable-check').attr('checked','checked');
    }
    if (disableEmbed) {
      $('#disable-embed').attr('checked','checked');
    }
    if (disablePreview) {
      $('#disable-preview').attr('checked','checked');
    }
  }

  function saveSettings () {
    var disableCheck = $('#disable-check').is(':checked')
      , blackList = $('#textarea-excluded-urls').val()
      , disableEmbed = $('#disable-embed').is(':checked')
      , disablePreview = $('#disable-preview').is(':checked');

    blackList = blackList.replace(/^[\r\n\s\t]+|[\r\n\s\t]+$/g, "").split('\n');
    localStorage['tldr-d4a6ebe3-disableCheck'] = disableCheck;
    localStorage['tldr-d4a6ebe3-disableEmbed'] = disableEmbed;
    localStorage['tldr-d4a6ebe3-disablePreview'] = disablePreview;
    localStorage['tldr-d4a6ebe3-blackList'] = JSON.stringify(_.difference(blackList,globalBlackList.tldrCheckBlackList));
  }

  showSettings();
  $('#save-settings').on('click', function (event) {
    saveSettings();
    $('.alert-success').show();
  });

  $('.close').on('click', function (event) {
    $('.alert-success').hide();
  });

});
