/**
 * tldr.io bookmarklet
 * Copyright (C) 2012 L. Chatriot, S. Marion, C. Miglietti
 * Proprietary License
 */


requirejs([ 'devmodeRetroCompatibility'
          , 'lib/environment'
          , 'views/bookmarklet/overlay'], function (devmodeRetroCompatibility, env, OverlayView) {

  // Attach TLDR global to window to make it callable by bookmarklet
  var app = window.TLDR_D4A6EBE3 = window.TLDR_D4A6EBE3 || {};

  // Use self defined function for init code
  app.launch = function () {

    var document = window.document;

    function loadCss(url) {
      var link = document.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = url;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    //Load css File
    loadCss(env.BMBaseUrl + '/assets/css/bookmarklet.css');


    if (!document.getElementById('tldr-overlay-bm-d4a6ebe3')) {
      // create new instance of view
      app.overlayView = new OverlayView('tldr-overlay-bm-d4a6ebe3');
      // append to the DOM
      document.body.appendChild(app.overlayView.el);
      DEVMODE && console.log('[BM Main] append to DOM');
    } else {
      DEVMODE && console.log('[BM Main] remove from DOM');
      // close properly
      app.overlayView.close();
      // kill the view
      app.overlayView = null;
      return;
    }

    // Esc binding to close overlay
    window.document.onkeyup = function (e) {
      if (e.keyCode === 27) {
        app.overlayView.close();
        app.overlayView = null;
      }
    };
  };


  app.launch();

});

