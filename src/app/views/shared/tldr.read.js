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
, 'views/shared/sharing'
, 'views/shared/thank'
, 'text!templates/shared/tldr.read.mustache'
, 'text!templates/shared/usernameLink.mustache'
],
function ( $
         , _
         , Mustache
         , Backbone
         , app
         , env
         , utils
         , ShareView
         , ThankView
         , template
         , usernameLinkTemplate
         ) {

  var ReadView = Backbone.View.extend({
    className: 'tldr-main'

  , initialize: function (options) {
      DEVMODE && console.log('[ReadView] Init');
      _.bindAll( this
               , 'render'
               , 'renderSubViews'
               );

      this.model.on('change', this.render);
      this.template = options.template || template;
      this.userModel = options.userModel;
      this.subviews = {};
      this.subviews.vshare = new ShareView({ tldrData: this.model.attributes });
      this.subviews.vthank = new ThankView({ model: this.model
                                           , userModel: this.userModel
                                           , template: options.thankTemplate});
      this.userModel.on('change', this.subviews.vthank.render);
    }

  , render: function () {
      DEVMODE && console.log('[ReadView] Render');

      this.$el.html(Mustache.render( this.template
                                   , _.extend( {}
                                             , this.model.toJSONForDisplay()
                                             , { websiteUrl: env.websiteUrl
                                               , pageLink: utils.getTldrPageLink(this.model.toJSONForDisplay())
                                               }
                                             )
                                   , { usernameLink: usernameLinkTemplate }
                                   ));
      this.renderSubViews();
      app.trigger('showEditLink');
      return this;
    }

  , renderSubViews: function () {
      _.each(this.subviews, function (view) {
        view.setElement(this.$('.' + view.className));
        view.render();
      }, this);
    }

  });

  return ReadView;
});
