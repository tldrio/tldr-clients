/**
 * Forgot password widget
 */


define(
[ 'lib/environment'
, 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'lib/logInAndOut'
, 'lib/query-parser'
, 'text!templates/shared/flash.mustache'
, 'text!templates/website/resetPassword.mustache'
],
function ( env
         , $
         , _
         , Backbone
         , Mustache
         , logInAndOut
         , queryParser
         , flashTemplate
         , template
         ) {

  var ResetPasswordWidget = Backbone.View.extend({

      events: function () {
        var events = {};
        events['click .' + 'submit-button'] = 'handleSubmit';
        return events;
      }

    , initialize: function () {
        DEVMODE && console.log('[ResetPasswordWidget] Initialize');
        _.bindAll( this
                 , 'submitError'
                 , 'submitSuccess'
                 );

        // example of query string in that case:
        // resetPasswordToken=rWaf2vZmO4G9h&email=stanislas.marion%40gmail.com
        var querystringParts = queryParser.getQueryParameters(window.location.search.substring(1));
        this.render(querystringParts);
      }

    , render: function (options) {
        options = options || {};
        this.$el.html(Mustache.render(template, options, { flash: flashTemplate }));
      }

    , handleSubmit: function (event) {
        event.preventDefault();

        var self = this
          , newPassword = $('.' + 'new-password-field').val()
          , email = $('.email').val()
          , resetPasswordToken = $('.resetPasswordToken').val();

        if (!email || email.length === 0) { return; }
        if (!resetPasswordToken || resetPasswordToken.length === 0) { return; }
        if (!newPassword || newPassword.length < 6) { return; }

        $.ajax({ url: env.apiUrl + '/user/resetPassword'
               , type: 'POST'
               , data: { email: email
                       , newPassword: newPassword
                       , resetPasswordToken: resetPasswordToken
                       }
               })
         .done(function () { self.submitSuccess({ email: email, password: newPassword }); })
         .fail(this.submitError);
      }

    , submitError: function () {
        this.render({ reset: false, flashError: 'There was an error, please try again' });
      }

    , submitSuccess: function (data) {
        logInAndOut.login(data);
        this.render({ reset: true, flashSuccess: 'Password reset successfully, redirecting to the home page ...' });
        setTimeout(function () { window.location = '/'; }, 2500);
      }

  });

  return ResetPasswordWidget;
});
