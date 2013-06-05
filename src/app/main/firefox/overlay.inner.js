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
      , initDone = false;

    // send withcredentials header for every request
    $.ajaxSetup({
      xhrFields: { withCredentials: true }
    , headers: env.firefoxExtensionAPICreds
    });

    mixpanel.tldr_d4a6ebe3.register({ from: 'Firefox Extension' });

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
          if (!initDone && currentHeight >= 60 ) {
            window.parent.postMessage({ action: 'INIT_DONE'},'*');
            initDone = true;
          }
        }
      }, 20);
    }());

    app.provider = { closeOverlay: function () {
              window.parent.postMessage({ action: 'CLOSE_IFRAME'},'*');
            }
            , saveSuccess: function () {
              window.parent.postMessage({ action: 'TLDR_SAVED', data: app.tldrModel.attributes},'*');
            }
            , scrapeMetadata: function () {
              window.parent.postMessage({ action: 'SCRAPE_METADATA'},'*');
            }
            , setIframeHeight: function (height) {
              window.parent.postMessage({ action: 'SET_IFRAME_HEIGHT', height: height },'*');
            }
            , switchMode: function (mode) {
              window.parent.postMessage({ action: 'SWITCH_IFRAME_MODE', mode: mode },'*');
            }
            };
    app.on('saveSuccess', app.provider.saveSuccess);


    window.addEventListener('message', function (event) {
      var message = event.data
        , tldrData
        , mixpanelData;

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
      if (message.action === 'SHOW_OVERLAY') {
          mixpanelData = { url: message.url
                         , timeStamp: (new Date()).toISOString()
                         , channel: 'Overlay'
                         };

          if (app.tldrModel.isNew()) {
            mixpanel.tldr_d4a6ebe3.track('[TldrCreate]', mixpanelData);
          } else {
            $.ajax({ url: env.apiUrl + '/tldrs/'+ app.tldrModel.get('_id')
                   , type: 'PUT'
                   , dataType: 'json'
                   , accepts: 'application/json'
                   , contentType: 'application/json'
                   , data: JSON.stringify({ incrementReadCount: 1 })
                   });
            mixpanel.tldr_d4a6ebe3.track('[TldrRead]', mixpanelData);
            mixpanel.tldr_d4a6ebe3.people.increment({ 'readCount': 1
                                                    , 'readViaCRX': 1
                                                    , "readWithOverlay": 1
                                                    , 'readsSinceLastContribution': 1
            });
          }
      }
      if (message.action === 'GET_TLDR_DATA_FOR_IFRAME') {
        tldrData = message.tldrData;

        app.tldrModel = new TldrModel({url: sourceUrl});
        app.userModel = new UserModel();
        if (tldrData && tldrData.easterEgg) {
          var $easterContainer = $('<img>').attr('src', env.extensionBaseUrl + tldrData.easterEgg)
                                           .addClass('easter-img');
          $('#iframe-container').append($easterContainer);
          return;
        }
        if (tldrData) {
          app.tldrModel.set(tldrData);
        }
        // Get domain for special case on our domain
        app.containerView = new ContainerView({ model: app.tldrModel, userModel: app.userModel });
        $('#iframe-container').append(app.containerView.$el);


      }
    });

    //Ask for the data
    window.parent.postMessage({ action: 'GET_TLDR_DATA_FOR_IFRAME'},'*');

});

