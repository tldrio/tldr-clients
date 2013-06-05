define(
[ 'jquery'
],
function ($) {


  function displayGraphicHelper () {
     var titles = $('.tldr-title-wrapper > .tldr-title-ellipsis')
       , position
       , gh = $('#graphic-helper-badge')
       , maxWidth = 0
       , index = -1;

     // dont show gh if already seen once
     if (!window.localStorage.getItem('tldrd4a6ebe3-graphic-helper-tldrs')) {

       // select the biggest title to place the arrow
       titles.each(function(i, title) {
         // Avoid gh to point to first and second tl;dr
         if (i === 0 || i === 1) {
           return;
         }
         var $title = $(title);
         if ($title.width() >= maxWidth) {
           maxWidth = $title.width();
           index = i;
         }
       });
       // Set position of the gh to the corresponding label
       position = $('.tldr-label-d4a6ebe3').eq(index).position();
       gh.css('top', position.top - gh.height());
       gh.css('left', position.left);
       gh = $('#graphic-helper-badge').fadeIn(1000);

        //Listen for powertip open
       $('body').on('tldr-powertip-open', function(event) {
         window.localStorage.setItem('tldrd4a6ebe3-graphic-helper-tldrs', true);
         gh.fadeOut(1000);
       });
     }
     return;

   }

  return { displayGraphicHelper: displayGraphicHelper };

});
