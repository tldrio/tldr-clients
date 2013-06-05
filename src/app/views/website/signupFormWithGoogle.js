/*
 * Displays the signup form and manages local and remote validation
 *
 */

define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'lib/environment'
, 'lib/query-parser'
, 'text!templates/shared/flash.mustache'
, 'text!templates/website/signupFormWithGoogle.mustache'
, 'bootstrap'
],
function ( $
         , _
         , Backbone
         , Mustache
         , env
         , queryParser
         , flashTemplate
         , formTemplate
         ) {

  var SignupFormView = Backbone.View.extend({

    events: function () {
      var events = {}
        , debounceValidateChange = _.debounce(this.validateChange, 600)
        ;
      events['click #' + 'signup-form-submit'] = 'submit';
      events['click #' + 'signup-with-google-button'] = 'signupWithGoogle';
      events['keyup #' + 'signup-form-email'] = debounceValidateChange;
      events['keyup #' + 'signup-form-password'] = debounceValidateChange;
      events['keyup #' + 'signup-form-username'] = debounceValidateChange;
      // We validate on blur too because we want to validate even if
      // user press tab very fast and the debounce comes too late
      // with keyCode = 9 (which is ignored in validateChange)
      events['blur #' + 'signup-form-email'] = 'validateChange';
      events['blur #' + 'signup-form-password'] = 'validateChange';
      events['blur #' + 'signup-form-username'] = 'validateChange';

      return events;
    }


  , initialize: function (options) {
      DEVMODE && console.log('[SignupFormView] Init with options', options);
      _.bindAll(this, 'signupSuccess'
                    , 'signupFailure');
      this.returnUrl = queryParser.getQueryParameters(window.location.href.replace(/^.*\?/, '')).returnUrl;
      this.context = options.context;
      this.template = formTemplate;
      this.render();
    }

  , render: function (options) {
      DEVMODE && console.log('[SignupFormView] Render');
      var opts = _.extend( {}
                         , this.model.toJSONForDisplay()
                         , { env: env, returnUrl: this.returnUrl ? '&returnUrl=' + this.returnUrl : null}
                         , options
                         );
      // Render the template
      this.$el.html(Mustache.render(this.template, opts, { flash: flashTemplate }));
      // focus on email field
      //this.$('#signup-form-username').focus();
      return this;
    }

  , submit: function (event) {
      event.preventDefault();   // Prevent page reload
      DEVMODE && console.log('[SignupFormView] Submit form to create new user');
      var data = { email: this.$('#'+ 'signup-form-email').val()
                 , password: this.$('#'+ 'signup-form-password').val()
                 , username: this.$('#'+ 'signup-form-username').val()
                 };


      if (this.returnUrl === '/browser-extension?installed') { // returnUrl is set during the chrome ext onboarding flow
        data.source = 'crx';
      } else {
        data.source = 'direct';
      }

      if (!this.model.isNew()) {
        DEVMODE && console.log('[SignupFormView] Clearing old model');
        this.model.clear();
      }

      this.model.save(data, { silent:true })
        .done(this.signupSuccess)
        .fail(this.signupFailure);
    }

  , signupSuccess: function (data) {
      DEVMODE && console.log('[SignupFormView] Signup successful');

      mixpanel.tldr_d4a6ebe3.track("[Signup] Success", { type:'Basic',  timeStamp: (new Date()).toISOString() });
      mixpanel.tldr_d4a6ebe3.people.set({ $created: new Date() });

      // If we are in iframe we dont render signup success template
      // we just advertise that the signup is successful to continue the edition process
      if (this.context === 'iframe') {
        this.trigger('success:signup');
        return;
      }

      // Need give some time for MP to send the request
      // The 300 ms is what's used with mixpanel's track_link
      // See https://mixpanel.com/docs/integration-libraries/javascript-full-api#track_links
      setTimeout(function () {
        if (this.returnUrl) {
          window.location = env.websiteUrl + this.returnUrl;
        } else {
          window.location = env.websiteUrl + '/browser-extension';
        }
      }, 300);
    }

  , signupFailure: function(jqXHR) {
      var field
        , duplicateField
        , key
        , message
        , selector
        , siblings
        , validationErrors;

      if (jqXHR.status === 403) {
        validationErrors = JSON.parse(jqXHR.responseText);
        DEVMODE && console.log('[SignupFormView] Signup failed - Information provided was invalid', validationErrors);
        if (_.has(validationErrors, 'email')) {
          selector = '#' + 'signup-form-email';
          message = validationErrors.email;
        } else if (_.has(validationErrors, 'password')) {
          selector = '#' + 'signup-form-password';
          message = validationErrors.password;
        } else if (_.has(validationErrors, 'username')) {
          selector = '#' + 'signup-form-username';
          message = validationErrors.username;
        }
      } else if (jqXHR.status === 409) {
        DEVMODE && console.log('[SignupFormView] Signup failed - email or username already exists');
        duplicateField = JSON.parse(jqXHR.responseText).duplicateField;
        switch(duplicateField) {
          case 'login':
            selector = '#' + 'signup-form-email';
            message = 'This email is already taken';
            break;
          case 'usernameLowerCased':
            selector = '#' + 'signup-form-username';
            message = 'This username is already taken';
            break;
        }

      }

      this.render({ flashError: message });
      this.$(selector).focus();
    }

  , signupWithGoogle: function () {
      var opts = { lines: 9, length: 4, width: 3, radius: 4, corners: 1, rotate: 0, color: '#fff', left: '0px', top: '0px'
                 , speed: 1, trail: 60, shadow: false, hwaccel: false, className: 'spinner', zIndex: 2e9 }
      ;

      this.$('.login-with-google-spinner').spin(opts);
    }

  , validateChange: function(event) {

      //Dont do anything on <tab>
      // bevause we don't want to trigger validation when
      // jumping from one input to the following with tab
    // Dont do anything on enter too

      if (event.keyCode !== 9 && event.keyCode !== 13) {
        var current = this.$(event.currentTarget)
          , field = current.attr('name')
          , value = current.val()
          , help = current.siblings('.help-block')
          , validMessage
          , invalidMessage
          , isValid;

        if (event.type === 'focusout' && !value) {
          return;
        }

        switch(field) {
          case 'email':
            isValid = this.model.validateEmail(value);
            invalidMessage = 'Please enter a properly formatted email';
            validMessage = 'You have a rockstar email address';
            break;
          case 'password':
            isValid = this.model.validatePassword(value);
            invalidMessage = 'Password should contain at least 6 characters';
            validMessage = 'Keep it secret!';
            break;
          case 'username':
            isValid = this.model.validateUsername(value);
            invalidMessage = 'Stay between 3 and 16 letters or numbers';
            validMessage = 'This username rocks';
            break;
        }

        if (!isValid) {
          help.parents('.control-group').addClass('error');
          help.parents('.control-group').removeClass('success');
          help.html(invalidMessage);
        } else {
          help.html(validMessage);
          help.parents('.control-group').removeClass('error');
          help.parents('.control-group').addClass('success');
        }
      }
    }

  });

  return SignupFormView;
});
