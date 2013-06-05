/**
 * Main test file
 */

// We use AMD version of Backbone and Underscore
// See http://tagneto.blogspot.fr/2012/01/amd-support-for-underscore-and-backbone.html
// for more details
require.config({ baseUrl: '../../src'
               , paths: { jquery: 'vendor/jquery/jquery-1.7.2'
                        , underscore: 'vendor/underscore/1.3.3-amdjs/underscore'
                        , backbone: 'vendor/backbone/0.9.2-amdjs/backbone'
                        , text: 'vendor/require/require-text'
                        , domReady: 'vendor/require/domReady'
                        , Mustache: 'vendor/mustache/mustache-wrap'
                        , bootstrap: 'vendor/bootstrap/bootstrap'
                        , mocha: '../../node_modules/mocha/mocha'
                        , chai: '../../node_modules/chai/chai'
                        , lib: 'app/lib'
                        }
});

require([ 'require' , 'chai' , 'mocha' ], function (require, chai) {
  mocha.setup('bdd'); //Setup mocha to bdd style
  chai.should(); //Extend Object prototype with should

  require(['../test/unit/specs/models/tldrModel.test'], function (TldrModelTest) {
    TldrModelTest.load(); //Load Tests
    mocha.run(); //Run Tests
  });
});

