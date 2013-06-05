define([
  'jquery'
, 'backbone'
, 'underscore'
, 'lib/environment'
, 'lib/mediator' ], function($, Backbone, _, env, app){

  var UserModel = Backbone.Model.extend({

      idAttribute: '_id' //necessary when using mongo, see http://documentcloud.github.com/backbone/#Model-idAttribute

    , urlRoot: env.apiUrl + '/users/'

    , initialize: function(options) {
        DEVMODE && console.log('[UserModel] Init');
        _.bindAll(this
                  , 'updatePassword'
                  , 'allowHover'
                 );

        if (has('extension')) {
          // Listen for future change in userModel to sync
          this.on('change:username', function (model) {
            var data = model.attributes;
            if (has('xpi')) {
              window.parent.postMessage({ action: 'SYNC_USER_DATA', data: data},'*');
            } else if (has('crx')){
              chrome.extension.sendMessage({ action: 'SYNC_USER_DATA', data: data});
            }
            if (model.isNew()) {
              mixpanel.tldr_d4a6ebe3.register({ "isLogged": false, "isAdmin": false });
              mixpanel.tldr_d4a6ebe3.unregister('mp_name_tag');
            } else {
              // Change Mixpanel user
              mixpanel.tldr_d4a6ebe3.register({ "isLogged": true, "isAdmin": data.isAdmin });
              mixpanel.tldr_d4a6ebe3.name_tag(data.username);
              mixpanel.tldr_d4a6ebe3.identify(data.username);
              mixpanel.tldr_d4a6ebe3.people.set({ $email: data.email
                                                , $username: data.username
                                                , $last_login: new Date()
              });
            }
          });

        }
        app.on('sawHoverWall', this.allowHover);
      }

    , allowHover: function () {
        DEVMODE && console.log('[UserModel] Allow hover after seeing wall');
        this.set({ 'canHover': true });
        var params = { type: 'PUT'
                     , url: this.urlRoot + 'you/allowHover'
                     };
        return $.ajax(params);
      }

    , resendConfirmToken: function() {
        DEVMODE && console.log('[UserModel] Request new Confirmation Token');
        $.ajax({ url: env.apiUrl + '/resendConfirmToken' });
      }

      // No support for emulateHTTP nor emulateJSON
    , sync: function (method, model, options) {
        var methodMap = { 'create': 'POST'
                        , 'update': 'PUT'
                        , 'delete': 'DELETE'
                        , 'read':   'GET'
                        }
          , type = methodMap[method]
          , params = { type: type, dataType: 'json' };

        options = options || {};

        params.accepts = 'application/json';
        if (!options.data && model && (method === 'create' || method === 'update')) {
          params.contentType = 'application/json';
          params.data = JSON.stringify(model.toJSON());
        }

        if (params.type !== 'GET') {
          params.processData = false;
        }

        switch(type) {
            case 'GET':
              params.url = model.urlRoot + 'you';
              break;
            case 'POST':
              params.url = model.urlRoot;
              break;
            case 'PUT':
              params.url = model.urlRoot + 'you';
              break;

            default:
                // code
        }

        DEVMODE && console.log('[Usermodel] Sync');
        return $.ajax(_.extend(params, options));

      }

      // custom getter for display
    , toJSONForDisplay: function(options) {
        var clone =  _.clone(this.attributes);
        return clone;
      }

    , updateGravatarEmail: function(data) {
      DEVMODE && console.log('[UserModel] Update gravatar email');
      var params = { type: 'PUT'
                   , dataType: 'json'
                   , url: this.urlRoot + 'you/updateGravatarEmail'
                   , accepts: 'application/json'
                   , contentType: 'application/json'
                   , data: JSON.stringify(data)
                   };
      return $.ajax(params);
    }

    , updatePassword: function(data) {
        DEVMODE && console.log('[UserModel] Update password');
        var params = { type: 'PUT'
                     , dataType: 'json'
                     , url: this.urlRoot + 'you/updatePassword'
                     , accepts: 'application/json'
                     , contentType: 'application/json'
                     , data: JSON.stringify(data)
                     };
        return $.ajax(params);
      }

    , validateEmail: function(value) {
        // Same regex as the one used on the server
        if (value.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/)) {
          return true;
        } else {
          return false;
        }
      }

    , validatePassword: function(value) {
      // For now, only check the length of password. Later we can check for strength too
      if (value.length >= 6) {
        return true;
      } else {
        return false;
      }
    }

    , validateUsername: function(value) {
        if (value.match(/^[A-Za-z0-9_]{3,16}$/)) {
          return true;
        } else {
          return false;
        }
      }

    , validateBio: function(value) {
        if (value.length <= 500) {
          return true;
        } else {
          return false;
        }
      }

    , validateTwitterHandle: function(value) {
        if (! value || (value.length <= 16 && value[0] === '@')) {
          return true;
        } else {
          return false;
        }
      }

  });

  return UserModel;
});
