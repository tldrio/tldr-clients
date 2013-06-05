/*
 * Widget used to handle login as an ajax operation as long as there are credentials problem, for more responsiveness
 */

define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'spin'
, 'lib/logInAndOut'
, 'lib/query-parser'
],
function ( $
         , _
         , Backbone
         , Mustache
         , Spinner
         , logInAndOut
         , queryParser
         ) {

  var LoginWidgetView = Backbone.View.extend({

    events: function () {
      var events = {};
      events['click .login-status-submit'] = 'submitForm';
      events['click .login-with-google-button'] = 'loginWithGoogle';
      events.click = function (e) { e.stopPropagation(); };
      return events;
    }

  , initialize: function (options) {
      var queryStringParts = queryParser.getQueryParameters(window.location.search.substring(1));

      DEVMODE && console.log('[LoginWidget] Init');
      // Bind execution context
      _.bindAll(this
              , 'logInError'
              , 'logInSuccess'
              , 'submitForm'
              );

      // By default, if there is no returnUrl, redirect to index
      this.returnUrl = options.returnUrl || queryStringParts.returnUrl || '/';
      // Don't close the top right dropdown if a users clicks on it, it's annoying
      //this.on('click', function (e) { e.stopPropagation(); });
    }

  , logInSuccess:  function (data, textStatus, jqXHR) {
      DEVMODE && console.log('[LoginWidget] Credentials Accepted - Logged in as ' + data.username);
      window.location = this.returnUrl;
    }

  , logInError: function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 401) {
        DEVMODE && console.log('[LoginWidget] Invalid Credentials');
        var errorRedrawOptions = { invalidInput: jqXHR.getResponseHeader('WWW-Authenticate') };

        if (! errorRedrawOptions.invalidInput ) {
          errorRedrawOptions.invalidInput = 'Not so fast! It seems an incorrect email address or password was entered :(';
        }

        this.$('.login-invalid-input').css('display', 'block');
        this.$('.login-error-message').html(errorRedrawOptions.invalidInput);
        this.$('.login-status-email').focus();
      } else {
        DEVMODE && console.log('[LoginWidget] Error Sending Credentials');
      }
    }

  , loginWithGoogle: function (e) {
      var opts = { lines: 9, length: 4, width: 3, radius: 4, corners: 1, rotate: 0, color: '#fff', top: '0px', left: '0px'
                 , speed: 1, trail: 60, shadow: false, hwaccel: false, className: 'spinner', zIndex: 2e9 }
        , $button = $(e.srcElement)
      ;

      if ($button.hasClass('disabled')) { return; }

      this.$('.login-with-google-spinner').spin(opts);
      $button.addClass('disabled');
      window.location = '/third-party-auth/google?returnUrl=' + this.returnUrl;
    }

  , submitForm: function (event) {
      var email = this.$('.login-status-email').val()
        , password = this.$('.login-status-password').val()
        , data = { email: email, password: password };

      event.preventDefault(); // prevent page reload from `submit` button behaviour
      // Don't try to send credentials if login or password is missin
      if (!email || !password) { return; }

      logInAndOut.login(data, this.logInSuccess, this.logInError);
    }
  });

  return LoginWidgetView;
});
