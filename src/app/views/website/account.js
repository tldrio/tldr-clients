/*
 * Manage your account widget
 *
 */

define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'lib/environment'
, 'lib/mediator'
, 'text!templates/website/account.mustache'
, 'text!templates/shared/flash.mustache'
, 'bootstrap'
],
function
( $
, _
, Backbone
, Mustache
, env
, app
, template
, flashTemplate
, bootstrap
) {

  var ManageAccountView = Backbone.View.extend({

    events: function () {
      var events = {}
        , debounceValidateChange = _.debounce(this.validateChange, 700);

      events['keyup #account-form-new-pwd'] = debounceValidateChange;
      events['keyup #account-form-confirm-pwd'] = _.debounce(this.validateChange, 550);
      events['keyup #account-form-email'] = debounceValidateChange;
      events['keyup #account-form-username'] = debounceValidateChange;

      events['blur #account-form-new-pwd'] = 'validateChange';
      events['blur #account-form-confirm-pwd'] = 'validateChange';
      events['blur #account-form-email'] = 'validateChange';
      events['blur #account-form-username'] = 'validateChange';
      events['blur #account-form-bio'] = 'validateChange';
      events['blur #account-form-twitterHandle'] = 'validateChange';

      events['click #account-resend-token'] = 'resendConfirmToken';
      events['click #account-submit-new-password'] = 'submitNewPassword';
      events['click #account-submit-new-profile'] = 'submitNewProfile';
      events['click #account-submit-new-notif-settings'] = 'submitNewNotifSettings';
      events['click #submit-new-gravatar-email'] = 'submitNewGravatarEmail';
      events['click #account-delete-button'] = 'deleteAccount';

      events['shown a[data-toggle="tab"]'] = 'clickOnTab';
      return events;
    }

  , initialize: function (options) {
      var self = this;

      DEVMODE && console.log('[ManageAccountView] Init with options', options);
      _.bindAll(this
                , 'render'
                , 'updateNotifSettingsError'
                , 'updateNotifSettingsSuccess'
                , 'updateGravatarError'
                , 'updateGravatarSuccess'
                , 'updatePwdError'
                , 'updatePwdSuccess'
                , 'updateProfileError'
                , 'updateProfileSuccess'
                );

      this.prepareModelForRender();
    }

  , render: function (options) {
      DEVMODE && console.log('[ManageAccountView] Render');

      // By default we show the profile tab. Overriden by options if necessary
      var opts = _.extend({ tab: { profile: true } }, options, this.model.toJSONForDisplay());
      // Render different templates if user is logged in or not
      if (this.model.has('email')) {
        this.$el.html(Mustache.render(template, opts, { flash: flashTemplate }));
        app.trigger('hideLoginForm');
      } else {
        this.$el.html(' ');
        app.trigger('showLoginForm');
      }

      return this;
    }

  , clickOnTab: function (event) {
      // Hide success and error alert messages when toggling tab
      this.$('.alert-success').hide();
      this.$('.alert-error').hide();
    }

  , deleteAccount: function () {
      var doIt
        , reason = $('#account-delete-reason').val()
        ;

      if (reason.length === 0) { alert('Please give us a reason, we want to improve tldr.io!'); return; }
      doIt = confirm('Are you really sure you want to delete your account? There is no turning back, we won\'t be able to restore it!');
      if (!doIt) { return; }

      $.ajax({ url: env.apiUrl + '/users/you'
             , type: 'DELETE'
             , data: { reason: reason }
             })
        .done(function () {
          alert("Your account has been deleted");
          window.location = '/';
        });
    }

  , fetchSuccess: function () {
      DEVMODE && console.log('[ManageAccountView] You are logged in');
    }

  , fetchError: function () {
      DEVMODE && console.log('[ManageAccountView] Nobody islogged in');
    }

    // Fetch the model and render the view with optional renderOptions
  , prepareModelForRender: function (renderOptions) {
      var self = this;

      this.model.on('change', this.render);

      this.model.fetch()
        .done(this.fetchSuccess)
        .fail(this.fetchError)
        .always(function () { self.render(renderOptions); });
    }

  , resendConfirmToken: function () {
      this.$('#'+ 'account-validation-status').html('A new validation link was just sent at ' + this.model.get('email'));
      this.model.resendConfirmToken();
    }


  , submitNewGravatarEmail: function (event) {
      DEVMODE && console.log('[ManageAccountView] submit new Gravatar email');
      event.preventDefault();
      var data = { newGravatarEmail: this.$('#new-gravatar-email').val() };
      this.model.updateGravatarEmail(data)
        .done(this.updateGravatarSuccess)
        .fail(this.updateGravatarError);
    }

  , submitNewProfile: function (event) {
      DEVMODE && console.log('[ManageAccountView] submit new profile');
      event.preventDefault();
      var data = { email: this.$('#account-form-email').val()
                 , username: this.$('#account-form-username').val()
                 , bio: this.$('#account-form-bio').val()
                 , twitterHandle: this.$('#account-form-twitterHandle').val()
                 };
      this.model.save(data, { success: this.updateProfileSuccess
                            , error: this.updateProfileError
                            , silent: true
                            , wait: true });

    }

  , submitNewPassword: function (event) {
      DEVMODE && console.log('[ManageAccountView] submit new password');
      event.preventDefault();
      var data = { oldPassword: this.$('#'+ 'account-form-old-pwd').val()
                 , newPassword: this.$('#'+ 'account-form-new-pwd').val()
                 , confirmPassword: this.$('#'+ 'account-form-confirm-pwd').val()
                 };
      this.model.updatePassword(data)
        .done(this.updatePwdSuccess)
        .fail(this.updatePwdError);
    }

  , submitNewNotifSettings: function (event) {
      DEVMODE && console.log('[ManageAccountView] submit new notification settings');
      event.preventDefault();
      var data = { notificationsSettings : { read: this.$('#account-notif-tldrread').is(':checked')
                                           , serviceUpdates: this.$('#account-notif-service-updates').is(':checked')
                                           , newsletter: this.$('#account-notif-tldrnewsletter').is(':checked')
                                           , congratsTldrViews: this.$('#account-notif-congratsTldrViews').is(':checked')
                                           , postForum: this.$('#account-notif-postForum').is(':checked')
                                           , thank: this.$('#account-notif-thank').is(':checked')
                                           , edit: this.$('#account-notif-edit').is(':checked')
                                           }
                 };

      this.model.save(data, { success: this.updateNotifSettingsSuccess
                            , error: this.updateNotifSettingsError
                            , silent: true
                            , wait: true });
    }

  , validateChange: function(event) {

      //Dont do anything on <tab>
      // bevause we don't want to trigger validation when
      // jumping from one input to the following with tab
    // dont validate on enter too

      if (event.keyCode !== 9 && event.keyCode !== 13) {
        var current = this.$(event.currentTarget)
          , field = current.attr('name')
          , value = current.val()
          , help = current.siblings('.help-block')
          , newPwdValue
          , validMessage
          , invalidMessage
          , isValid;

        if (event.type === 'focusout' && !value) {
          return;
        }

        switch(field) {
          case 'email':
            isValid = this.model.validateEmail(value);
            invalidMessage = 'Please enter a proper formatted email';
            validMessage = 'You have a rockstar email address';
            break;
          case 'newPassword':
            isValid = this.model.validatePassword(value);
            invalidMessage = 'Password should contain at least 6 characters';
            validMessage = 'That\'s a reasonable password';
            this.validateChange({ currentTarget: '#'+'account-form-confirm-pwd', origin: 'sibling'});
            break;
          case 'username':
            isValid = this.model.validateUsername(value);
            invalidMessage = 'Username should have between 3 and 16 alphanumerical characters';
            validMessage = 'This username rocks';
            break;
          case 'bio':
            isValid = this.model.validateBio(value);
            invalidMessage = 'Bio should be less than 500 characters long';
            validMessage = 'Great story!';
            break;
          case 'twitterHandle':
            isValid = this.model.validateTwitterHandle(value);
            invalidMessage = 'Twitter handle should begin with \'@\' and less than 15 characters long';
            validMessage = 'Nice handle';
            break;
          case 'confirmPassword':
            if ((event.origin === 'sibling') && !value) {
              return; // Special case when manually triggerd and no input is in confirmed field
            }
            newPwdValue = this.$('#'+'account-form-new-pwd').val();
            if (this.model.validatePassword(newPwdValue)) {
              isValid = value && (value === newPwdValue);
              invalidMessage = 'New Password and Confirmation mismatch';
              validMessage = 'New Password and Confirmation match';
            }

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

  , updateGravatarSuccess: function (data) {
      this.$('.current-gravatar').attr('src', data.gravatar.url + '&s=130');
    }

  , updateGravatarError: function (jqXHR) {
      var res = jqXHR.responseText
        , message = res ? res: 'Whoops, a strange error happened! Please try again ...';

      this.render({ flashError: message , tab: { avatar: true } });
    }

  , updateNotifSettingsSuccess: function(model) {
      DEVMODE && console.log('[ManageAccountView] Update notif successful', model);
      this.render({ flashSuccess: 'Your notification preferences have been successfully updated', tab: { notif: true } });
    }

  , updateNotifSettingsError: function(model) {
      DEVMODE && console.log('[ManageAccountView] Update notif failed', model);
      this.render({ flashError: 'We are sorry but we couldn\'t update your notifications preferences', tab: { notif: true } });
    }

  , updatePwdError: function(jqXHR, statusText, error) {
      var message
        , validationErrors;

      if (jqXHR.status === 403) {
        validationErrors = JSON.parse(jqXHR.responseText);
        DEVMODE && console.log('[ManageAccountView] update failed - Information provided was invalid', validationErrors, this.model);
        if (_.has(validationErrors, 'oldPassword')) {
          message = validationErrors.oldPassword;
        }
        else if (_.has(validationErrors, 'confirmPassword')) {
          message = validationErrors.confirmPassword;
        }
        else if (_.has(validationErrors, 'newPassword')) {
          message = validationErrors.newPassword;
        }
        this.render({ flashError: message, tab: { password: true } });
        this.$('#' + 'account-form-old-pwd').focus();
      } else {
        DEVMODE && console.error('[ManageAccountView] update failed with status different than 403', validationErrors);
      }
  }

  , updatePwdSuccess: function(data) {
      DEVMODE && console.log('[ManageAccountView] Update passwrod successful', data);
      this.render({ flashSuccess: 'Your password was successfully updated' , tab: { password: true } });
      this.$('#' + 'account-form-old-pwd').focus();
    }

  , updateProfileError: function(model, jqXHR) {
      var duplicateField
        , message
        , selector
        , validationErrors;

      if (jqXHR.status === 403) {
        validationErrors = JSON.parse(jqXHR.responseText);
        DEVMODE && console.log('[ManageAccountView] update failed - Information provided was invalid', validationErrors, this.model);
        if (_.has(validationErrors, 'email')) {
          message = validationErrors.email;
          selector = '#' + 'account-form-email';
        }
        else if (_.has(validationErrors, 'username')) {
          message = validationErrors.username;
          selector = '#' + 'account-form-username';
        }
        else if (_.has(validationErrors, 'bio')) {
          message = validationErrors.bio;
          selector = '#' + 'account-form-bio';
        }
        else if (_.has(validationErrors, 'twitterHandle')) {
          message = validationErrors.twitterHandle;
          selector = '#' + 'account-form-twitterHandle';
        }

      } else if (jqXHR.status === 409) {
        DEVMODE && console.log('[SignupFormView] Signup failed - email or username already exists');
        duplicateField = JSON.parse(jqXHR.responseText).duplicateField;
        switch(duplicateField) {
          case 'email':
            message = 'This email is already taken';
            selector = '#' + 'account-form-email';
            break;
          case 'usernameLowerCased':
            message = 'This username is already taken';
            selector = '#' + 'account-form-username';
            break;
        }
      }
      this.render({ flashError: message, tab: { profile: true } });
      this.$(selector).focus();
    }

  , updateProfileSuccess: function(model) {
      DEVMODE && console.log('[ManageAccountView] Update profile successful', model);
      // Dont store the passwrod info
      this.render({ flashSuccess: 'Your profile was successfully updated', tab: { profile: true } });
      this.$('#' + 'account-form-email').focus();
    }


  });

  return ManageAccountView;
});



