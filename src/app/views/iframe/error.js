 /**
 * ErrorView
 */

define([
  'jquery'
, 'underscore'
, 'backbone'
, 'text!templates/iframe/error.mustache'
],

function ( $
         , _
         , Backbone
         , template
         ) {

  var ErrorView = Backbone.View.extend({
    className: 'error-container'

  , initialize: function () {
      _.bindAll( this
               , 'render'
               );
    }

  , render: function () {
      DEVMODE && console.log('[ErrorView] Render');
      this.$el.html(template);
      return this;
    }

  , template: template
  });

  return ErrorView;
});
