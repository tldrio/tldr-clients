// See http://casperjs.org/testing.html for more infos  about testing with Casperjs

// Open webpage
casper.start('http://localhost:8888/test/integration/stubWebpage.html', function afterStart () {
  this.test.assertHttpStatus(200, 'Iframe is ok');
  //this.debugHTML();
});

casper.then(function toto() {
    this.test.assertEval(function checkNoTldrYet() {
      return document.getElementById('tldr-iframe-d4a6ebe3').contentDocument.querySelectorAll('#tldr-notldryet').length > 0;
    }, 'the notldryet div is present');
});

//casper.then(function checkNoTldrYet() {
  //this.test.assertExists('#tldr-notldryet', 'No Tldr Yet on this page');
//});

//casper.then(function clickOnSummarize() {
  //this.click('#tldr-start-summarizing-now');
  //this.test.assertExists('#tldr-save', 'Button Save is present');
//});

casper.run(function() {
   this.test.done(); // I must be called once all the async stuff has been executed
});


