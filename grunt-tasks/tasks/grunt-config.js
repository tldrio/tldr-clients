module.exports = function( grunt ) {

  grunt.registerTask('config', 'This sets config values.', function() {
    Array.prototype.slice.call(arguments, 0).forEach(function(configPair) {
      var configMatches = configPair.match(/([^=]*?)=(.*)/);
      if (configMatches) {
        var prop = configMatches[1];
        var value = configMatches[2];

        console.log("Setting %s to %s", prop, value);
        grunt.config.set(prop, value);
      }
    });
  });


};
