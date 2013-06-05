module.exports = function(grunt) {
  "use strict";

  grunt.file.mkdir("fixtures/output");

  grunt.initConfig({

    test: {
      tasks: ["*.test.js"],
    }

    , clean: {
      fixtures: ["fixtures/output"]
    }

    , compileWebsite: { website: { src: ['fixtures/compileWebsite/**/*']
                               , pages: ['fixtures/compileWebsite/pages/*']
                               , dest: 'fixtures/output/'
                               }
                    }
  });

  grunt.loadTasks("../tasks");
  grunt.loadTasks("../../node_modules/grunt-contrib/tasks");
  grunt.registerTask("default", "clean:fixtures compileWebsite test:tasks" );
};

