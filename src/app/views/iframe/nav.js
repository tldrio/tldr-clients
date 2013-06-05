 /**
 * NavView
 */

define([
  'jquery'
, 'underscore'
, 'Mustache'
, 'backbone'
, 'lib/environment'
, 'lib/logInAndOut'
, 'lib/mediator'
, 'lib/thirdPartyCookiesDetection'
, 'text!templates/iframe/nav.mustache'
, 'bootstrap'
],
function ( $
         , _
         , Mustache
         , Backbone
         , env
         , logInAndOut
         , app
         , thirdPartyCookiesDetection
         , template
         ) {

  var NavView = Backbone.View.extend({
    events: function () {
      var events = {};
      events['click .'+ 'nav-close'] = 'close';
      events['click .'+ 'nav-delete'] = 'deleteOrAnonymize';
      events['click .'+ 'nav-edit'] = 'switchToEditMode';
      events['click .'+ 'nav-login'] = 'switchToLoginForm';
      events['click .'+ 'nav-logout'] = 'logout';
      return events;
    }

  , className: 'nav-container'
  , template: template
  , initialize: function (options) {
      DEVMODE && console.log('[NavView] Init');
      _.bindAll( this
               , 'render'
               , 'deleteOrAnonymize'
               , 'hideEditLink'
               , 'showEditLink'
               );
      // check if 3rd party cookies are enabled
      this.thirdPartyCookiesEnabled = thirdPartyCookiesDetection.isEnabled();
      app.on('hideEditLink', this.hideEditLink);
      app.on('showEditLink', this.showEditLink);

      this.userModel = options.userModel;
      this.userModel.on('change', this.render);
      this.model.on('anonymize', this.render);
      this.userModel.fetch()
        .done(function (data) {
          DEVMODE && console.log('[NavView] You are logged in as ', data.username);
        })
        .fail(function () {
          mixpanel.tldr_d4a6ebe3.register({ "isLogged": false, "isAdmin": false });
          DEVMODE && console.log('[NavView] You are not logged in' );
        })
        .always(this.render);

    }

  , render: function () {
      var displayDeleteLink;

      DEVMODE && console.log('[NavView] Render');

      displayDeleteLink = (this.model && this.userModel) ? true : false;
      displayDeleteLink = displayDeleteLink && (this.model && this.model.get('creator') && (this.model.get('creator')._id || this.model.get('creator'))) === (this.userModel && this.userModel.get('_id'));
      displayDeleteLink = displayDeleteLink && (this.model && this.model.get('anonymous') === false);

      this.$el.html(Mustache.render( template
                                   , _.extend( {}
                                             , this.model.toJSONForDisplay()
                                             , { thirdPartyCookiesEnabled: this.thirdPartyCookiesEnabled }
                                             , this.userModel.toJSONForDisplay()
                                             , { displayDeleteLink: displayDeleteLink }
                                             , { env: env })
                                   ));
      return this;
    }

  , close: function () {
      DEVMODE && console.log('[NavView] Close');
      app.provider.closeOverlay();
    }

  , deleteOrAnonymize: function () {
      var doIt = confirm('Are you sure you want to delete your tldr?');
      if (doIt) {
        this.model.deleteOrAnonymize();
      }
    }

  , hideEditLink: function () {
      this.$('.nav-edit').hide();
    }

  , showEditLink: function () {
      this.$('.nav-edit').show();
    }

  , logout: function () {
      var self = this;
      logInAndOut.logout(function () {
        self.userModel.clear();
      });
    }

  , switchToEditMode: function () {
      DEVMODE && console.log('[NavView] Switch to Edit Mode');
      app.trigger('switchToEditMode');
    }

  , switchToLoginForm: function () {
      DEVMODE && console.log('[NavView] Show Login Form');
      app.trigger('switchToLoginForm');
    }


  });

  return NavView;
});
