define(
[ 'devmodeRetroCompatibility'
, 'lib/environment'
, 'underscore'
, 'jquery'
, 'models/shared/tldrModel'
, 'models/shared/userModel'
, 'views/shared/sharing'
, 'views/shared/thank'
, 'cookies'
],
function( devmodeRetroCompatibility
        , env
        , _
        , $
        , TldrModel
        , UserModel
        , ShareView
        , ThankView
        , cookies
        ) {

  var Discover = {};

  Discover.init = function () {
    var user = new UserModel()
      , displayedTldrs = 10
      , limit = 10
      ;

    // Prevent clicking on title from collapsing/expanding
    $('.discover-tldr-external-link').click(function (e) {
      e.stopPropagation();
    });

    // Bind single collapse/expand
    $('.discover-tldr-header').click(function (e) {
      // Send request to increment readCount
      if ($(this).parents('.discover-tldr-item').hasClass('collapsed')) {
        $.ajax({ url: env.apiUrl + '/tldrs/' + $(this).siblings('.discover-tldr-data').data('tldr-id')
               , type: 'PUT'
               , dataType: 'json'
               , accepts: 'application/json'
               , contentType: 'application/json'
               , data: JSON.stringify({ incrementReadCount: 1 })
               });
        // live update
        $(this).find('.discover-tldr-readcount').html(function(i, val) { return +val+1; });
        // Mixpanel
        mixpanel.tldr_d4a6ebe3.track('[TldrRead]', { from: 'discover' });
        mixpanel.tldr_d4a6ebe3.people.increment({ "readCount": 1
                                                , "readViaWebsite": 1
                                                , "readsSinceLastContribution": 1
                                                });
      }
      $(this).siblings('.discover-tldr-foldable').slideToggle(100);
      $(this).parents('.discover-tldr-item').toggleClass('collapsed');
    });

    // Bind global collapse/expand
    $('.options-visual a').click(function (e) {
      e.preventDefault();

      // Hide show collapse/expand link
      $(this).hide();
      $(this).siblings('a').show();
      // Collapse/expand all
      if ($(this).hasClass('option-expand')) {
        sendReadEventForNonExpandedTldrs();
        $('.discover-tldr-foldable').slideDown(100);
        $('.discover-tldr-item').removeClass('collapsed');
      } else if ($(this).hasClass('option-collapse')) {
        $('.discover-tldr-foldable').slideUp(100);
        $('.discover-tldr-item').addClass('collapsed');
      }
    });

    // Trigger a read event for all tldrs when they are batch-expanded
    function sendReadEventForNonExpandedTldrs () {
      var $items = $('.discover-tldr-item').filter('.collapsed').find('.discover-tldr-data')
        , res = [], i
        ;

      for (i = 0; i < $items.length; i += 1) {
        res.push($($items[i]).data('tldr-id'));
      }

      $.ajax({ url: env.apiUrl + '/tldrs/incrementReadCountByBatch'
             , type: 'PUT'
             , data: { ids: res }
             }).done(function () {});
    }

    // bind actions (thank you, share, save, embed)
    $('.discover-tldr-item').each(function (i, e) {
      var share
        , thank
        , tldrData = $(e).find('.discover-tldr-data').data('tldr-data')
        , tldr = new TldrModel()
        ;

      tldrData = tldrData.replace(/\\"/g, '"');
      tldrData = JSON.parse(tldrData);

      tldrData.summary = $(e).find('.discover-tldr-data').data('tldr-summary').split(',').join(' ');
      tldrData.creator = { twitterHandle: $(e).find('.discover-tldr-data').data('tldr-twitterhandle')};

      tldr.set(tldrData);

      user.set({ _id: $('#logged-user-username').data('id') });

      share = new ShareView({ tldrData: tldrData });
      share.setElement($(e).find('.sharing-container'));
      share.render();

      thank = new ThankView({ model: tldr, userModel: user});
      thank.setElement($(e).find('.thank-container'));
      thank.render();
    });

    // Bind load more button
    $('.btn-load-more').click(function (e) {
      $('.discover-tldr-item:nth-child(n + ' + (displayedTldrs + 1).toString() +')').slice(0, limit).slideDown(100);
      displayedTldrs = displayedTldrs + limit;
      mixpanel.tldr_d4a6ebe3.track('[LoadMore]', { from: 'discover' });
    });

    // Bind clicks on language checkboxes
    $('.options-lang input[type="checkbox"]').on('click', function(e) {
      var language = $(e.currentTarget).data('language')
        , selected = $(e.currentTarget).attr('checked') === 'checked'
        , currentLanguages = cookies.getItem('languages')
        ;

      try {
        currentLanguages = JSON.parse(currentLanguages);
      } catch (e) {
        currentLanguages = ['en'];
      }

      if (selected) {
        currentLanguages.push(language);
        currentLanguages = _.uniq(currentLanguages);
      } else {
        currentLanguages = _.difference(currentLanguages, [language]);
      }

      currentLanguages = JSON.stringify(currentLanguages);
      cookies.setItem('languages', currentLanguages, 365 * 24 * 3600, '/');
      window.location.reload();
    });
  };

  return Discover;
});

