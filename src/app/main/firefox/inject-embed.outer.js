require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'Mustache'
        , 'underscore'
        , 'lib/blackList'
        , 'lib/environment'
        , 'lib/utils'
        , 'firefoxpowertip'
        ],
function (
  devmodeRetroCompatibility
, $
, Mustache
, _
, globalBlackList
, env
, utils
, template
) {


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
        if (!$node.length) {
          $node = $('.menuarea');
        }
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

    //Inject css
    utils.loadCssFile(env.extensionBaseUrl + '/assets/css/inject-embed.outer.css');

    // Ask BG to fetch the data
    self.port.emit('FETCH_EMBED_DATA', {url: url });

    // Dont wait for Background response. "normally" the GET_EMBED_DATA will occur after SET
    $rowToInject.find('iframe').attr('src', env.extensionBaseUrl + '/embed.firefox.html?url=' + encodeURIComponent(url) +
                                     '&title=' + encodeURIComponent(title) +
                                     '&hostname=' + encodeURIComponent(hostnameSpecificClass))
                               .attr('scrolling', 'no')
                               .attr('frameBorder', '0')
                               .attr('id', 'tldr-d4a6ebe3-embed')
                               .addClass(hostnameSpecificClass)
                               .height('0px');
    $node.after($rowToInject);
  }

  function getIframe() {
    return $('#tldr-d4a6ebe3-embed')[0] ;
  }

  if ($('#tldr-d4a6ebe3-embed').length === 0) {
    unsafeWindow.console.log("REGISTER EVENTS");
    window.addEventListener('message', function (event) {
      var message = event.data;
      switch(message.action) {
        case 'SET_IFRAME_EMBED_HEIGHT':
          $('#tldr-d4a6ebe3-embed').height(message.height);
          break;
        case 'DISMISS_IFRAME_EMBED':
          $('#tldr-d4a6ebe3-embed').remove();
          break;
        case 'GET_EMBED_DATA':
          self.port.emit('GET_EMBED_DATA');
          break;
        case 'SYNC_USER_DATA':
          self.port.emit('SYNC_USER_DATA', message.data);
          break;
      }
    });

    self.port.on('GET_EMBED_DATA', function (data) {
      $('#tldr-d4a6ebe3-embed')[0].contentWindow.postMessage({ action: 'GET_EMBED_DATA', data: data }, '*');
    });

    self.port.on('SYNC_USER_DATA', function (data) {
      var iframe = getIframe();
      if (iframe) {
        iframe.contentWindow.postMessage({ action: 'SYNC_USER_DATA', data: data }, '*');
      }
    });

    injectEmbed();
  }

});
