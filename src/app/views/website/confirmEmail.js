/*
 * Confirm Email View
 *
 */

define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'lib/query-parser'
, 'lib/environment'
, 'text!templates/website/confirmEmail.mustache'
],
function
( $
, _
, Backbone
, Mustache
, queryParser
, env
, template
) {

  var ConfirmEmailView = Backbone.View.extend({

    events: function () {
      var events = {};
      return events;
    }

  , initialize: function (options) {
      var vars = queryParser.getQueryParameters(window.location.search.substring(1))
        , self = this;

      DEVMODE && console.log('[ConfirmAccount] Init with options', options);
      _.bindAll(this
                , 'render'
                );

      if (! vars.confirmEmailToken || ! vars.email) {
        DEVMODE && console.log('[ConfirmEmailView] information for email validation missing');
        self.render({ validationError: true });
        // Page was not called from the "confirm your email" link, display the usual 'manage your account' page
      } else {
        // Page was called from the "confirm your email link", so we need to confirm the email
        // before fetching the user model
        $.ajax({ url: env.apiUrl + '/confirm'
               , type: 'POST'
               , data: { email: vars.email
                       , confirmEmailToken: vars.confirmEmailToken } })
         .done(function (event) {
           self.render({ validationSuccess: true });
         })
         .fail(function (jqXHR) {
           // If it fails it may mean that the token was invalid or that the email is already
           // confirmed.
           self.render({ validationError: true });
         });
      }
    }

  , render: function (options) {
      DEVMODE && console.log('[ConfirmEmailView] Render');
      var opts = _.extend( {}
                         , { env: env }
                         , options
                         );
      this.$el.html(Mustache.render(template, opts));
      return this;
    }


  });

  return ConfirmEmailView;
});



