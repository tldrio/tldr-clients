require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'lib/environment'
        , 'lib/utils'
        ],
function (
  devmodeRetroCompatibility
, $
, env
, utils
) {
  var $blockquotes = $('blockquote.tldr-embed-widget')   // Only get blockquote elements to avoid trying to transform embeds that are already iframes
    , i, IEversion
    ;

  // Execute the script only once, even if it is called multiple times
  if (window.tldr_a4e7bf6791) {
    return;
  } else {
    window.tldr_a4e7bf6791 = true;
  }

  // Don't try to load the new version for IE 8-
  if ($.browser.msie) {
    IEversion = $.browser.version.replace(/^([0-9]+)\..+$/, '$1');
    IEversion = parseInt(IEversion, 10);
    if (IEversion <= 7) { return; }
  }

  utils.loadCssFile(env.embedBaseUrl + '/embed/assets/css/widget.embed.outer.css');

  // Get a boolean parameter. Defaults to false if parameter is not set
  function getBooleanParameter ($elt, param) {
    var res;

    try {
      res = $elt.data(param).toString() === 'true' ? true : false;
    } catch (e) {
      res = false;
    }

    return res;
  }

  /**
   * Given a jquery blockquote element representing the default embed, transform it into the nice iframe embed
   */
  function replaceBlockquoteByIframe ($blockquote) {
    var tldrId = $blockquote.data('tldr-id')
      , url = $blockquote.data('url')
      , showTitle = getBooleanParameter($blockquote, 'show-title')
      , useOwnTldr = getBooleanParameter($blockquote, 'use-own-tldr')
      , iframeId = utils.guid()
      , matches, $iframe, link, src
      , currentUrlSanitized = window.location.href
      ;

    // Retrocompatibility method for getting the tldr id
    if (!useOwnTldr && !tldrId && !url) {
      try {
        link = $blockquote.find('a.link-to-tldr-page').attr('href');
        matches = link.match(/\/tldrs\/([a-f0-9]{24})/);
        tldrId = matches[1];
      } catch (e) {
        return;
      }
    }

    // Finish preparing the arguments
    if (url === 'own' || url === 'this page' || url === 'thispage') {
      useOwnTldr = true;
    }

    // Sanitize the current url by removing its hash (or the server wont understand
    // the request as part of the querystring will be missing)
    if (window.location.hash) {
      currentUrlSanitized = window.location.href.replace(window.location.hash, '');
    }

    // This blockquote shouldn't be transformed in an iframe by another script anymore
    $blockquote.removeClass('tldr-embed-widget');

    // Give him the iframeId to be able to query and remove it upon a successful loading of the iframe
    $blockquote.attr('id', 'tldr-embed-' + iframeId);

    // Prepare the iframe
    // Priority order is own tldr if requested -> tldr id -> tldr url
    src = env.embedBaseUrl + '/tldrs/embed';
    src += '?showTitle=' + showTitle;
    src += '&iframeId=' + iframeId;
    src += '&pageUrl=' + currentUrlSanitized;

    // No need to sanitize url because if it is used, it will be the last parameter in the querystring
    // so even if there is a hash it won't mess everything up
    if (useOwnTldr || (!tldrId && !url)) {
      src += '&url=' + window.location.href;
    } else if (tldrId) {
      src += '&tldrId=' + tldrId;
    } else {
      src += '&url=' + url;
    }

    $iframe = $('<iframe frameBorder="0" style="visibility: hidden;"></iframe>')
              .attr('id', 'tldr-embed-' + iframeId)
              .attr('src', src)
              .attr('scrolling', 'no')
              .addClass('tldr-embed-widget');

    // Set height to 0 to avoid ugly effect while loading
    $iframe.height('0px');
    $iframe.css('max-width', '500px');
    $iframe.css('position', 'absolute');

    // Replace blockquote by iframe. The iframe will display only if we receive the message with its height, meaning it loaded correctly
    $blockquote.before($iframe);
  }

  // Transform all default embeds in iframe embeds
  // Some Wordpress blogs may put the script in the <head> element so we need to use $.ready
  $(document).ready(function () {
    for (i = 0; i < $blockquotes.length; i += 1) {
      replaceBlockquoteByIframe($($blockquotes[i]));
    }
  });

  //Register events for all embed iframes
  $(window).on('message onmessage', function(e) {
    // This is not our events!
      if (e.originalEvent.origin !== env.embedBaseUrl) {
        return;
      }

      var data = JSON.parse(e.originalEvent.data)
        , height
        , $iframe = $('iframe#tldr-embed-' + data.iframeId)
        , $blockquote = $('blockquote#tldr-embed-' + data.iframeId)
        ;

      if (data.action === 'SET_HEIGHT') {
        $iframe.height(data.height);
        $iframe.css('visibility', 'visible');
        $iframe.css('position', 'relative');
        $blockquote.remove();
      }
  });
});

