/**
 * Main js for website
 * Copyright (C) 2012 L. Chatriot, S. Marion, C. Miglietti
 * Proprietary License
 */


//define(
require(
[ 'devmodeRetroCompatibility'
, 'lib/environment'
, 'mixpanel'
, 'jquery'
, 'domReady'
, 'spin'
, 'models/shared/userModel'
, 'lib/colorIcons'
, 'lib/attachPowertips'
, 'lib/bindAddToBrowserButton'
, 'lib/trackChromeExtensionPageClicks'
, 'views/website/loginWidget'
, 'views/shared/widget-install-bm'
, 'views/website/signupFormWithGoogle'
, 'views/website/account'
, 'views/website/confirmEmail'
, 'views/website/discover'
, 'views/website/forgotPassword'
, 'views/website/latestTldrs'
, 'views/website/notifications'
, 'views/website/resetPassword'
, 'views/website/voteOnThread'
, 'views/website/tldrPage'
, 'views/website/moderation'
, 'views/website/add-categories'
, 'views/website/scratchpad'
, 'views/website/analytics'
, 'text!templates/website/addToFirefoxButton.mustache'
],
function
( devmodeRetroCompatibility
, env
, mixpanelInit   // Only needed in the entry point as this module defines a global mixpanel object
, $
, domReady
, Spinner
, UserModel
, colorIcons
, attachPowertips
, bindAddToBrowserButton
, trackChromeExtensionPageClicks
, LoginWidget
, InstallBm
, SignupFormWithGoogle
, Account
, ConfirmEmail
, Discover
, ForgotPassword
, LatestTldrs
, Notifications
, ResetPassword
, VoteOnThread
, TldrPage
, enableModeration
, addCategories
, scratchpad
, analytics
, addToFirefoxButton
) {

  // Enable the use of the same cookie for all calls to the API, including calls from this class (tldrModel)
  // The cookie would be sent back and forth anyway so there is no slowing down, and we avoid the memory leak due to connect-session's stupidity
  $.ajaxSetup({
    xhrFields: {withCredentials: true}
  });

  function loadWidgets (path) {
    var user = new UserModel()
      , onboardingView, onboardingContainer
      , checkitoutClicked = false
      , username, email, version, isAdmin
      , $username, $rightColumn
      ;

    DEVMODE && console.log('[WebsiteAll] Loading Widgets for path', path || 'index');
    // By default, unregister the user. If he is logged, he will be reregistered right away, before any call to track
    mixpanel.tldr_d4a6ebe3.unregister('mp_name_tag');

    // Default widgets to load

    // Load the login widget only if nobody is logged in
    if ($('#login-widget').length > 0) {
      this.loginWidget = new LoginWidget({ el: '#login-widget', returnUrl: path });
      mixpanel.tldr_d4a6ebe3.register({ "isLogged": false, "isAdmin": false });
    } else {
      username = $('#logged-user-username').data('username') || '';
      email = $('#logged-user-username').data('email') || '';
      isAdmin = $('#logged-user-username').data('isadmin') || '';
      isAdmin = (isAdmin.toString() === 'true');

      if (username.length > 0) {
        mixpanel.tldr_d4a6ebe3.register({ "isLogged": true, "isAdmin": isAdmin });
        mixpanel.tldr_d4a6ebe3.name_tag(username);
        mixpanel.tldr_d4a6ebe3.identify(username);
        mixpanel.tldr_d4a6ebe3.people.set({ $email: email
                                          , $username: username
                                          });
      }
    }

    // time-stamp all actions taken on the current page and tag them as 'from website'
    mixpanel.tldr_d4a6ebe3.register({ timeStamp: (new Date()).toISOString(), from: 'Website' });

    // Router
    switch(path) {
      case '/about':
        break;
      case '/account':
        this.account = new Account({ el: '#'+'manage-account-container' , model: user});
        break;
      case '/confirmEmail':
        this.confirm = new ConfirmEmail({ el: '#'+'confirm-email-container' });
        break;
      case '/login':
        this.loginPageWidget = new LoginWidget({ el: '#login-page-login-widget' });
        break;
      case '':
        if (username) {   // A user is logged, the leaderboard is shown
          attachPowertips({ from: 'Latest tldrs page' });
          // There are 10 freshest tldrs
          colorIcons(10);
          LatestTldrs.displayGraphicHelper();
        } else {
          bindAddToBrowserButton();
        }
        break;
      case '/browser-extension':
        bindAddToBrowserButton();
        attachPowertips({ from: 'About extension' });
        trackChromeExtensionPageClicks();
        break;
      case '/notifications':
        this.notifications = new Notifications({ el: '#notifications-container'});
        break;
      case '/signup':
        mixpanel.tldr_d4a6ebe3.track('[Signup] Form displayed');

        this.signup = new SignupFormWithGoogle({ el: '#'+'signup-form-container', model: user});
        break;
      case '/what-is-tldr':
        new InstallBm({ el: "." + 'install-bm-container' });
        break;
      case '/forgotPassword':
        this.forgotPassword = new ForgotPassword({ el: '.' + 'forgot-password-widget' });
        break;
      case '/resetPassword':
        this.resetPassword = new ResetPassword({ el: '.' + 'reset-password-widget', model: user });
        break;
      case '/forum/threads':
        new VoteOnThread({ el: '#thread-list' });
        break;
      case '/third-party-auth/pick-username':
        // Being on this page means a Google sign up was successful
        mixpanel.tldr_d4a6ebe3.track("[Signup] Success", { type: 'Google', timeStamp: (new Date()).toISOString() });
        mixpanel.tldr_d4a6ebe3.people.set({ $created: new Date() });
        break;
      case '/moderation':
        colorIcons(100000);   // Let's use only one color
        enableModeration();
        break;
      case '/add-categories':
        colorIcons(100000);   // Let's use only one color
        addCategories();
        break;
      case '/scratchpad':
        scratchpad();
        break;
      case '/impact':
        analytics();
        break;
      default:   // No string matching possible
        // Discover page
        if (path.match(/^\/discover(\/[a-zA-Z0-9\.\-]*)?\/?(newest|mostread)?$/)) {
          this.discover = Discover.init();
          break;
        }

        // A tldr to be displayed as a tldr page
        if (path.match(/^\/tldrs\/[a-f0-9]{24}\/.+$/)) {
          TldrPage.launchPageScript();
          break;
        }

        // A thread or editing a post
        if (path.match(/^\/forum\/threads\/[a-f0-9]{24}\/.+$/) || path.match(/^\/forum\/posts\/[a-f0-9]{24}\/edit$/)) {
          new VoteOnThread({ el: '#title-and-vote' });
          break;
        }

        // A user's analytics
        if (path.match(/^\/[a-zA-Z0-9]+\/impact$/)) {
          analytics();
          break;
        }
	// run analytics for all urls # TODO improve this
	analytics();
        // Default: a public user profile
        colorIcons(14);
        attachPowertips({ from: 'User public profile' });

        // Reduce size of username if it is too large
        try {
          $username = $('.tldr-base-unit h1 span');
          $rightColumn = $username.parent().parent().parent();
          if ($username.width() > $rightColumn.width()) {
            $username.css('font-size', Math.floor(parseInt($username.css('font-size'), 10) * $rightColumn.width() / $username.width()) + 'px');
          }
        } catch (e) {}

        break;
    }
  }

  domReady(function () {
    var path = window.location.pathname;

    // Remove trailing slash if any
    if (path[path.length - 1] === '/') {
      path = path.substring(0, path.length - 1);
    }

    loadWidgets(path);
  });
});
