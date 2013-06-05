// See http://casperjs.org/testing.html for more infos  about testing with Casperjs

var env = require('system').env // Get environment variables
  , css = require(env.TLDR_CLIENTS_DIR + '/src/app/lib/css-names.js')
  , pseudoRandom = new Date().getTime();


// Open Signup Page
casper.start('http://localhost:8888/dist/website/local/signup', function afterStart () {
  this.test.assertHttpStatus(200, 'Signup page is up');
  this.test.assertExists('#'+css.signupFormContainer, 'Signup form is present');
});

// Fill signup form with bad email
casper.then( function fillForm () {
  this.fill( '#'+css.signupForm, { 'email': 'notanemailaddress'
                                 , 'password': 'password'
                                 , 'username': 'username'
                                 });
  this.click('#'+ css.signupFormSubmit);
});

casper.then( function afterSubmit () {
  this.test.assertExists('.alert-error', 'Flash Error message is present');
  this.test.assertMatch(this.fetchText('.alert-error'), /email/, 'Flash error message is about email');
});

// Fill signup form with bad password
casper.then( function fillForm () {
  this.fill( '#'+css.signupForm, { 'email': 'email@nfa.com'
                                 , 'password': 'bad'
                                 , 'username': 'username'
                                 });
  this.click('#'+ css.signupFormSubmit);
});

casper.then( function afterSubmit () {
  this.test.assertExists('.alert-error', 'Flash Error message is present');
  this.test.assertMatch(this.fetchText('.alert-error'), /password/, 'Flash error message is about password');
});

// Fill signup form with bad username
casper.then( function fillForm () {
  this.fill( '#'+css.signupForm, { 'email': 'email@nfa.com'
                                 , 'password': 'password'
                                 , 'username': 'Charles@$*'
                                 });
  this.click('#'+ css.signupFormSubmit);
});

casper.then( function afterSubmit () {
  this.test.assertExists('.alert-error', 'Flash Error message is present');
  this.test.assertMatch(this.fetchText('.alert-error'), /username/, 'Flash error message is about username');
});

// Fill a good profile
casper.then( function fillForm () {
  this.fill( '#'+css.signupForm, { 'email': pseudoRandom +'@gmail.com'
                                 , 'password': 'password'
                                 , 'username': pseudoRandom
                                 });
  this.click('#'+ css.signupFormSubmit);
});

casper.then( function afterSubmit () {
  this.test.assertExists('#' + css.signupSuccess, 'Signup is successfull ');
  this.test.assertExists('#' + css.signupSuccessMailProvider, 'mail address extension is parsed');
});


casper.run(function() {
   this.test.done(); // I must be called once all the async stuff has been executed
});

