define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'lib/environment'
, 'lib/utils'
, 'text!templates/shared/sharing.mustache'
, 'bootstrap'
],
function($, _, Backbone, Mustache, env, utils, template, bootstrap) {

  var SharingView = Backbone.View.extend({

    events: function () {
      var events = {};
      events['click .' + 'sharing-link'] = 'shareWithLink';
      events['click .tldr-btn-share.facebook'] = 'shareOnFacebook';
      events['click .tldr-btn-share.twitter'] = 'shareOnTwitter';
      events['click .tldr-btn-share.linkedin'] = 'shareOnLinkedin';
      events['click .tldr-btn-share.googleplus'] = 'shareOnGoogleplus';
      events['click .tldr-btn-share.mail'] = 'shareByEmail';
      events['click .tldr-btn-share.instapaper'] = 'saveToInstapaper';
      events['click .tldr-btn-share.pocket'] = 'saveToPocket';
      events['click .tldr-btn-share.readability'] = 'saveToReadability';
      return events;
    }

  , className: 'sharing-container'

  , initialize: function (options) {
      DEVMODE && console.log('[SharingView] Init');
      // Bind execution context
      _.bindAll( this
               , 'render'
               , 'saveToInstapaper'
               , 'saveToPocket'
               , 'saveToReadability'
               , 'shareOnFacebook'
               , 'shareOnTwitter'
               , 'shareOnLinkedin'
               , 'shareOnGoogleplus'
               , 'shareByEmail'
               );

      this.tldrData = options.tldrData;
      // If the summary is not set but the summaryBullets are, we get it from them
      if (! this.tldrData.summary && this.tldrData.summaryBullets) {
        this.tldrData.summary = this.tldrData.summaryBullets.join('. ');
      }
    }

  , render: function () {
      // Render the template
      DEVMODE && console.log('[SharingView] Render ' );
      //debugger;
      var encodedResourceUrl = encodeURIComponent(this.tldrData.originalUrl)
        , pageLink = utils.getTldrPageLink(this.tldrData)
        , summary = this.tldrData.summary
        , tweetText = utils.getTweetText(this.tldrData)
        , opts = { title: this.tldrData.title
                 , summary: summary
                 , summaryBullets: this.tldrData.summaryBullets
                 , pageLink: pageLink
                 , tweetText: encodeURIComponent(tweetText)
                 , env: env
                 , encodedResourceUrl: encodedResourceUrl };

      this.$el.html(Mustache.render(template, opts));
      return this;
    }

  , saveToInstapaper: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Save For Later]', { url: this.tldrData.url, timeStamp: (new Date()).toISOString(), channel: 'Instapaper' });
    }

  , saveToPocket: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Save For Later]', { url: this.tldrData.url, timeStamp: (new Date()).toISOString(), channel: 'Pocket' });
    }

  , saveToReadability: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Save For Later]', { url: this.tldrData.url, timeStamp: (new Date()).toISOString(), channel: 'Readability' });
    }

  , shareOnFacebook: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Sharing]', { url: this.tldrData.url, timeStamp: (new Date()).toISOString(), channel: 'Facebook' });

      //block <a> behaviour
      event.preventDefault();
      // avoid dismissing dropdown
      event.stopPropagation();
      var url = this.$(event.currentTarget).attr('href');
      window.open( url ,'_blank', 'width=460,height=225');
    }

  , shareOnTwitter: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Sharing]', { url: this.tldrData.url, timeStamp: (new Date()).toISOString(), channel: 'Twitter' });

      //block <a> behaviour
      event.preventDefault();
      // avoid dismissing dropdown
      event.stopPropagation();
      var url = this.$(event.currentTarget).attr('href');
      window.open(url ,'_blank', 'width=600,height=450');
    }

  , shareOnLinkedin: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Sharing]', { url: this.tldrData.url, timeStamp: (new Date()).toISOString(), channel: 'Linkedin' });

      //block <a> behaviour
      event.preventDefault();
      // avoid dismissing dropdown
      event.stopPropagation();
      var url = this.$(event.currentTarget).attr('href');
      window.open(url ,'_blank', 'width=600,height=400');
    }

  , shareOnGoogleplus: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Sharing]', { url: this.tldrData.url, timeStamp: (new Date()).toISOString(), channel: 'GooglePlus' });

      //block <a> behaviour
      event.preventDefault();
      // avoid dismissing dropdown
      event.stopPropagation();
      var url = this.$(event.currentTarget).attr('href');
      window.open(url ,'_blank', 'width=600,height=400');
    }

  , shareWithLink: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Sharing]', { url: this.tldrData.url, timeStamp: (new Date()).toISOString(), channel: 'Link' });

      event.stopPropagation();
      $(event.currentTarget).select();
    }

  , shareByEmail: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Sharing]', { url: this.tldrData.url, timeStamp: (new Date()).toISOString(), channel: 'Email' });
    }

  , template: template

  });

  return SharingView;
});
