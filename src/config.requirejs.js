requirejs.config({
    baseUrl: '../src'
  , inlineText: true
  , namespace: 'tldr'
  , name: 'vendor/require/almond'
  , optimize: 'none'
  , paths: { jquery: 'vendor/jquery/jquery-1.8.2'
           , underscore: 'vendor/underscore/1.4.4-amdjs/underscore'
           , underscoreString: 'vendor/underscore.string/underscore.string'
           , backbone: 'vendor/backbone/1.0.0-amdjs/backbone'
           , Mustache: 'vendor/mustache/mustache-wrap'
           , bootstrap: 'vendor/bootstrap/bootstrap'
           , easyXDM: 'vendor/easyXDM/easyXDM-wrap'
           , mixpanel: 'vendor/mixpanel/mixpanel'
           , clearly: 'vendor/clearly/clearly'
           , select2: 'vendor/select2/select2'
           , mixpanelLib: 'vendor/mixpanel/mixpanel-2.2'
           , json: 'vendor/json/json2'
           , spin: 'vendor/spin/spin'
           , d3: 'vendor/d3/d3.v3'
           , cookies: 'vendor/cookies-framework/cookies-framework'

             // plugins
           , powertip: 'vendor/jquery.powertip-1.1.0/jquery.powertip'
           , chromepowertip: 'app/main/chrome/chrome.powertip'
           , firefoxpowertip: 'app/main/firefox/firefox.powertip'
           , datepicker: 'vendor/bootstrap/bootstrap-datepicker'

             // requireJS plugins
           , text: 'vendor/require/require-text'
           , domReady: 'vendor/require/domReady'

             // helper paths
           , collections: 'app/collections'
           , main: 'app/main'
           , models: 'app/models'
           , lib: 'app/lib'
           , views: 'app/views'
           , templates: 'templates'
           , devmodeRetroCompatibility: 'app/lib/devmodeRetroCompatibilityEmpty'
           }
  , preserveLicenseComments: false
  , shim: { bootstrap: ['jquery']
          , datepicker: ['jquery']
          , powertip: ['jquery']
          , chromepowertip: ['jquery']
          , select2: ['jquery']
          , d3: { deps: []
                , exports: 'd3'
                }
          }
});
