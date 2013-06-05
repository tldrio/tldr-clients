/**
 * TldrModelTest
 */

define([
  '../../../../src/app/models/shared/tldrModel'
], function(TldrModel){

  function loadTestSuite () {
    var model;

    beforeEach(function () {
      model = new TldrModel ();
    });

    describe('TldrModelTest', function () {

      it('#properties', function () {
        model.should.have.property('urlRoot');
      });
    });

  }

  return { load: loadTestSuite};
});
