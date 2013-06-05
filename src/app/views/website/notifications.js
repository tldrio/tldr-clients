/*
 * Notifications View
 *
 */

define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'lib/environment'
],
function
( $
, _
, Backbone
, env
) {

  var NotificationView = Backbone.View.extend({

    events: { 'click .mark-notification-read': 'notificationSeen'
            , 'click #mark-all-notifications-read': 'allNotificationSeen'
            }

  , initialize: function (options) {

      DEVMODE && console.log('[Notifications] Init with options', options);
    }

  , allNotificationSeen: function (event) {
      var params = { url: env.apiUrl + '/users/you/notifications/markAllAsSeen'
                   , contentType: 'application/json'
                   , accepts: 'application/json'
                   , type: 'PUT'
                   , dataType: 'json'
                   , data: JSON.stringify({})
                   }
        , self = this;

      $.ajax(params)
       .done(function (data) {
         DEVMODE && console.log('[Notifications] ' + data.message);
       })
       .fail(function () {
          DEVMODE && console.warn('[Notifications] Marking all notifications as read failed');
       });

       _.each(self.$('.mark-notification-read'), function (value) {
         self.notificationSeenInternal($(value).parents('.notification-list-el'), true);
       });
    }

    // If dontSync is true, we won't try to ask the server to mark the notification as seen
  , notificationSeen: function (event) {
      var target = this.$(event.currentTarget).parents('.notification-list-el');

      this.notificationSeenInternal(target);
    }

  , notificationSeenInternal: function (target, dontSync) {
      var notifId = target.data('id')
        , unseen = target.hasClass('unseen-notification')
        , params = {};

      if (unseen) {
        if (!dontSync) {
          // Ajax call to change state of notif
          params.url = env.apiUrl + '/notifications/' + notifId;
          params.contentType = 'application/json';
          params.accepts = 'application/json';
          params.type = 'PUT';
          params.dataType = 'json';
          params.processData = false;
          params.data = JSON.stringify({ unseen: false });

          $.ajax(params)
          .done( function () {
            DEVMODE && console.log('[Notifications] Change of state successful');
          })
          .fail( function () {
            DEVMODE && console.warn('[Notifications] Change of state failed');
          });
        }

        // Remove css class - Asynchronous UI
        target.removeClass('unseen-notification');
        // Remove makr as read icon
        target.find('.mark-notification-read').remove();
        //update notif count
        this.updateUnseenNotifsCountByOne();
      }
    }

  , updateUnseenNotifsCountByOne: function () {
      var prevUnseenCount = parseInt($('.unseen-notifs-count').html(), 10);

      if (prevUnseenCount === 1) {
        $('.unseen-notifs-count').remove();
      } else {
        $('.unseen-notifs-count').html(prevUnseenCount - 1);
      }


    }

  });

  return NotificationView;
});



