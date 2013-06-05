/**
 * Tldr Collection
 */


define([
  'backbone'
, 'lib/environment'
, 'models/shared/tldrModel'], function(Backbone, env, TldrModel){
    var TldrCollection = Backbone.Collection.extend({

      model: TldrModel,

      fetchSize: 5,

      initialize: function() {
         DEVMODE && console.log('[TldrCollection] Init with server Url', env.apiUrl);
         this.url = env.apiUrl + '/tldrs/latest/' + this.fetchSize;
       }
    });

    return TldrCollection;
  }
);
