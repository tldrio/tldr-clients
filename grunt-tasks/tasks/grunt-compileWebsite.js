module.exports = function( grunt ) {

  // grunt multitask for rendering mustache templates with hogan
  // this is the task that renders the static website pages
  grunt.registerMultiTask('compileWebsite', 'Render website with hogan.js', function () {
    var Hogan = require('hogan.js')
      , path = require('path')
      , templatesPaths = grunt.file.expandFiles(this.data.src)
      , pages = grunt.file.expand(this.data.pages)
      , compiledTemplates = {}
      , dest = grunt.template.process(this.data.dest);

    // Reading template files and compiling them (template compiling is the necessary first step before rendering)
    // The compiled templates have the same name as the keys in the templates object
    templatesPaths.forEach(function (templatePath) {
      compiledTemplates[path.basename(templatePath, path.extname(templatePath))] = Hogan.compile(grunt.file.read(templatePath));
    });

    // render the files
    pages.forEach(function (page) {
      var pagePath
        , pageName
        , output
        , opts = {}
        ;

      // example: page = 'some/foo/bar.mustache' pageName = 'bar'
      pageName = path.basename(page, path.extname(page));
      // this is the destination path
      pagePath = dest + pageName + '.html';
      // partial content for this specific page

      compiledTemplates.content = compiledTemplates[pageName];
      // set active link in navbar
      opts[pageName] = true;
      // render the pages
      output = compiledTemplates.basicLayout.render(opts, compiledTemplates);
      // write them to files
      grunt.file.write(pagePath, output);
      grunt.log.writeln(pagePath + ' has been generated');
    }, this);

  });

};
