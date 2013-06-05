define(
 [ 'jquery'
 , 'mixpanel'
 ],
function
( $
) {

  function trackChromeExtensionPageClicks () {
    $('body').on('click', '.crx-try-read', function () {
      mixpanel.tldr_d4a6ebe3.track('[Website] Clicked Try it Button');
    });
    $('body').on('click', '.crx-try-write', function () {
      mixpanel.tldr_d4a6ebe3.track('[Website] Clicked Summarize Your First Article Button');
    });
    $('body').on('click', '.crx-try-hn', function () {
      mixpanel.tldr_d4a6ebe3.track('[Website] Clicked Put on Your X-Rays Glasses Button');
    });
  }

  return trackChromeExtensionPageClicks;
});
