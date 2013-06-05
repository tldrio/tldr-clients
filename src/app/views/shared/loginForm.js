
define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'lib/environment'
, 'lib/mediator'
, 'lib/logInAndOut'
, 'text!templates/shared/loginForm.mustache'
],
function ( $
         , _
         , Backbone
         , Mustache
         , env
         , app
         , logInAndOut
         , template
         ) {

  var LoginFormView = Backbone.View.extend({

    className: 'login-form'

  , template: template

  , events: function () {
      var events = {};
      events['click #' + 'login-form-login'] = 'submitForm';
      events['click #' + 'login-form-cancel'] = 'cancel';
      events['click #' + 'login-form-signup'] = 'switchToSignup';
      events['click #auth-google'] = 'authWithGoogle';
      return events;
    }

  , initialize: function (options) {
      DEVMODE && console.log('[LoginForm] Init with options', options);
      _.bindAll(this
              , 'cancel'
              , 'hideLoginForm'
              , 'logInError'
              , 'logInSuccess'
              , 'render'
              , 'submitForm'
              , 'switchToSignup'
              );
      this.message = options.message;

      app.on('showLoginForm', this.render);
      app.on('hideLoginForm', this.hideLoginForm );

    }

  , render: function (invalidInput) {
      DEVMODE && console.log('[LoginForm] Render');
      // Render the template
      this.$el.html(Mustache.render( template
                                    , _.extend( {}
                                              , { env: env }
                                              , { message: this.message }
                                              , { invalidInput: invalidInput }
                                              )
                                   ));
      this.$('#' + 'login-form-email').focus();
      return this;
    }

  , authWithGoogle: function (e) {
      var popup, self = this;

      e.preventDefault();

      popup = window.open( env.websiteUrl + '/third-party-auth/google?googleAuthThroughPopup=true&returnUrl=/third-party-auth/google/successPopup'
                         , '_blank'
                         , 'width=500, height=500'
                         );

      $(window).on('message', function (e) {
        var loggedInWithGoogle = e && e.originalEvent && e.originalEvent.data && e.originalEvent.data.loggedInWithGoogle;

        if (!loggedInWithGoogle) { return; }

        self.model.fetch()
         .done(self.logInSuccess)
         ;
      });
    }


  , cancel: function () {
      DEVMODE && console.log('[LoginForm] Cancel');
      this.trigger('cancel:loginForm');
    }
  , hideLoginForm: function () {
      DEVMODE && console.log('Hide login');
      this.$el.html(' ');
    }

  , setMessage:  function (message) {
      this.message = message;
    }

  , logInSuccess:  function (data, textStatus, jqXHR) {
      DEVMODE && console.log('[LoginStatus] Credentials Accepted - Logged in as ' + data.username);
      this.model.set(data);
      this.trigger('success:loginForm');
    }

  , logInError: function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 401) {
        var invalidInput = jqXHR.getResponseHeader('WWW-Authenticate');
        if (! invalidInput ) {
          invalidInput = 'Not so fast! It seems an incorrect email address or password was entered :(';
        }
        this.render(invalidInput);
        console.warn('[LoginFormView] Invalid Credentials',invalidInput );
      } else {
        console.error('[LoginFormView] Error Sending Credentials');
      }
    }

  , submitForm: function (event) {
      DEVMODE && console.log('[LoginFormView] Submit');
      var email = this.$('#login-form-email').val()
        , password = this.$('#login-form-password').val()
        , data = { email: email, password: password };


      event.preventDefault(); // prevent page reload from `submit` button behaviour
      // Don't try to send credentials if login or password is missin
      if (!email || !password) { return; }

      logInAndOut.login(data, this.logInSuccess, this.logInError);
    }

  , switchToSignup: function (event) {
      DEVMODE && console.log('[LoginForm] Switch to signup');
      event.preventDefault();
      app.trigger('switchToSignup');
    }

  });

  return LoginFormView;

});
