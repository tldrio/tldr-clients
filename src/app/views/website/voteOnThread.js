/*
 * Widget used to handle voting on a thread
 */

define(
[ 'jquery'
, 'underscore'
, 'backbone'
, 'lib/environment'
],
function ( $
         , _
         , Backbone
         , env
         ) {

  var VoteOnThreadView = Backbone.View.extend({

    events: function () {
      var events = {};
      events['click .upvote'] = 'vote';
      events['click .downvote'] = 'vote';
      return events;
    }

  , initialize: function (options) {
      DEVMODE && console.log('[VotingWidget] Init');
      // Bind execution context
      _.bindAll(this
              , 'vote'
              );
    }

  , vote: function (event) {
      var $target = $(event.currentTarget)
        , threadId = $target.parent().attr('id')
        , params = {}
        , self = this;

      event.preventDefault();

      if ($target.hasClass('upvote')) {
        params.direction = 1;
      } else {
        params.direction = -1;
      }

      $.ajax({ url: env.apiUrl + '/forum/threads/' + threadId
             , type: 'PUT'
             , dataType: 'json'
             , data: params
            })
        .done(this.voteSuccess)
        .fail(this.voteFail)
        .always(function () {
          self.voteFeedback ($target, params.direction);
        });
    }

  , voteFeedback: function ($target, direction) {
      var $upButton = $target.parent().find('.upvote')
        , $downButton = $target.parent().find('.downvote')
        , $votesCount = $target.parent().find('.votes-count')
        , newVotesCount = parseInt($votesCount.html(), 10) + direction
        ;

      $votesCount.html(newVotesCount);
      $upButton.replaceWith('<i class="icon-thumbs-up" style="opacity: 0.15;"></i>');
      $downButton.replaceWith('<i class="icon-thumbs-down" style="opacity: 0.15;"></i>');
    }

  , voteFail: function () {
      // No specific feedback
    }

  , voteSuccess: function () {
      // No specific feedback
    }

  });

  return VoteOnThreadView;
});

