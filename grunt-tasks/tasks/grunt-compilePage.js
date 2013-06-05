module.exports = function( grunt ) {

  // grunt multitask for rendering mustache templates with hogan
  // this is the task that renders the static website pages
  grunt.registerMultiTask('compilePage', 'Render page template with hogan.js', function () {
    var Hogan = require('hogan.js')
      , path = require('path')
      , templatesPaths = grunt.file.expandFiles(this.data.templates)
      , dest = grunt.template.process(this.data.dest) + 'page.mustache'
      , layoutPath = this.data.layout
      , layoutName = path.basename(layoutPath, path.extname(layoutPath))
      , output
      , opts = {}
      , compiledTemplates = {};

    // Reading template files and compiling them (template compiling is the necessary first step before rendering)
    // The compiled templates have the same name as the keys in the templates object
    templatesPaths.forEach(function (templatePath) {
      compiledTemplates[path.basename(templatePath, path.extname(templatePath))] = Hogan.compile(grunt.file.read(templatePath), { delimiters: '<% %>' });
    });

    // render the pages
    output = compiledTemplates[layoutName].render(opts, compiledTemplates);
    // write them to files
    grunt.file.write(dest, output);
    grunt.log.writeln(dest, 'has been generated');

  });

};
