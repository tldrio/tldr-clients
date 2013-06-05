 /**
 * EditView
 */

define([
  'jquery'
, 'underscore'
, 'Mustache'
, 'backbone'
, 'lib/environment'
, 'lib/mediator'
, 'lib/thirdPartyCookiesDetection'
, 'views/shared/loginForm'
, 'text!templates/iframe/edit.mustache'
, 'text!templates/iframe/bullet.mustache'
, 'text!templates/iframe/deleteBullet.mustache'
, 'text!templates/iframe/guidelines.mustache'
],
function ( $
         , _
         , Mustache
         , Backbone
         , env
         , app
         , thirdPartyCookiesDetection
         , LoginFormView
         , template
         , bulletTemplate
         , deleteBulletTemplate
         , guidelinesTemplate
         ) {

  var EditView = Backbone.View.extend({

    events: function () {
      var events = {};
      events['click .edit-control-cancel'] = 'cancel';
      events['click .edit-control-save'] = 'save';
      events['click .edit-control-login'] = 'loginToSign';
      events['click .edit-delete-bullet'] = 'deleteBullet';
      events['click .read-summary-guidelines > a'] = 'showSummaryGuidelines';
      events['click .guidelines-container button'] = 'hideSummaryGuidelines';
      events['click .edit-control-save-anonymously'] = 'saveAnonymously';
      events['input .edit-metadata'] = 'handleInputKeypress';
      events['input .edit-bullet'] = 'handleBulletChange';
      events['blur .edit-bullet'] = 'handleBlur';
      events['blur .edit-metadata'] = 'handleBlur';
      events['input .edit-bullet:last'] = 'handleKeyupOnLastBullet';
      events['input textarea'] = 'makeExtensible';
      events['change select'] = 'selectCategories';
      return events;
    }

  , className: 'tldr-main'

  , initialize: function (options) {
      DEVMODE && console.log('[EditView] Init');

      _.bindAll( this
               , 'cancel'
               , 'cleanWhitespace'
               , 'disableSave'
               , 'enableSave'
               , 'focusOnLastBullet'
               , 'getBulletContainer'
               , 'getBulletTextarea'
               , 'getBulletWrapper'
               , 'getBulletNumberIncludingEmptyBullets'
               , 'handleBlur'
               , 'handleBulletChange'
               , 'handleInputKeypress'
               , 'handleMetadataValidationError'
               , 'handleSummaryValidationError'
               , 'loginToSign'
               , 'makeExtensible'
               , 'prepareCategories'
               , 'render'
               , 'save'
               , 'saveAnonymously'
               , 'selectCategories'
               , 'showSummaryGuidelines'
               , 'showOnboardingContribution'
               );
      this.prepareCategories();
      this.template = options.template || template;
      this.bulletTemplate = options.bulletTemplate || bulletTemplate;
      this.deleteBulletTemplate = options.deleteBulletTemplate || deleteBulletTemplate;
      // check if 3rd party cookies are enabled
      this.thirdPartyCookiesEnabled = thirdPartyCookiesDetection.isEnabled();

      app.on('validationError:summary', this.handleSummaryValidationError, this);
      app.on('validationError:metadata', this.handleMetadataValidationError, this);
      app.on('validationError:categories', this.handleCategoriesValidationError, this);
      app.on('validationError:summary validationError:metadata validationError:categories', this.disableSave);
      app.on('input:valid', this.enableSave);
      app.on('onboardingContribution', this.showOnboardingContribution);
      app.on('toggleTldr:edit', this.focusOnLastBullet);
      // Reference user model
      this.userModel = options.userModel;
      this.userModel.on('change', this.render);

      this.editedOneBullet = false;
    }

  , render: function () {
      DEVMODE && console.log('[EditView] render');
      var self = this
        , options = _.extend( {}
                           , this.model.toJSONForDisplay()
                           , { thirdPartyCookiesEnabled: this.thirdPartyCookiesEnabled }
                           , this.userModel.toJSONForDisplay()
                           , { firstContrib: this.firstContrib }
                           , { categories: this.categories }
                           );
      options.isNew = this.model.isNew();

      this.$el.html(Mustache.render( this.template
                                   , options
                                   , { bullet: this.bulletTemplate, guidelines: guidelinesTemplate }
                                   ));
      // Remove last textarea if max bullets is already reached
      // so we can't add a new one
      if (this.$('.edit-bullet-container').length > app.MAX_BULLETS){
        this.$('.edit-bullet-container:last').remove();
      }

      // display character counts on bullets
      this.$('.edit-bullet-container').each(function(index, bulletContainer) {
        self.displayCharacterCount($(bulletContainer));
      });

      // disable saving if summary is empty or user is not logged in
      if (this.model.isSummaryEmpty() || this.model.isCatetoryEmpty() || this.userModel.isNew()) {
        this.disableSave();
      }

      // Fill the existing categoy if any
      if (this.model.has('categories') && this.model.get('categories').length > 0) {
        $('.select-topic select').val(this.model.get('categories')[0].name);
      }

      return this;
    }

  , cancel: function () {
      app.trigger('cancel:edit');
    }

  , cleanWhitespace: function (data) {
      // Remove leading and trailing whitespace, carriage returns...
      // TODO are you sure about that regex?
      return data.replace(/^[\r\n\s\t]+|[\r\n\s\t]+$/g, "");
    }

  , getBulletNumberIncludingEmptyBullets: function (bulletNumber) {
      var nonEmptyCount = 0
        , totalCount = 0
        , self = this
        ;
      this.$('.' + 'edit-bullet-container').each(function () {
        if (self.getBulletTextarea($(this)).val() !== '') {
          ++nonEmptyCount;
        }
        if (nonEmptyCount <= bulletNumber) {
          ++totalCount;
        }
      });
      return totalCount;
    }

  , deleteBullet: function (event) {
      DEVMODE && console.log('[EditView] Delete Bullet', this);
      var currentBulletContainer = this.getBulletContainer(this.$(event.currentTarget))
        , lastBullet;

      // Remove bullet
      currentBulletContainer.remove();
      lastBullet = this.$('.' + 'edit-bullet-container' + ':last');
      // Add new bullet at the end if last is non-empty
      if (this.$('.' + 'edit-bullet' + ':last').val()) {
        // Append new empty bullet if last one is not an empty one
        lastBullet.after(Mustache.render(this.bulletTemplate, {}));
      }
      // select newly created last bullet
      lastBullet = this.$('.' + 'edit-bullet' + ':last');
      // Set focus on last bullet
      lastBullet.focus();
      // Manually trigger this function to update the model
      this.handleBulletChange(event);
    }

  , disableSave: function () {
      DEVMODE && console.log('[EditView] disable Save');
      this.$('.'+ 'edit-control-save').attr('disabled', 'disabled');
    }

  , displayCharacterCount: function ($bulletContainer) {
      var count = $bulletContainer.find('.edit-bullet')
                                  .val()
                                  .length;
      $bulletContainer.find('.character-count')
                      .html(count + '/' + app.MAX_BULLET_LENGTH);
    }

  , focusOnLastBullet: function () {
      this.$('.edit-bullet:first').focus();
    }

  , getBulletContainer: function ($element) {
      return $element.parents('.' + 'edit-bullet-container');
    }

  , getBulletWrapper: function ($element) {
      return $element.parents('.' + 'edit-bullet-wrapper');
    }

  , getBulletTextarea: function ($element) {
      return $element.find('.' + 'edit-bullet');
    }

  , enableSave: function () {
      // Dont enable save if no user is logged in
      if (!this.userModel.isNew() ) {
        DEVMODE && console.log('[EditView] enable save');
        this.$('.'+ 'edit-control-save').removeAttr('disabled');
      }
    }

  , handleBlur: function (event) {
      DEVMODE && console.log('[EditView] handleBlurOnBullet');
      var val
        , normVal
        ;

      val = this.$(event.currentTarget).val();
      // Remove leading and trailing whitespace, carriage returns...
          normVal = this.cleanWhitespace(val);
      if (normVal) {
        // Set input with normalized value
        this.$(event.currentTarget).val(normVal);
      }
    }

  , handleBulletChange: function (event) {
      DEVMODE && console.log('[Summary View] handleBulletChange');
      var data = []
        , self = this
        , edits
        , $editBullet = this.$(event.currentTarget)
        , $editBulletContainer = this.getBulletContainer($editBullet);

      if (! this.editedOneBullet) {
        this.editedOneBullet = true;
        mixpanel.tldr_d4a6ebe3.track("[TldrEdit] Edited one bullet", { url: this.model.get('url'), timeStamp: (new Date()).toISOString() });
      }

      if ($editBulletContainer.length > 0) {
        // We remove the validatino-error class if it was present
        // By doing it systemically we avoid keeping state of valid/invalid bullets
        $editBulletContainer.removeClass('error');

        // Display the character count next to the bullet
        // This handler may have been manually triggered by a bullet deletion. If that's the case, no character count should be displayed
        this.displayCharacterCount($editBulletContainer);
      }

      this.$('.edit-bullet').each(function () {
        var val = $(this).val()
          , normVal = self.cleanWhitespace(val);
        if (normVal) {
          data.push(normVal);
        }
      });

      edits = { summaryBullets: data };
      app.trigger('edit', edits);
    }

  , handleInputKeypress: function (event) {
      var currentTarget = event.currentTarget
        , role = this.$(currentTarget).data('tldr-role')
        , val = this.$(currentTarget).val()
        , normVal = this.cleanWhitespace(val)
        , edits = {};

      this.$(currentTarget).parent().removeClass('error');
      edits[role] = normVal;
      app.trigger('edit', edits);
    }

  , handleKeyupOnLastBullet: function (event) {
      DEVMODE && console.log('[SummaryView] Editing new bullet on last textarea', event);
      if (this.cleanWhitespace($(event.currentTarget).val())) {
        var current = this.$(event.currentTarget);

        // Add trash icon and current number of characters (i.e., 1)
        if (this.getBulletContainer(current).find('.trash-bullet-icon').length === 0) { // Insert delete icon only once
          this.getBulletWrapper(current).after(Mustache.render(this.deleteBulletTemplate, { maxBulletLength: app.MAX_BULLET_LENGTH }));
          this.displayCharacterCount(this.getBulletContainer(current));
        }
        if (this.$('.' + 'edit-bullet').length < app.MAX_BULLETS) { // limit to MAX_BULLETS
          this.getBulletContainer(current).after(Mustache.render(this.bulletTemplate, {}));
        }
      }
    }

  , handleSummaryValidationError: function (bulletNumber, message) {
      if (!_.isUndefined(bulletNumber)) {
        DEVMODE && console.log('[Summary Validation Error]', bulletNumber, this.getBulletNumberIncludingEmptyBullets(bulletNumber), message);
        // Add validation-error class to the specific bulletNumber
        this.$('.' + 'edit-bullet-container' + ':eq('+this.getBulletNumberIncludingEmptyBullets(bulletNumber)+')').addClass('error');
        // bulletNumber+3 here is to skip the metadata inputs
        this.$('.edit-bullet-container:eq('+(this.getBulletNumberIncludingEmptyBullets(bulletNumber))+') .tldr-error-msg').html(message);
      }
    }

  , handleCategoriesValidationError: function (field, message) {
      DEVMODE && console.log('[Categories Validation Error]', field, message);
      this.$('.select-topic').addClass('error');
      this.$('.select-topic .tldr-error-msg').html(message);
    }

  , handleMetadataValidationError: function (field, message) {
      DEVMODE && console.log('[Metadata Validation Error]', field, message);
      var selector = '[data-tldr-role="' + field + '"]';
      this.$(selector).parent('.control-group').addClass('error');
      this.$(selector + ' + .' + 'tldr-error-msg').html(message);
    }

  , loginToSign: function () {
      DEVMODE && console.log('[EditView] Login To sign');
      this.vloginForm || (this.vloginForm = new LoginFormView({ model: this.userModel, context: 'iframe' }) );
      this.vloginForm.on('cancel:loginForm', this.render );
      this.vloginForm.on('success:loginForm', this.render );
      this.vloginForm.setElement('.'+ 'edit-control-pre-save-info');
      this.vloginForm.render();
    }

  , makeExtensible: function (event) {
      var textarea = this.$(event.currentTarget)
        , span = textarea.siblings('pre').find('span');

      span.text(textarea.val());
    }

  , prepareCategories: function () {
      var self = this;

      $.ajax({ url: env.apiUrl + '/categories'
             , dataType: 'json'
             })
       .done(function (data) {
         self.categories = _.sortBy(data, 'name');
         self.render();
       });
    }

  , showOnboardingContribution: function (event) {
      this.firstContrib = true;
      this.render();
      this.showSummaryGuidelines();
    }

  , saveAnonymously: function (event) {
      this.model.set({ anonymous: $(event.currentTarget).children('input').is(':checked') }, { silent: true });
    }

  , save: function () {
      app.trigger('save');
    }

  , selectCategories: function (event) {
      var categories = []
        , topic = $(event.currentTarget).find(':selected').html();

      $(event.currentTarget).parents('.control-group').removeClass('error');
      // topic = "" means there is no topic selected
      if (topic) {
        categories.push({ name: topic });
      }

      app.trigger('edit', { categories: categories });
    }

  , showSummaryGuidelines: function () {
      this.$('.guidelines-container').show();
      this.$('.display-guidelines').hide();
    }

  , hideSummaryGuidelines: function () {
      this.$('.display-guidelines').show();
      this.$('.guidelines-container').hide();
      this.focusOnLastBullet();
    }

  });

  return EditView;
});

