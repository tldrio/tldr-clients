 /**
 * ContainerView
 */

define(
[ 'jquery'
, 'underscore'
, 'Mustache'
, 'backbone'
, 'easyXDM'
, 'lib/mediator'
, 'lib/environment'
, 'views/iframe/congratulations'
, 'views/iframe/edit'
, 'views/iframe/error'
, 'views/iframe/nav'
, 'views/shared/tldr.read'
, 'views/shared/loginForm'
, 'views/shared/signup'
, 'text!templates/iframe/container.mustache'
],
function ( $
         , _
         , Mustache
         , Backbone
         , easyXDM
         , app
         , env
         , CongratsView
         , EditView
         , ErrorView
         , NavView
         , ReadView
         , LoginFormView
         , Signup
         , template
         ) {

  var ContainerView = Backbone.View.extend({
    className: 'tldr-container'

  , initialize: function (options) {
      var self = this;
      DEVMODE && console.log('[ContainerView] Init');
      // Bind execution context
      _.bindAll( self
               , 'render'
               , 'renderError'
               , 'fetchComplete'
               , 'fetchError'
               , 'fetchSuccess'
               , 'handleToggleTldr'
               , 'initReadEditViews'
               , 'removeCongrats'
               , 'saveSuccess'
               , 'switchToEditMode'
               , 'switchToLoginForm'
               , 'switchToReadMode'
               , 'switchToSignup'
               );

      // Initialize state
      this.editState = false;

      app.on('cancel:edit', this.switchToReadMode); // User clicked on cancel button of edit view
      app.on('removeCongrats', this.removeCongrats);  // congrats view asks to be removed
      app.on('fetchError', this.renderError); // Couldt not fetch Tldr -> Api down most probably
      app.on('save', this.switchToReadMode); // User clicked on save button
      app.on('saveSuccess', this.saveSuccess); // tldr successfully saved
      app.on('switchToEditMode', this.switchToEditMode);
      app.on('switchToLoginForm', this.switchToLoginForm);
      app.on('switchToReadMode', this.switchToReadMode);
      app.on('switchToSignup', this.switchToSignup);
      app.on('toggleTldr', this.handleToggleTldr);
      app.on('render', this.render);

      this.userModel = options.userModel;

      // Keep track of subviews views
      // Init Nav View
      this.subviews = {};
      this.subviews.nav = new NavView({ model: this.model, userModel: this.userModel });
      this.model.on('resetSilently', this.switchToEditMode);

      if (!has('extension')) {
        // Fetch tldr model data
        this.model.fetch()
          .done(this.fetchSuccess)
          .fail(this.fetchError)
          .always(this.fetchComplete);
      } else {
        if (this.model.isNew()) {
          this.fetchError({status: 404});
        } else {
          this.fetchSuccess(this.model.attributes);
        }
        this.fetchComplete();
      }
    }

  , render: function () {
      DEVMODE && console.log('[ContainerView] Render');
      this.$el.html(Mustache.render( template
                                   , _.extend({}, this.model.toJSONForDisplay())
                                   ));
      // bind subviews to DOM recursively and render them
      this.renderSubViews();
      return this;
    }

  , renderSubViews: function () {
      _.each(this.subviews, function (view) {
        view.setElement(this.$('.' + view.className));
        view.render();
      }, this);
    }

  , close: function () {
      DEVMODE && console.log('[ContainerView] Close');
      app.provider.closeOverlay();
    }

  , fetchComplete: function () {
      DEVMODE && console.log('[ContainerView] fetch complete');
      this.render();
    }

  , fetchError: function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 404) {
        this.scrapedMetadata = app.provider.scrapeMetadata();
        app.trigger('edit', this.scrapedMetadata);
        this.switchToEditMode();
      } else {
        delete this.subviews.nav; // delete nav to just have the error template to display
        this.subviews.main = new ErrorView();
        this.render();
        DEVMODE && console.log('[Containerview] No connection to API. jqXHR: ', jqXHR);
      }
    }

  , fetchSuccess: function (data) {
      DEVMODE && console.log('[ContainerView] fetch success', data);
      // populate the model with the response
      this.model.set(data);
      // create the subviews
      this.initReadEditViews(this.model);
      this.subviews.main = this.vread;

      if (!has('extension')) {
        // Record that this tldr was read once
        mixpanel.tldr_d4a6ebe3.track('[TldrRead]', { url: this.model.get('url'), timeStamp: (new Date()).toISOString() });
        mixpanel.tldr_d4a6ebe3.people.increment({ "readCount": 1
                                                , "readViaBookmarklet": 1
                                                , 'readsSinceLastContribution': 1
        });
      }
    }

  , initReadEditViews: function (tldrModel) {
      this.vread = new ReadView({ model: tldrModel, userModel: this.userModel });
      this.vedit = new EditView({ model: tldrModel, userModel: this.userModel});
    }

  , handleToggleTldr: function () {
      if (this.editState) {
        app.trigger('toggleTldr:edit');
      }
    }

  , removeCongrats: function () {
      if (this.subviews.congrats) {
        DEVMODE && console.log('[ContainerView] Remove Congrats View');
        this.subviews.congrats.remove();
        delete this.subviews.congrats;
      }
    }

  , renderError: function (content) {
      DEVMODE && console.log('[ContainerView] Render error');
      this.$('#tldr-error-message').html(content);
      return this;
    }

  , saveSuccess: function (response) {
      this.vcongrats = new CongratsView({ model: this.model, response: response });
      this.subviews.congrats = this.vcongrats;
      this.render();
    }

  , switchToEditMode: function (event) {
      DEVMODE && console.log('[ContainerView] Switch to Edit Mode');
      // REmove Congrats if exists
      this.removeCongrats();
      // intantiate vedit if it's undefined
      this.vedit || (this.vedit = new EditView({ model: this.model, userModel: this.userModel }));
      // update main subviews
      this.subviews.main = this.vedit;
      // render container
      this.editState = true;
      this.render();
      // broadcast to overlay
      app.provider.switchMode('edit');

      if (!has('extension')) {
        // Tell Mixpanel user wants to edit the tldr
        mixpanel.tldr_d4a6ebe3.track("[TldrEdit] Form displayed", { url: this.model.get('url'), timeStamp: (new Date()).toISOString() });
      }
    }

  , switchToLoginForm: function (options) {
      DEVMODE && console.log('[ContainerView] Switch to Login Form');
      // REmove Congrats if exists
      this.removeCongrats();
      // intantiate vedit if it's undefined
      // override id property to set it to containerMain
      this.vloginForm || (this.vloginForm = new LoginFormView({ model: this.userModel, className: 'tldr-main' }));
      if (this.editState) {
        this.vloginForm.on('cancel:loginForm', this.switchToEditMode);
        this.userModel.on('change', this.switchToEditMode);
      } else {
        this.vloginForm.on('cancel:loginForm', this.switchToReadMode);
        this.userModel.on('change', this.switchToReadMode);
      }
      if (options) {
        this.vloginForm.setMessage(options.message);
      } else {
        this.vloginForm.setMessage(null);
      }

      // update main subviews
      this.subviews.main = this.vloginForm;
      this.render();
    }


  , switchToReadMode: function () {
      DEVMODE && console.log('[ContainerView] Switch to Read Mode');
      if (this.model.get('summaryBullets')) {
        if (!this.vread) { // The tldr has just been created
          // Record that this tldr was read once
          mixpanel.tldr_d4a6ebe3.track('[TldrRead]', { url: this.model.get('url'), timeStamp: (new Date()).toISOString() });
          mixpanel.tldr_d4a6ebe3.people.increment({ "readCount": 1
                                                  , "readViaBookmarklet": 1
          });
        }
        // intantiate vedit if it's undefined
        this.vread || (this.vread = new ReadView({ model: this.model, userModel: this.userModel }));
        // if it's not true then proceed with rendering the tldr
        this.subviews.main = this.vread;

      }
      // render container
      this.editState = false;
      this.render();
      // broadcast to overlay
      app.provider.switchMode('read');
    }


  , switchToSignup: function () {
      DEVMODE && console.log('[ContainerView] Switch to Signup');
      mixpanel.tldr_d4a6ebe3.track('[Signup] Form displayed', { timeStamp: (new Date()).toISOString() });

      this.vsignup || (this.vsignup = new Signup({ model: this.userModel, context: 'iframe', className: 'tldr-main' }));
      if (this.editState) {
        this.vsignup.on('cancel:signup', this.switchToEditMode);
        this.vsignup.on('success:signup', this.switchToEditMode);
      } else {
        this.vsignup.on('cancel:signup', this.switchToReadMode);
        this.vsignup.on('success:signup', this.switchToReadMode);
      }
      // update main subviews
      this.subviews.main = this.vsignup;
      this.render();
    }

  });

  return ContainerView;
});
