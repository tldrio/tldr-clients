require([ 'devmodeRetroCompatibility'
        , 'lib/environment'
        , 'mixpanel'
        , 'jquery'
        , 'backbone'
        , 'easyXDM'
        , 'lib/mediator'
        , 'lib/query-parser'
        , 'models/shared/tldrModel'
        , 'models/shared/userModel'
        , 'views/iframe/container']
, function(devmodeRetroCompatibility
, env
, mixpanelInit   // Only needed in the entry point as this module defines a global mixpanel object
, $
, Backbone
, easyXDM
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
    , headers: env.BMAPICreds
    });

    mixpanel.tldr_d4a6ebe3.register({ from: 'Bookmarklet' });
    // the replace just fetches the querystring part of the iframe href
    // excluding the question mark (pure query string)
    sourceUrl = queryParser.getQueryParameters(window.location.href.replace(/^.*\?/, '')).url;

    app.MAX_BULLETS = 5;
    app.MAX_BULLET_LENGTH = 160;
    app.MAX_TITLE_LENGTH = 200;
    app.MAX_RESOURCE_AUTHOR_LENGTH = 20;

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

    try {
      app.provider = new easyXDM.Rpc({}, {
        local: { storeScrapedMetadata: function (metadata, success, error) {
                   DEVMODE && console.log('[Iframe Main] received metadata:', metadata);
                   // we store the metadata here so that
                   // it can be used if needed
                   // We trim according to limits so that input is valid
                   if (metadata.title) { metadata.title = metadata.title.substring(0, app.MAX_TITLE_LENGTH);}
                   if (metadata.resourceAuthor) { metadata.resourceAuthor = metadata.resourceAuthor.substring(0, app.MAX_RESOURCE_AUTHOR_LENGTH);}
                   app.trigger('edit', metadata);
                   app.trigger('render');
                 }
               }
      , remote: { closeOverlay: {}
                , konami: {}
                , scrapeMetadata: {}
                , setIframeHeight: {}
                , switchMode: {}
                }
      });
    } catch (e) {
      app.provider = { closeOverlay: function () {}
              , scrapeMetadata: function () {}
              , setIframeHeight: function () {}
              , switchMode: function () {}
              };
    }
    app.tldrModel = new TldrModel({url: sourceUrl});
    app.userModel = new UserModel();
    // Get domain for special case on our domain
    app.containerView = new ContainerView({ model: app.tldrModel, userModel: app.userModel });
    $('#iframe-container').append(app.containerView.$el);

    $(document).keyup(function (e) {
      // Close iframe with escape
      if (e.keyCode === 27) {
        app.provider.closeOverlay();
      }
      // Konami code support
      if ( e.keyCode === konami[state] ){
        state++;
      }
      else {
        // Thank god the konami code makes for a simple automaton we can hack like this
        if (e.keyCode === 38) {
          if (state <= 2) {
            state = 2;
          } else {
            state = 1;
          }
        } else {
          state = 0;
        }
      }
      if ( state === 10 ){
        app.provider.konami();
        state = 0;
      }
    });
    // Prevent automatic closing or reloading of the underlying page
    // This should only be activated in edit mode to prevent understandable frustration
    window.onbeforeunload = function () {
      if (app.containerView.editState) {
        // This message will displayed in Chrome only. In firefox, we can only get the default confirmation dialog
        return "Your tl;dr is not saved yet and you will lose all your work if you leave this page!";
      }
    };

});

