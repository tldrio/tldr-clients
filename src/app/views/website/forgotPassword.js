/**
 * Forgot password widget
 */


define(
[ 'lib/environment'
, 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'text!templates/website/forgotPassword.mustache'
, 'text!templates/shared/flash.mustache'
],
function ( env
         , $
         , _
         , Backbone
         , Mustache
         , template
         , flashTemplate
         ) {

  var ForgotPasswordWidget = Backbone.View.extend({

      events: function () {
        var events = {};

        events['click .' + 'submit-button'] = 'handleSubmit';

        return events;
      }

    , initialize: function() {
        DEVMODE && console.log('[ForgotPasswordWidget] Initialize');

        this.render();
      }

    , render: function(options) {
        options = options || {};
        this.$el.html(Mustache.render(template, options, { flash: flashTemplate }));
    }

    , handleSubmit: function(event) {
        var self = this
          , email = $('.'+'email-to-send-reset').val();

        event.preventDefault();

        if (!email || email.length === 0) { return; }

        DEVMODE && console.log("Makes AJAX request");

        $.ajax({ url: env.apiUrl + '/user/sendResetPasswordEmail'
               , type: 'POST'
               , data: { email: email }
               })
         .done(function (event) {
           self.render({ flashSuccess: 'We just sent you an email with instructions to reset your password.<br><strong>This email will only be valid for 1 hour</strong>, check it out now!' });
         })
         .fail(function () {
           self.render({ flashError: 'There was a problem, please try again later.' });
         });
    }

  });

  return ForgotPasswordWidget;
});
