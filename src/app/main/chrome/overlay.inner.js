require([ 'devmodeRetroCompatibility'
        , 'lib/environment'
        , 'mixpanel'
        , 'jquery'
        , 'underscore'
        , 'backbone'
        , 'lib/mediator'
        , 'lib/query-parser'
        , 'models/shared/tldrModel'
        , 'models/shared/userModel'
        , 'views/iframe/container']
, function(devmodeRetroCompatibility
, env
, mixpanelInit   // Only needed in the entry point as this module defines a global mixpanel object
, $
, _
, Backbone
, app
, queryParser
, TldrModel
, UserModel
, ContainerView) {
    var sourceUrl
      , domain
      , state = 0
      , konami = [38,38,40,40,37,39,37,39,66,65]
      , head = document.getElementsByTagName('head')[0]
      , link = document.createElement('link');

    // send withcredentials header for every request
    $.ajaxSetup({
      xhrFields: { withCredentials: true }
    , headers: env.chromeExtensionAPICreds
    });

    mixpanel.tldr_d4a6ebe3.register({ from: 'Chrome Extension' });

    // the replace just fetches the querystring part of the iframe href
    // excluding the question mark (pure query string)
    sourceUrl = queryParser.getQueryParameters(window.location.href.replace(/^.*\?/, '')).url;


    (function() {
      var previousHeight = $('body').height();
      window.setInterval(function (argument) {
        var currentHeight = $('body').height();
        if (currentHeight !== previousHeight) {
          previousHeight = currentHeight;
          DEVMODE && console.log('[Iframe Main] Setting iframe height to', currentHeight);
          app.provider.setIframeHeight(currentHeight, function () {}, function () {});
        }
      }, 20);
    }());

    app.provider = { closeOverlay: function () {
              chrome.extension.sendMessage({ action: 'CLOSE_IFRAME'});
            }
            , saveSuccess: function () {
              chrome.extension.sendMessage({ action: 'TLDR_SAVED'});
            }
            , scrapeMetadata: function () {
              chrome.extension.sendMessage({ action: 'SCRAPE_METADATA'});
            }
            , setIframeHeight: function (height) {
              chrome.extension.sendMessage({ action: 'SET_IFRAME_HEIGHT', height: height });
            }
            , switchMode: function (mode) {
              chrome.extension.sendMessage({ action: 'SWITCH_IFRAME_MODE', mode: mode });
            }
            };

    chrome.extension.sendMessage({ action: 'GET_TLDR_DATA_FOR_IFRAME'}, function(data) {
      app.tldrModel = new TldrModel({url: sourceUrl});
      app.userModel = new UserModel();
      if (data && data.easterEgg) {
        var $easterContainer = $('<img>').attr('src', chrome.extension.getURL(data.easterEgg))
                                         .addClass('easter-img');
        $('#iframe-container').append($easterContainer);
        return;
      }
      if (data) {
        app.tldrModel.set(data);
      }
      // Get domain for special case on our domain
      app.containerView = new ContainerView({ model: app.tldrModel, userModel: app.userModel });
      $('#iframe-container').append(app.containerView.$el);

      setTimeout(function() {
        chrome.extension.sendMessage({ action: 'INIT_DONE'});
      }, 60);

    });
    app.on('saveSuccess', app.provider.saveSuccess);

    chrome.extension.onMessage.addListener(function (message, sender, callback) {
      if (message.action === 'STORE_METADATA') {
        var metadata = message.metadata;
        // we store the metadata here so that
        // it can be used if needed
        // We trim according to limits so that input is valid
        if (metadata.title) { metadata.title = metadata.title.substring(0, app.MAX_TITLE_LENGTH);}
        if (metadata.resourceAuthor) { metadata.resourceAuthor = metadata.resourceAuthor.substring(0, app.MAX_RESOURCE_AUTHOR_LENGTH);}
        app.trigger('edit', metadata);
        app.trigger('render');
      }
      if (message.action === 'ONBOARDING_CONTRIBUTION_SHOWN') {
        app.trigger('onboardingContribution');
      }
      if (message.action === 'TOGGLE_TLDR') {
        app.trigger('toggleTldr');
      }
      if (message.action === 'SYNC_USER_DATA') {
        if (_.keys(message.data).length > 0) {
          app.userModel.set(message.data);
        } else {
          app.userModel.clear();
        }
      }
    });

    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = chrome.extension.getURL('assets/css/overlay.inner.css');
    head.appendChild(link);
});
