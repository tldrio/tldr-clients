
/**
 * Module for detecting if 3rd party cookies are enabled
 */

define(function(){

  function isEnabled () {
    var allCookies
      , res = false;

    document.cookie = 'testThirdPartyCookies=1';
    allCookies = document.cookie.replace(' ', '').split(';');
    // weird but the replace doesn't seem to work in my chrome (stan)
    if (allCookies.indexOf('testThirdPartyCookies=1') !== -1 || allCookies.indexOf(' testThirdPartyCookies=1') !== -1) {
      res = true;
    }
    return res;
  }

  return {
    isEnabled: isEnabled
  };

});

