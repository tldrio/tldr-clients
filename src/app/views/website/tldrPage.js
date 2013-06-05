define(
[ 'devmodeRetroCompatibility'
, 'lib/environment'
, 'lib/mediator'
, 'underscore'
, 'jquery'
, 'models/shared/tldrModel'
, 'models/shared/userModel'
, 'views/shared/sharing'
, 'views/shared/thank'
],
function( devmodeRetroCompatibility
        , env
        , app
        , _
        , $
        , TldrModel
        , UserModel
        , ShareView
        , ThankView
        ) {

  var Page = {};

  Page.launchPageScript = function () {
    var self = this
      , share, thank, metaContent = $('meta')
      , tldrData = $('#all-tldr-data').data('tldr')
      , user = new UserModel()
      , tldr = new TldrModel()
      ;

    function extractDataFromMetaTags(property) {
      var elt = _.find(metaContent, function(elt) {
        if ($(elt).attr('property') === property) { return true; }
      });

      return $(elt).attr('content');
    }

    tldrData = tldrData.replace(/\\"/g, '"');
    tldrData = JSON.parse(tldrData);
    tldrData.summary = extractDataFromMetaTags("og:description");
    tldrData.creator = { twitterHandle: extractDataFromMetaTags("tldrCreatorTwitterHandle") };

    tldr.set(tldrData);
    user.set({ _id: $('#logged-user-username').data('id') });

    mixpanel.tldr_d4a6ebe3.track('[TldrRead]', { url: tldrData.url, from: 'Tldr Page' });
    mixpanel.tldr_d4a6ebe3.people.increment({ "readCount": 1
                                            , "readViaPage": 1
                                            , "readsSinceLastContribution": 1
                                            });

    $('#read-full-article').on('click', function() {
      mixpanel.tldr_d4a6ebe3.track('[Page] ReadFullArticle', { url: tldrData.url });
    });
    $('.tldr-title > a').on('click', function() {
      mixpanel.tldr_d4a6ebe3.track('[Page] Click title', { url: tldrData.url });
    });

    share = new ShareView({ tldrData: tldrData });
    share.setElement($('.sharing-container'));
    share.render();

    thank = new ThankView({ model: tldr, userModel: user});
    thank.setElement($('.thank-container'));
    thank.render();

    app.on('switchToLoginForm', function () {
      $('.cta-login').show();
    });

    $('#cta-to-tldr').on('click', function () {
      mixpanel.tldr_d4a6ebe3.track('[Page] Learn more');
    });
  };

  return Page;
});

