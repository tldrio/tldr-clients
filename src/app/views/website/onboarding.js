 /**
 * ContainerView
 */

define(
[ 'jquery'
, 'underscore'
, 'Mustache'
, 'backbone'
, 'easyXDM'
, 'lib/environment'
, 'lib/mediator'
, 'models/shared/tldrModel'
, 'models/shared/userModel'
, 'views/shared/signup'
, 'views/shared/widget-install-bm'
, 'text!templates/website/onboarding.mustache'
],
function ( $
         , _
         , Mustache
         , Backbone
         , easyXDM
         , env
         , app
         , TldrModel
         , UserModel
         , Signup
         , InstallBm
         , template
         ) {

  var OnboardingView = Backbone.View.extend({

    events: function() {
      var events = {};
      events.mouseup = function (event) { event.stopPropagation(); };
      events['click .' + 'onboarding-show-prev'] = 'showPrevScreen';
      events['click .' + 'onboarding-show-next'] = 'showNextScreen';
      return events;
    }

  , initialize: function (options) {
      var self = this;
      DEVMODE && console.log('[OnboardingView] Init');
      // Bind execution context
      _.bindAll( self
               , 'render'
               , 'showNextScreen'
               , 'showPrevScreen'
               );

      // Create contents
      this.titleOnboarding = [ 'Father Christmas told us what you dreamed about so we built it'
                  , 'Your parents told us what you wanted for Christmas so we built it'
                  , 'Spock read your mind and told us your biggest wishes, we granted them'
                  , 'Yo dawg, we put a website in your website so that you can read while you read'];

      this.randomIndex = Math.floor( Math.random() * this.titleOnboarding.length);

      this.content = [];

      this.content.push({ title: this.titleOnboarding[ this.randomIndex ]
                     , summaryBullets: [ 'Get access to and contribute summaries of great web pages'
                                       , 'Share the content you like in a meaningful and efficient way'
                                       ]
                     });
      this.content.push({ title: 'Set it up'
                     , summaryBullets: [ ]
                     });
      this.content.push({ title: ''
                     , summaryBullets: [ ]
                     });

      this.userModel = new UserModel();

      // Go to screen #2 if the bookamrklet is correctly installed
      app.on('successInstall', this.showNextScreen, this);

      // Store current screen
      this.currentScreen = 0;

      this.setScreen();
    }

  , render: function (options) {
      DEVMODE && console.log('[OnboardingView] Render', options);
      var self = this
        , values = _.extend({}, options, { env: env }, this.content[this.currentScreen]);

      this.$el.html(Mustache.render( template
                                   , values
                                   ));

      // Display BM install widget only when showing the right screen (#1)
      if (this.currentScreen === 1) {
        this.installBMWidget = new InstallBm({ el: '.install-bm-container' });
      }

      if (this.currentScreen === 2) {
        mixpanel.tldr_d4a6ebe3.track('[Signup] Form displayed', { from: 'Website onboarding' });
        this.signup = new Signup({ el: '.signup-container', model: this.userModel, context: 'iframe' });
        this.signup.on('success:signup', function () { window.location = env.websiteUrl + '/discover'; });
      }

      return this;
    }

  , setScreen: function (event) {
      if (this.currentScreen > 0) {   // Screen #1 is displayed even before checkitout button is clicked so its meaningless to track this
        mixpanel.tldr_d4a6ebe3.track("[Website onboarding] Displayed screen #" + (this.currentScreen + 1));
      }

      //meta info for rendering
      var screen = {};
      // update copy for second screen and re-render
      screen[this.currentScreen] = true;
      screen.value = this.currentScreen+1;
      screen.total = this.content.length;
      if (this.currentScreen === 0) {
        screen.first = true;
      }
      if (this.currentScreen === this.content.length -1 ) {
        screen.last = true;
      }
      this.render({ screen: screen });
    }

  , showPrevScreen: function (event) {
      DEVMODE && console.log('[OnboardingView] click previous button');
      //randomize title first screen
      this.randomIndex = (this.randomIndex + 1) % this.titleOnboarding.length;
      this.content[0].title = this.titleOnboarding[this.randomIndex];

      this.currentScreen --;
      this.setScreen();
    }

  , showNextScreen: function (event) {
      DEVMODE && console.log('[OnboardingView] click next button');
      console.log(this);
      this.currentScreen ++;
      this.setScreen();
    }

  });

  return OnboardingView;
});

