require([ 'devmodeRetroCompatibility'
        , 'lib/environment'
        , 'mixpanel'
        , 'jquery'
        , 'underscore'
        , 'lib/mediator'
        , 'lib/query-parser'
        , 'models/shared/tldrModel'
        , 'models/shared/userModel'
        , 'views/iframe/edit'
        , 'views/shared/tldr.read'
        , 'text!templates/shared/tldr.read.embed.mustache'
        , 'text!templates/iframe/edit.embed.mustache'
        , 'text!templates/iframe/bullet.embed.mustache'
        , 'text!templates/iframe/deleteBullet.embed.mustache'
        , 'text!templates/shared/thank.embed.mustache'
]
, function(devmodeRetroCompatibility
, env
, mixpanelInit   // Only needed in the entry point as this module defines a global mixpanel object
, $
, _
, app
, queryParser
, TldrModel
, UserModel
, EditView
, ReadView
, readTemplate
, editEmbedTemplate
, bulletEmbedTemplate
, deleteBulletTemplate
, thankEmbedTemplate
) {
    var sourceUrl
      , domain
      , existing
      , query
      , title
      , hostnameSpecificClass
      , state = 0
      , head = document.getElementsByTagName('head')[0]
      , link = document.createElement('link');

    // send withcredentials header for every request
    $.ajaxSetup({
      xhrFields: { withCredentials: true }
    , headers: env.firefoxExtensionAPICreds
    });

    mixpanel.tldr_d4a6ebe3.register({ from: 'Firefox Extension' });

    query = queryParser.getQueryParameters(window.location.href.replace(/^.*\?/, ''));
    sourceUrl = query.url;
    title = query.title;
    existing = query.existing;
    hostnameSpecificClass = query.hostname;

    app.tldrModel = new TldrModel({url: sourceUrl, title: title});
    app.userModel = new UserModel();

    (function() {
      var previousHeight = $('body').height();
      window.setInterval(function (argument) {
        var currentHeight = $('body').height();
        if (currentHeight !== previousHeight) {
          previousHeight = currentHeight;
          DEVMODE && console.log('[Iframe Main] Setting iframe height to', currentHeight);
          window.parent.postMessage({ action: 'SET_IFRAME_EMBED_HEIGHT'
                                    , height: $('body').height()
          }, '*');
        }
      }, 20);
    }());

    // Add specific class depending on the host
    $('body').addClass(hostnameSpecificClass);

    app.readView = new ReadView({ model: app.tldrModel
                                , userModel: app.userModel
                                , template: readTemplate
                                , thankTemplate: thankEmbedTemplate });
    app.editView = new EditView({ model: app.tldrModel
                                , userModel: app.userModel
                                , template: editEmbedTemplate
                                , bulletTemplate: bulletEmbedTemplate
                                , deleteBulletTemplate: deleteBulletTemplate});
    app.readView.setElement($('#read-container'));
    app.editView.setElement($('#edit-container'));

    window.parent.postMessage({ action: 'GET_EMBED_DATA'}, '*');

    window.addEventListener('message', function (event) {
      var message = event.data
        , data;
      switch(message.action) {
        case 'GET_EMBED_DATA':
          data = message.data;

          app.userModel.set(data.userData);
          if (data.tldrData) {
            app.tldrModel.set(data.tldrData);
            app.readView.render();
            app.editView.$el.hide();
          } else {
            // Get domain for special case on our domain
            app.editView.render();
            app.readView.$el.hide();
          }

          break;
        case 'NO_OTHER_CASE_YET':
          break;
      }
    });

    app.on('switchToSignup', function () {
      window.open(env.websiteUrl + '/signup', '_blank');
    });

    app.on('saveSuccess', function () {
      app.readView.render();
      app.readView.$el.show();
      app.editView.$el.hide();
    });

    window.addEventListener('message', function (event) {
      var message = event.data;
      if (message.action === 'SYNC_USER_DATA') {
        if (_.keys(message.data).length > 0) {
          app.userModel.set(message.data);
        } else {
          app.userModel.clear();
        }
      }
    });

    $('body').on('click', '.embed-edit', function() {
      app.editView.render();
      app.editView.$el.show();
      app.readView.$el.hide();
    });
    $('body').on('click', '.go-to-settings', function() {
      window.open('about:addons','_blank');
    });
    $('body').on('click', '.dismiss-iframe', function() {
      window.parent.postMessage({ action: 'DISMISS_IFRAME_EMBED'}, '*');
    });

});

