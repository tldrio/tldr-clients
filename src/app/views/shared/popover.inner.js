define([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'Mustache'
        , 'backbone'
        , 'underscore'
        , 'lib/environment'
        , 'lib/mediator'
        , 'models/shared/userModel'
        , 'models/shared/tldrModel'
        , 'views/shared/loginForm'
        , 'views/shared/tldr.read'
        , 'views/shared/payOrWork'
        , 'views/shared/preview'
        , 'views/iframe/edit'
        , 'views/iframe/nav'
        , 'text!templates/iframe/container.popover.mustache'
        ],
function (
  devmodeRetroCompatibility
, $
, Mustache
, Backbone
, _
, env
, app
, UserModel
, TldrModel
, LoginFormView
, ReadView
, PayOrWorkView
, Preview
, EditView
, NavView
, template
) {

  var PopoverInnerView = Backbone.View.extend({

   initialize: function (options) {
      var self = this;
      DEVMODE && console.log('[Popover] Init');
      // Bind execution context
      _.bindAll( self
               , 'render'
               , 'switchToEditMode'
               , 'switchToLoginForm'
               , 'switchToReadMode'
               , 'switchToSignup'
               , 'syncTldrDataWithBackground'
               , 'syncPreviewDataWithBackground'
               , 'reportCtaImproveSummaryToParent'
               );

      // Initialize state
      this.editState = false;
      this.DEFAULT_POPOVER_WIDTH = 592;
      this.ARTICLE_POPOVER_WIDTH = 455;
      this.MEDIUM_POPOVER_WIDTH = 400;
      this.SMALL_POPOVER_WIDTH = 320;

      app.on('cancel:edit', this.switchToReadMode); // User clicked on cancel button of edit view
      app.on('save', this.switchToReadMode); // User clicked on save button
      app.on('switchToEditMode', this.switchToEditMode);
      app.on('switchToLoginForm', this.switchToLoginForm);
      app.on('switchToReadMode', this.switchToReadMode);
      app.on('switchToSignup', this.switchToSignup);

      this.registerListenersForBackgroundPage();

      this.userModel = options.userModel;
      this.tldrModel = options.tldrModel;
      this.template = template;

      // Sync the data with the background
      this.tldrModel.on('change', this.syncTldrDataWithBackground);

      this.loginFormView = new LoginFormView({ model: this.userModel, className: 'tldr-main' });
      this.readView = new ReadView({ model: this.tldrModel, userModel: this.userModel });
      this.editView = new EditView({ model: this.tldrModel, userModel: this.userModel });
      this.navView = new NavView({ model: this.tldrModel, userModel: this.userModel });
      this.preview = new Preview({ userModel: this.userModel });
      this.payOrWorkView = new PayOrWorkView({ userModel: this.userModel });

      // Come back to read view when login is done
      this.loginFormView.on('cancel:loginForm success:loginForm', this.switchToReadMode);

      this.preview.on('cta-improve-summary', this.reportCtaImproveSummaryToParent);
      this.preview.on('syncData', this.syncPreviewDataWithBackground);
      // Init Nav View
      this.subviews = {};

      this.adjustPopoverHeight();
    }

  , render: function () {
      DEVMODE && console.log('[ContainerView] Render');
      this.$el.html(Mustache.render( this.template
                                   , _.extend({}, this.tldrModel.toJSONForDisplay())
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

  , adjustPopoverHeight: function () {
      var previousHeight = $('body').height()
        , self = this;
      window.setInterval(function (argument) {
        var currentHeight = $('body').height();
        if (currentHeight !== previousHeight) {
          previousHeight = currentHeight;
          DEVMODE && console.log('[Iframe Main] Setting popover height to', currentHeight);
          self.sendMessageToParent({ action: 'SET_POPOVER_HEIGHT'
                                    , height: $('body').height()
          });
        }
      }, 20);
  }

  , registerListenersForBackgroundPage: function () {
      var self = this;

      this.listenForMessageFromParent(function (message) {
        var width = self.DEFAULT_POPOVER_WIDTH;
        switch(message.action) {
          case 'PRERENDER_POPOVER':
            self.tldrModel.set(message.tldrData);
            self.hostname = message.hostname;
            if (self.hostname === 'news.ycombinator.com') {
              if (!self.userModel.get('username')) {
                self.subviews.main = self.loginFormView;
              } else {
                if (self.userModel.get('canHover')) {
                  self.subviews.nav = self.navView;
                  self.subviews.main = self.readView;
                } else {
                  delete self.subviews.nav;
                  self.subviews.main = self.payOrWorkView;
                }
              }
            } else {
              self.subviews.nav = self.navView;
              self.subviews.main = self.readView;
            }
            self.previewMode = false;
            self.render();
            // DEfault width. we need to restore it if we had a twitter preview before
            $('body').width(self.DEFAULT_POPOVER_WIDTH);
            self.sendMessageToParent({ action: 'SET_POPOVER_HEIGHT'
                                      , height: $('body').height()
                                      , width: self.DEFAULT_POPOVER_WIDTH
            });

            break;
          case 'PRERENDER_PREVIEW_POPOVER':
            self.preview.setPreviewData(message.previewData);
            self.subviews.main = self.preview;
            delete self.subviews.nav;
            self.previewMode = true;
            self.render();
            // We fix a special width for the twitter preview
            if (message.previewData.type === 'twitter' || message.previewData.type === 'youtube') {
              width = self.SMALL_POPOVER_WIDTH;
            }
            if (message.previewData.type === 'article' ) {
              width = self.ARTICLE_POPOVER_WIDTH;
            }
            if (message.previewData.type === 'wikipedia' ) {
              width = self.MEDIUM_POPOVER_WIDTH;
            }
            $('body').width(width);
            self.sendMessageToParent({ action: 'SET_POPOVER_HEIGHT'
                                      , height: $('body').height()
                                      , width: width
            });
            break;
          case 'PLACE_POPOVER_TIP':
            DEVMODE && console.log('PLACEMENT', message.placement);
            self.$el.parent(':first').addClass(message.placement);
            break;
          case 'REMOVE_POPOVER_TIP':
            self.switchToReadMode();
            self.$el.parent(':first').removeClass();
            break;
          case 'SYNC_USER_DATA':
            if (_.keys(message.data).length > 0) {
              self.userModel.set(message.data);
            } else {
              self.userModel.clear();
            }
            break;
          case 'TRACK_HOVER':
            mixpanel.tldr_d4a6ebe3.track('[TldrRead]', { url: message.url
                                                       , timeStamp: (new Date()).toISOString()
                                                       , referrer: message.referrer
                                                       , channel: 'Badge' });
            mixpanel.tldr_d4a6ebe3.people.increment({ "readCount": 1
                                                    , "readViaCRX": 1
                                                    , "readWithBadge": 1
                                                    , "readsSinceLastContribution": 1
            });
            break;
        }

      });

    }

  , listenForMessageFromParent: function(message) {
      throw new Error('You should override listenForMessageFromParent');
    }
  , sendMessageToParent: function(message) {
      throw new Error('You should override sendMessageToParent');
    }

  , syncPreviewDataWithBackground: function(previewData) {
      this.sendMessageToParent({ action: 'UPDATE_PREVIEW_DATA'
                               , previewData: previewData });
    }
  , reportCtaImproveSummaryToParent: function(previewData) {
      this.sendMessageToParent({ action: 'CTA_IMPROVE_SUMMARY'
                               , previewData: previewData });
    }

  , syncTldrDataWithBackground: function (model) {
      this.sendMessageToParent({ action: 'UPDATE_TLDR_DATA'
                               , tldrData: model.attributes });
    }

  , switchToSignup: function () {
      window.open(env.websiteUrl + '/signup', '_blank');
    }

  , switchToEditMode: function (event) {
      DEVMODE && console.log('[Popover] Switch to Edit Mode');
      this.sendMessageToParent({ action: 'SWITCH_POPOVER_IN_EDIT_MODE'
                               , tldrId: this.tldrModel.get('_id')});
      this.subviews.main = this.editView;
      this.render();
    }

  , switchToLoginForm: function (options) {
      DEVMODE && console.log('[Popover] Switch to Login Form');
      if (options) {
        this.loginFormView.setMessage(options.message);
      } else {
        this.loginFormView.setMessage(null);
      }
      this.subviews.main = this.loginFormView;
      this.render();
    }

  , switchToReadMode: function (data) {
      DEVMODE && console.log('[Popover] Switch to Read Mode');
      if (this.previewMode) {
        this.subviews.main = this.preview;
      } else {
        if (this.hostname === 'news.ycombinator.com') {
          if (!this.userModel.get('username')) {
            this.switchToLoginForm();
          } else {
            if (this.userModel.get('canHover') || (data && data.tldrlater)) {
              this.subviews.nav = this.navView;
              this.subviews.main = this.readView;
            } else {
              this.subviews.main = this.payOrWorkView;
            }
          }
        } else {
          this.subviews.main = this.readView;
        }
      }
      this.render();
    }
  });

  return PopoverInnerView;

});
