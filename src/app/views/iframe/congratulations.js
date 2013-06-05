 /**
 * CongratsView
 */

define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'lib/mediator'
, 'lib/utils'
, 'views/shared/loginForm'
, 'text!templates/iframe/congratulations.mustache'
],
function ( $
         , _
         , Backbone
         , Mustache
         , app
         , utils
         , LoginFormView
         , template
         ) {

  var CongratsView = Backbone.View.extend({


    className: 'congrats-container'

  , events: { 'click .tldr-btn-share-twitter': 'shareOnTwitter' }

  , initialize: function () {
      DEVMODE && console.log('[CongratsView] Init');
      _.bindAll( this
               , 'render'
               , 'shareOnTwitter'
               );
      this.wasInWhitelist = this.options.response.response.wasInWhitelist;
    }


  , render: function () {
      var congratsMessages = [ 'Congrats, this tl;dr will save hours to the community!'
                             , 'Nice job, you can boast about saving hours to the community'
                             ]
        , congratsMessage = congratsMessages[Math.floor( Math.random() * congratsMessages.length)]
        , randomImg = Math.floor( Math.random() * 19) + 1;
      if (this.wasInWhitelist) {
        congratsMessage = 'Congrats, you just unlocked 7 days of reading tldrs on Hacker News!';
      }

      DEVMODE && console.log('[CongratsView] Render');
      this.$el.html(Mustache.render( template
                                   , { congratsMessage: congratsMessage
                                     , randomImg: randomImg}));

      return this;
    }

  , template: template

  , shareOnTwitter: function (event) {
      mixpanel.tldr_d4a6ebe3.track('[Sharing]', { timeStamp: (new Date()).toISOString(), channel: 'Twitter', from: 'Congrats view' });

      //block <a> behaviour
      event.preventDefault();
      // avoid dismissing dropdown
      event.stopPropagation();
      var url = this.$(event.currentTarget).attr('href');
      window.open(url ,'_blank', 'width=600,height=400');
    }

  });

  return CongratsView;
});
