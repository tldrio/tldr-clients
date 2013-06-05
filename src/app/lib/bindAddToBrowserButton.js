define( [ 'lib/environment', 'jquery' , 'mixpanel' ], function (env, $) {

  function bindAddToBrowserButton () {
    $('body').on('click', '.add-to-browser', function () {
      if (window.chrome && window.chrome.webstore && window.chrome.webstore.install) {
        // We're on Chrome, use their API to install the extension automatically
        console.log("INSTALL ON CHROME");
        mixpanel.tldr_d4a6ebe3.track('[Website] Clicked Add To Chrome Button');
        window.chrome.webstore.install('https://chrome.google.com/webstore/detail/ohmamcbkcmfalompaelgoepcnbnpiioe'
                                , function (argument) {
                                  mixpanel.tldr_d4a6ebe3.track('[Website] Chrome Extension Installed');
                                  setTimeout(function() {
                                    window.location = '/signup?returnUrl=/browser-extension%3Finstalled';
                                  }, 1000);
                                }
                                , function (err) {
                                  console.log('Error installing CRX', err);
                                });
      } else {
        // Let's assume we're on firefox, the icons are pretty clear aren't they?
        console.log("INSTALL ON FIREFOX");
        mixpanel.tldr_d4a6ebe3.track('[Website] Clicked Add To Firefox Button');
        window.location.href = env.websiteUrl + '/firefox/xpi/tldrio.xpi';
      }
    });
  }

  return bindAddToBrowserButton;
});

