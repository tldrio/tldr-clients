require([ 'devmodeRetroCompatibility'
        , 'jquery'
        , 'lib/environment'
        , 'lib/utils'
        , 'mixpanel'
        , 'models/shared/userModel'
        , 'models/shared/tldrModel'
        , 'views/shared/popover.inner'
        ],
function (
  devmodeRetroCompatibility
, $
, env
, utils
, mixpanelInit
, UserModel
, TldrModel
, PopoverInnerView
) {

  var popoverView
    , PopoverView
    , userModel = new UserModel()
    , tldrModel = new TldrModel();


  if (has('xpi')) {
    // send withcredentials header for every request
    $.ajaxSetup({
      xhrFields: { withCredentials: true }
    , headers: env.firefoxExtensionAPICreds
    });
    mixpanel.tldr_d4a6ebe3.register({ from: 'Firefox Extension' });
    PopoverView = PopoverInnerView.extend({
      sendMessageToParent: function(message) {
        window.parent.postMessage(message, '*');
      }
    , listenForMessageFromParent: function( callback) {
        window.addEventListener('message', function (event) {
          var message = event.data;
          callback(message);
        });
      }
    });

  } else if (has('crx')){
    $.ajaxSetup({
      xhrFields: { withCredentials: true }
    , headers: env.chromeExtensionAPICreds
    });
    // Inject css
    utils.loadCssFile(chrome.extension.getURL('assets/css/popover.inner.css'));
    mixpanel.tldr_d4a6ebe3.register({ from: 'Chrome Extension' });

    PopoverView = PopoverInnerView.extend({
      sendMessageToParent: function(message) {
        chrome.extension.sendMessage(message);
      }
    , listenForMessageFromParent: function( callback) {
        chrome.extension.onMessage.addListener(function (message, sender, _callback) {
          callback(message);
        });
      }
    });
  }

  popoverView = new PopoverView({ tldrModel: tldrModel
                                , userModel: userModel
                                , el: '.tldr-popover'
                                });

});
