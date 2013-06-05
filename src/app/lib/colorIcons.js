define(['jquery'], function($){

  function colorIcons (n) {
    $('.tldr-icon').each(function (i) {
      $(this).css('background-color', 'hsla(24, 100%, ' + (i * (50/(n + 1)) + 50) + '%, 1)');
    });
  }

  return colorIcons;
});
