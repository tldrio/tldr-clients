define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'lib/environment'
, 'lib/mediator'
, 'text!templates/shared/thank.mustache'
, 'bootstrap'
],
function($, _, Backbone, Mustache, env, app, template, bootstrap) {

  var ThankView = Backbone.View.extend({

    events: {
      'click .thank': 'thankContributor'
    }

  , className: 'thank-container'

  , initialize: function (options) {
      DEVMODE && console.log('[ThankView] Init');
      // Bind execution context
      _.bindAll( this
               , 'render'
               , 'thankContributor'
               );

      this.template = options.template || template;
      this.userModel = options.userModel;
    }

  , render: function () {
      // Render the template
      DEVMODE && console.log('[ThankView] Render ' );
      var opts = {};

      if (_.contains(this.model.get('thankedBy'), this.userModel.get('_id')) ) {
        opts.thankNotAllowed = true;
        opts.alreadyThanked = true;
      }

      this.$el.html(Mustache.render(this.template, opts));
      return this;
    }

  , thankContributor: function (event) {
      var self = this
        , $currentTarget = $(event.currentTarget);

      if ($currentTarget.hasClass('muted')) {
        return;
      }
      if (this.userModel.isNew()) {
        app.trigger('switchToLoginForm', { message: 'Please log in to thank a contributor' });
        return;
      }
      mixpanel.tldr_d4a6ebe3.track('[Thank]', { url: this.model.get('url'), timeStamp: (new Date()).toISOString() });
      $.ajax({ url: env.apiUrl + '/tldrs/'+ this.model.get('_id') +'/thank'
             , dataType: 'json'
             , type: 'PUT'
             })
             .done(function(data) {
               self.model.set(data);
               self.render();
             });

      $currentTarget.addClass('muted');

    }


  });

  return ThankView;
});
