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
, 'text!templates/shared/wikipedia.preview.mustache'
, 'text!templates/shared/twitter.preview.mustache'
, 'text!templates/shared/youtube.preview.mustache'
, 'text!templates/shared/article.preview.mustache'
],
function ( $
         , _
         , Mustache
         , Backbone
         , app
         , env
         , wikipediaTemplate
         , twitterTemplate
         , youtubeTemplate
         , articleTemplate
         ) {

  var Preview = Backbone.View.extend({
    className: 'tldr-main'
  , events: {
      'click .cta-improve-summary': 'propagateCtaImproveSummary'
  }

  , initialize: function (options) {
      DEVMODE && console.log('[Preview] Init');
      _.bindAll( this
               , 'render'
               , 'setPreviewData'
               , 'propagateCtaImproveSummary'
               );

      this.userModel = options.userModel;
    }

  , render: function () {
      DEVMODE && console.log('[Preview] Render');

      this.$el.html(Mustache.render( this.template
                                   , _.extend( {}
                                             , this.previewData
                                             , { env: env}
                                             )
                                   ));
      return this;
    }

  , setPreviewData: function (data) {
      this.previewData = data;
      if (this.previewData.type === 'wikipedia') {
        this.template = wikipediaTemplate;
      } else if (this.previewData.type === 'twitter') {
        this.template = twitterTemplate;
      } else if (this.previewData.type === 'youtube') {
        this.template = youtubeTemplate;
      } else if (this.previewData.type === 'article') {
        this.template = articleTemplate;
      }
    }

  , propagateCtaImproveSummary: function (event) {
      this.trigger('cta-improve-summary', this.previewData);
    }


  });

  return Preview;
});
