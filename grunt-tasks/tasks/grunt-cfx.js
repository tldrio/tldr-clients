module.exports = function( grunt ) {


  // Register new task to run addon with FF
  grunt.registerTask( 'cfx', 'Spawn a new FF with addon installed', function() {
    // Tell grunt this task is asynchronous.
    var done = this.async()
      , exec = require('child_process').exec;

    exec( 'cfx run --pkgdir dist/firefox/local --profiledir assets/firefox/profile', function (err, stdout, stderr) {
      if (err) {
        grunt.warn(err);
        done(false);
      } else {
        done();
      }
    });
  });


};
