/*
 * Bookmarklet used to switch between different accounts randomly
 * Author: Louis Chatriot
 */


var jfbd = jfbd || {};
jfbd.accounts = [
  { email: "louis.chatrio.t@gmail.com", password: "c0pAkaXa+.R_B^6eM2T}" }
, { email: "lo.uis.chatriot@gmail.com", password: "c0pAkaXa+.R_B^6eM2T}" }
, { email: "louis.cha.triot@gmail.com", password: "c0pAkaXa+.R_B^6eM2T}" }
, { email: "loui.s.chatriot@gmail.com", password: "c0pAkaXa+.R_B^6eM2T}" }
, { email: "charles@needforair.com", password: "Gbeso1dR!" }
, { email: "c.harlesmiglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "ch.arlesmiglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "cha.rlesmiglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "char.lesmiglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "charl.esmiglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "charle.smiglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "charlesm.iglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "charlesmi.glietti@gmail.com", password: "Gbeso1dR!" }
, { email: "charles.miglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "c.harles.miglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "ch.arles.miglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "cha.rles.miglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "char.les.miglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "charle.s.miglietti@gmail.com", password: "Gbeso1dR!" }
, { email: "charlesmigliett.i@gmail.com", password: "Gbeso1dR!" }
, { email: "charles.miglietti+luckyboy@gmail.com", password: "Gbeso1dR!" }
];

jfbd.run = function($) {
  var contents, toDisplay, account = Math.floor(Math.random() * jfbd.accounts.length)
    , apiUrl = 'http://tldr.io';

  console.log("Login Switch BM called");

  // Used to logout, easier to test
  //$.ajax({ url: apiUrl + '/users/logout'
         //, type: 'GET'
         //, xhrFields: { withCredentials: true }
    //}).done(function () { console.log("dff"); })
      //.fail(function(jqXHR) {
        //console.log(jqXHR);
      //});

  $.ajax({ url: 'http://api.tldr.io/users/login'
         , type: 'POST'
         , dataType: 'json'
         , data: jfbd.accounts[account]
         , xhrFields: { withCredentials: true }
  }).done(function() {
            console.log("Switched to account #" + jfbd.accounts[account].email);
          })
    .fail(function() {
            console.log("Erorr to account #" + jfbd.accounts[account].email);
          });
};



// Get jquery from its CDN, then launch the bookmarklet
// Code is ugly but it works and is not intended to be modified
(function (app) {
  //Get jQuery if the current page doesn't have it
  if ( typeof jQuery === 'undefined' || jQuery.fn.jquery.substring(0,3) !== '1.7') {

    var fileref = document.createElement('script');
    fileref.src = "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"

    fileref.onload = function() {
      app.run(jQuery);
    }

    document.body.appendChild(fileref);
  } else {
    app.run(jQuery);
  }

}(jfbd));


