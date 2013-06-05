/**
 * Mediator Module
 */

define([
  'underscore'
, 'backbone'], function(_, Backbone){

  var app = {};
  // add event emitter capabilities to the mediator
  _.extend(app, Backbone.Events);

  app.MAX_BULLETS = 5;
  app.MAX_BULLET_LENGTH = 160;
  app.MAX_TITLE_LENGTH = 200;
  app.MAX_RESOURCE_AUTHOR_LENGTH = 20;

  return app;
});

