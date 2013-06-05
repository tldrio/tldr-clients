// Open Chrome ext tab on install
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    var openCrxPage = true;
    chrome.tabs.query({active: true}, function (results) {
      results.forEach( function(tab) {
        if (tab.url.match(/tldr.io/)) {
          openCrxPage = false;
        }
      });
      if (openCrxPage) {
        chrome.tabs.create({url: 'http://tldr.io/signup?returnUrl=/browser-extension%3Finstalled'});
      }
    });
  }
});

