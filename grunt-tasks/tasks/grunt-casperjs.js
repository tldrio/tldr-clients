module.exports = function( grunt ) {


  // Register new task to run integration tests with CasperJs
  grunt.registerMultiTask( 'casperjs', 'Run casperjs tests using `casperjs test` command', function() {
    // Tell grunt this task is asynchronous.
    var done = this.async()
      , files = grunt.file.expandFiles(this.data.files)
      , exec = require('child_process').exec;

    files.forEach(function(filepath) {
      var command = 'casperjs --web-security=no --log-level=debug test ' + filepath ;
      exec( command, function (err, stdout, stderr) {
        grunt.log.write( stdout );
        if (err) {
          grunt.warn(err);
          done(false);
        } else {
          done();
        }
      });
    });
  });


};
