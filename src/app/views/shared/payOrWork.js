
 /**
 * ReadView
 */

define([
  'jquery'
, 'underscore'
, 'Mustache'
, 'backbone'
, 'lib/mediator'
, 'lib/environment'
, 'lib/utils'
, 'text!templates/shared/payOrWork.mustache'
],
function ( $
         , _
         , Mustache
         , Backbone
         , app
         , env
         , utils
         , template
         , usernameLinkTemplate
         ) {

  var PayOrWorkView = Backbone.View.extend({
    className: 'tldr-main'
  , events: { 'click .btn-pow-now': 'explainNow'
            , 'click .btn-pow-later': 'explainLater'
            }

  , initialize: function (options) {
      DEVMODE && console.log('[PayOrWorkView] Init');
      _.bindAll( this
               , 'render'
               , 'explainNow'
               , 'explainLater'
               );

      this.template = options.template || template;
      this.userModel = options.userModel;
    }

  , render: function () {
      DEVMODE && console.log('[payorworkview] Render');

      this.$el.html(Mustache.render(this.template));
      app.trigger('hideEditLink');
      return this;
    }

  , explainNow: function () {
      mixpanel.tldr_d4a6ebe3.track('[ExplainNow]', { timeStamp: (new Date()).toISOString()
                                                  });
      this.$el.html('<div class="pow-container">Great choice! Pick a link from the front page and write the best summary you\'ve ever made!</div>');
      app.trigger('sawHoverWall');
    }
  , explainLater: function () {
      mixpanel.tldr_d4a6ebe3.track('[ExplainLater]', { timeStamp: (new Date()).toISOString()
                                                  });
      app.trigger('sawHoverWall');
      app.trigger('switchToReadMode', { tldrlater: true });
    }
  });

  return PayOrWorkView;
});
