/**
 * Tldr Model
 */


define([
  'jquery'
, 'backbone'
, 'underscore'
, 'lib/environment'
, 'lib/mediator' ], function($, Backbone, _, env, app){

    var TldrModel = Backbone.Model.extend({

        idAttribute: '_id' //necessary when using mongo, see http://documentcloud.github.com/backbone/#Model-idAttribute

      , urlRoot: env.apiUrl + '/tldrs/'

      , initialize: function () {
          DEVMODE && console.log('[TldrModel] Init with apiUrl', env.apiUrl);
          //Bind execution context
          _.bindAll(this, 'setChanges', 'unsetChanges', 'saveChanges', 'saveSuccess', 'isSummaryEmpty');
          // Bind events
          app.on('edit', this.setChanges);
          app.on('cancel:edit', this.unsetChanges);
          app.on('save', this.saveChanges);
          app.on('input', this.validateModel);
        }

      , isSummaryEmpty: function () {
          return (_.isUndefined(this.get('summaryBullets')) || this.get('summaryBullets').length === 0);
        }

      , isCatetoryEmpty: function () {
          return (_.isUndefined(this.get('categories')) || this.get('categories').length === 0);
        }

      , deleteOrAnonymize: function () {
        var self = this
          , url = this.get('url')
          , title = this.get('title');

          $.ajax({ url: env.apiUrl + '/tldrs/' + this.get('_id')
                 , type: 'DELETE'
                 })
           .done(function (data, textStatus, jqXHR) {
             if (jqXHR.status === 204) {
               self.clear({ silent:true });
               self.set({ title: title, url: url },{ silent:true });
               self.trigger('resetSilently');
             } else {
               alert("Your tldr had already been moderated and couldn't be deleted so it is anonymized");
               self.set('anonymous', 'true');
               self.trigger('anonymize');
             }
           });
        }

      , saveChanges: function () {
          DEVMODE && console.log('[TldrModel] saveChanges');

          this.save({}, { success: this.saveSuccess
                        , error: this.saveError
                        }); // first argument {} is necessary if we want to provide the callbacks
        }

      , saveSuccess: function (model, response) {
          DEVMODE && console.log('[TldrModel] saveSuccess', model, response);
          mixpanel.tldr_d4a6ebe3.track("[TldrEdit] Save success", { timeStamp: (new Date()).toISOString(), url: model.get('url') });
          mixpanel.tldr_d4a6ebe3.people.increment({ "writeCount": 1 });
          // Tell the container view to re-render
          app.trigger('saveSuccess', { response: response });
        }

      , saveError: function (model, response) {
          DEVMODE && console.log('[TldrModel] Save Error');
          if (response.status === 403) {
            app.trigger('syncError', response.responseText);
          }
        }

      , setChanges: function (data) {
          var isValid = this.validateModel(data);
          // Dont trigger `change` event to be able to use previousAttributes with the complete previous model
          // We trigger it manually in saveChanges
          this.set(data, { silent: true });
          if (isValid) {
            DEVMODE && console.log('[TldrModel] set valid changes', data);
          } else {
            DEVMODE && console.log('[TldrModel] model is not valid, save is disabled');
          }
        }

        // No support for emulateHTTP nor emulateJSON
      , sync: function (method, model, options) {
          var methodMap = { 'create': 'POST'
                          , 'update': 'PUT'
                          , 'delete': 'DELETE'
                          , 'read':   'GET'
                          }
            , type = methodMap[method]
            , params = { type: type, dataType: 'json' };

          options = options || {};

          params.accepts = 'application/json';
          if (!options.data && model && (method === 'create' || method === 'update')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model.toJSON());
          }

          if (params.type !== 'GET') {
            params.processData = false;
          }

          switch(type) {
              case 'GET':
                if (model.has('url') ){
                  params.url = model.urlRoot + 'search?url=' +  encodeURIComponent(model.get('url'));
                } else if (model.has('_id')) {
                  params.url = model.urlRoot + model.get('_id');
                }
                break;
              case 'POST':
                if (model.has('isQuerystringOffender') && model.get('isQuerystringOffender')) {
                  params.url = model.urlRoot + '?isQuerystringOffender=true';
                } else {
                  params.url = model.urlRoot;
                }
                break;
              case 'PUT':
                params.url = model.urlRoot + encodeURIComponent(model.id);
                break;

              default:
                  // code
          }

          DEVMODE && console.log('[TldrModel] Sync ', method, params);
          return $.ajax(_.extend(params, options));

        }

        // custom getter for display
      , toJSONForDisplay: function(options) {
          var clone =  _.clone(this.attributes)
            , date;
          if ( _.has(clone, 'resourceDate') ) {
            date = new Date(clone.resourceDate);
            clone.resourceDate = date.toDateString();
            //clone.resourceDate = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate();
          }
          return clone;
        }

      , unsetChanges: function (data) {
          DEVMODE && console.log('[TldrModel] unsetChanges');
          this.attributes = this.previousAttributes();
        }

      , validateModel: function (data) {
          // Validate the model
          var clone = _.extend({}, this.attributes, data)
            , isValid = true;

          DEVMODE && console.log('[TldrModel] Validate Model', data, clone);
          if ( _.has(clone, 'title') ) {
            isValid = this.validateTitle(clone.title) && isValid;
          }
          if ( _.has(clone, 'summaryBullets') ) {
            isValid = this.validateSummary(clone.summaryBullets) && isValid;
          }
          if ( _.has(clone, 'categories') ) {
            isValid = this.validateCategories(clone.categories) && isValid;
          }

          // Trigger event to enable Save button
          if ( _.has(clone, 'categories') && _.has(clone, 'summaryBullets') && isValid) { app.trigger('input:valid'); }

          return isValid;
        }


      , validateCategories: function (value) {
          DEVMODE && console.log('[TldrModel] Validate Categories');
          var valid = value.length > 0;
          if (!valid) {
            app.trigger('validationError:categories', 0, 'Please select at least one topic');
          }
          return valid;
        }

      , validateSummary: function (value) {
          DEVMODE && console.log('[TldrModel] Validate new Summary', value);
          var validBullet
            , validSummary = true
            , i
            , bullet;

          // if all bullets are empty unvalidate summary
          if (value.length === 0) {
            app.trigger('validationError:summary');
            return false;
          }

          // check length of non-empty bullets
          for (i = 0; i < value.length; i += 1) {
            bullet = value[i];
            validBullet = bullet.length <= app.MAX_BULLET_LENGTH;
            if (!validBullet) {
              app.trigger('validationError:summary', i, 'This bullet point is turning into a novel, try keeping it short!');
              validSummary = false;
            }
          }
          return validSummary;

        }

      , validateTitle: function (value) {
          DEVMODE && console.log('[TldrModel] Validate title');
          var validTitle = ( value && (value.length >= 1) && (value.length <= app.MAX_TITLE_LENGTH) );
          if (!validTitle) {
            app.trigger('validationError:metadata', 'title', 'A title really shouldn\'t be that long if you ask me');
            return false;
          }
          return true;
        }

    });

    return TldrModel;
  }
);
