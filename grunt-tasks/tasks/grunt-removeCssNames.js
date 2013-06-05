module.exports = function( grunt ) {
  grunt.registerMultiTask('removeCssNames', 'Remove freaking css names from all the codebase', function () {
    var Hogan = require('hogan.js')
      , path = require('path')
      , _ = require('underscore')
      , cssNames = require('../../src/app/lib/css-names.js')
      , jsFiles = grunt.file.expandFiles(this.data.js)
      , mustacheFiles = grunt.file.expandFiles(this.data.mustache)
      , stylFiles = grunt.file.expandFiles(this.data.styl);

    // Remove cssNames from js files
    _.each(jsFiles, function (file) {
      console.log("Updating " + file);
      var contents = grunt.file.read(file);

      _.each(_.keys(cssNames), function (prop) {
        // If we match a property but there still is one letter on the right it means we didn't match the whole name
        var propRE = new RegExp("cssNames\." + prop + "([^a-zA-Z])", "g");
        var target = "'" + cssNames[prop] + "'$1";

        contents = contents.replace(propRE, target);
      });

      grunt.file.write(file, contents);
    });

    // Remove cssNames from mustache files
    _.each(mustacheFiles, function (file) {
      console.log("Updating " + file);
      var contents = grunt.file.read(file);

      _.each(_.keys(cssNames), function (prop) {
        // If we match a property but there still is one letter on the right it means we didn't match the whole name
        var propRE = new RegExp("{{css\." + prop + "}}", "g");
        var target = cssNames[prop];

        contents = contents.replace(propRE, target);
      });

      grunt.file.write(file, contents);
    });

    // Remove cssNames from styl files
    _.each(stylFiles, function (file) {
      console.log("Updating " + file);
      var contents = grunt.file.read(file);

      _.each(_.keys(cssNames), function (prop) {
        // If we match a property but there still is one letter on the right it means we didn't match the whole name
        var propRE = new RegExp("{{" + prop + "}}", "g");
        var target = cssNames[prop];

        contents = contents.replace(propRE, target);
      });

      grunt.file.write(file, contents);
    });

  });
};
