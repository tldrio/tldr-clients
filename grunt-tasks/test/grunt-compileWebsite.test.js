var grunt = require("grunt");

exports.compileWebsite = {
  main: function (test) {
    test.expect(1);

    var expectA = '<html lang="en"> <div class="navbar navbar-fixed-top"> <ul class="nav"><li class="active"><a href="index">Home</a></li><li><a href="whatisit">What is This?</a></li></ul></div>\n\
 <div class="container"> <header class="jumbotron"> <h1>tldr</h1> <h2>Surface the Web</h2> </header>\n\
 <script src="src/website.js"> </script> </body> </html>\n';

    var resultA = grunt.file.read("fixtures/output/index.html");
    test.equal(resultA, expectA, "Should compile mustache files with partials");

    test.done();
  }

};

