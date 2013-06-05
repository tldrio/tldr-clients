require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'Mustache'
        , 'underscore'
        , 'lib/blackList'
        , 'lib/environment'
        , 'chromepowertip'
        ],
function (
  devmodeRetroCompatibility
, $
, Mustache
, _
, globalBlackList
, env
, template
) {


  // Flag to indicate that Chrome should not inject this script twice in the page
  window.tldr_d4a6ebe3_inject_embed = true;

  function injectEmbed () {
    var hostname = window.location.hostname
      , $title
      , $rowToInject
      , $node
      , url
      , embedTldr = true
      , title
      , blackList
      , regexp
      , hostnameSpecificClass
      ;

    switch (hostname) {
      case 'news.ycombinator.com':
        $title = $('.title > a');
        $rowToInject = $('<tr><td></td><td><iframe></iframe></td></tr>');
        $node = $($('form[method~=post]').parents('tbody')[0]);
        url = $title[0].href;
        title = $title.html();
        hostnameSpecificClass = 'hacker-news';
        break;
      case 'www.reddit.com':
        $title = $('.title > a');
        $rowToInject = $('<div><iframe></iframe></div>');
        $node = $('.usertext.cloneable');
        url = $title[0].href;
        title = $title.html();
        hostnameSpecificClass = 'reddit';
        break;
    }

      blackList = _.union(globalBlackList.tldrCheckBlackList, globalBlackList.pornList);

      blackList.forEach(function(element) {
        regexp = new RegExp("^" + element.replace(/[.]/g,'[.]').replace(/\*/g, ".*") + "$");
        if (url.match(regexp)) {
          embedTldr = false;
        }
      });

    if (!embedTldr) {
      return;
    }


    // Search batch request to avoid readcount being incremented
    $.ajax({ url: env.apiUrl + '/tldrs/searchBatch'
           , type: 'POST'
           , dataType: 'json'
           , accepts: 'application/json'
           , contentType: 'application/json'
           , data: JSON.stringify({ batch: [url] })
           })
      .done(function (data) {
        chrome.extension.sendMessage({ action: 'SET_EMBED_DATA'
                                     , data: data.tldrs[0]
        });
      }, function () {
      // Dont wait for Background response. "normally" the GET_EMBED_DATA will occur after SET
      $rowToInject.find('iframe').attr('src', env.baseUrl + '/iframe.embed.html?url=' + encodeURIComponent(url) +
                                       '&title=' + encodeURIComponent(title) +
                                       '&hostname=' + encodeURIComponent(hostnameSpecificClass))
                                 .attr('scrolling', 'no')
                                 .attr('id', 'tldr-d4a6ebe3-embed')
                                 .addClass(hostnameSpecificClass);
      $node.after($rowToInject);
      });
  }

  if ($('#tldr-d4a6ebe3-embed').length === 0) {
    chrome.extension.onMessage.addListener(function(message, sender, callback) {
      switch(message.action) {
        case 'SET_IFRAME_EMBED_HEIGHT':
          $('#tldr-d4a6ebe3-embed').height(message.height);
          break;
        case 'DISMISS_IFRAME_EMBED':
          $('#tldr-d4a6ebe3-embed').remove();
          break;

      }
    });
    injectEmbed();
  }

});
