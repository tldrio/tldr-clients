var pageMod = require("sdk/page-mod")
  , self = require("sdk/self")
  , Request = require("sdk/request").Request
  , tabs = require("sdk/tabs")
  , env = {}
  , urlbarButton = require('urlbarbutton').UrlbarButton
  , showForPage = require('showforpage').ShowForPage
  , button
  , listeners
  , redBadgePath = self.data.url("assets/img/icon19-red.png")
  , greenBadgePath = self.data.url("assets/img/icon19-green.png")
  , workers = {}
  , tldrData = {}
  , userData = {}
  , prefs = require('simple-prefs').prefs
  , globalBlackList = require('./blackList').blackList
  , env = require('./environment').env; // WARNING: This is not the src/app/lib/environment.js module but a separate file environment-{ENV}.js



// Inject content script for the badges/popovers
pageMod.PageMod({
    include: [ /.*news\.ycombinator\.com.*/
             , /.*www.reddit.com.*/
             , /.*longreads.com.*/
             , /.*techmeme.com.*/
             , /.*thefeature.net.*/
             , /.*blog.eladgil.com.*/
             , /.*getpocket.com\/(read|list|unread).*/
             , /.*pinboard.in.*/]
  //, contentStyleFile: self.data.url('assets/css/popover.outer.css')
  , contentScriptFile: self.data.url('src/popover.outer.js')
  , onAttach: function(worker) {
    // Object which will store all the tldrs data for the badges
    var tldrs = {};

    // Background receive the urls to look for and send the results to CS
    worker.port.on('SEND_URLS_FOR_POWERTIPS_TO_BACKGROUND', function ($linksList) {
      new Request({ url: env.apiUrl + '/tldrs/searchBatch'
             , contentType: 'application/json'
             , content: JSON.stringify({ batch: $linksList })
             , headers: env.firefoxExtensionAPICreds
             , onComplete: function (response) {
               worker.port.emit('SEND_TLDRS_FOR_POWERTIPS_TO_CONTENT_SCRIPT', response.json);
             }
             }).post();

    });

    worker.port.on('POSITION_POPOVER', function (data) {
      worker.port.emit('POSITION_POPOVER');
    });
    worker.port.on('REMOVE_POPOVER_TIP', function (data) {
      worker.port.emit('REMOVE_POPOVER_TIP', data);
    });
    worker.port.on('SEND_POPOVER_TIP', function (data) {
      worker.port.emit('SEND_POPOVER_TIP', data);
    });
    worker.port.on('PRERENDER_POPOVER', function (data) {
      worker.port.emit('PRERENDER_POPOVER', tldrs[data._id]);
    });
    // Sync Userdata
    worker.port.on('SYNC_USER_DATA', function (data) {
      if (userData.username !== data.username) {
        userData = data;
        sendEventToAllWorkers('SYNC_USER_DATA', data);
      }
    });

    // Store the tldrData in tldrs object
    worker.port.on('STORE_TLDR_DATA_IN_BACKGROUND', function (data) {
      tldrs[data.tldrData._id] = data;
    });
    worker.port.on('UPDATE_TLDR_DATA', function (data) {
      tldrs[data.tldrData._id] = data;
    });
    worker.port.on('POPOVER_OPENED', function (data) {
      // Send request to increment readCount
      new Request({ url: env.apiUrl + '/tldrs/'+ data.tldrId
             , contentType: 'application/json'
             , content: JSON.stringify({ incrementReadCount: 1 })
             , headers: env.firefoxExtensionAPICreds
             }).put();
    });
  }
});


function checkLocation (url) {
  if (url.indexOf('http') !== 0) {
    button.setVisibility(false, url);
  } else if (tldrData[url]) {
    if (tldrData[url]._id) {
      button.setImage(greenBadgePath, url);
    } else {
      button.setImage(redBadgePath, url);
    }
    button.setVisibility(true, url);
  } else {
    button.setVisibility(false, url);
  }
}


// Called when user click on icon in url bar
function toggleOverlay (url, event) {
  if (event.type !== "click" || event.button !== 0) {
     return;
  }

  // As we can't know which tab triggered the toggle we
  // advertise all the tabs with the same url
  sendEventToWorkersForUrl(workers[url], 'TOGGLE_TLDR');
  //workers[url].forEach(function (worker) {
    //worker.port.emit('TOGGLE_TLDR');
  //});
}

function sendEventToWorkersForUrl (workers, event, data) {
  workers.forEach(function (worker) {
    worker.port.emit(event, data);
  });
}

// Send the SYNC_USER_DATA event to all workers
function sendEventToAllWorkers (event, data) {
  var url;
  for (url in workers ) {
    if (workers.hasOwnProperty(url) ) {
      sendEventToWorkersForUrl(workers[url], event, data);
    }
  }
}

// We index the workers by url as tab have no id in FF (facepalm)
// This means that if 2 tabs have the same url we have to store the 2 workers
function storeWorker (worker, url) {
  if (workers[url]) {
    workers[url].push(worker);
  } else {
    workers[url] = [worker];
  }
}

function detachWorker(worker, url) {
  var workersForUrl = workers[url]
    , index = workersForUrl.indexOf(worker);
  if (index !== -1) {
    workersForUrl.splice(index, 1);
    if (workersForUrl.length === 0) {
      delete workers[url];
    }
  }
}

function showPageAction (tab) {

  var url = tab.url
    , worker
    , isProfilePage
    , isTldrPage
    , blackList
    , regexp
    , checkTldr = true;

  // Handle blacklisting of certain resources
  blackList = globalBlackList.tldrCheckBlackList.concat(globalBlackList.pornList);
  blackList.forEach(function(element) {
    regexp = new RegExp("^" + element.replace(/[.]/g,'[.]').replace(/\*/g, ".*") + "$");
    if (url.match(regexp)) {
      checkTldr = false;
    }
  });

  if (!checkTldr || url.indexOf('http') === -1 || !prefs.checkTldr) {
    return;
  }

  // Inject content script for Overlay
  worker = tab.attach({
    contentScriptFile: self.data.url('src/overlay.outer.js')
  });
  // Store the worker - Used when toggling
  storeWorker(worker, url);

  worker.on('detach', function () {
    detachWorker(this, url);
  });

  // Send the tldrData upon request
  worker.port.on('GET_TLDR_DATA_FOR_IFRAME', function (data) {
    worker.port.emit('GET_TLDR_DATA_FOR_IFRAME', tldrData[url]);
  });

  worker.port.on('TLDR_SAVED', function (data) {
    button.setImage(greenBadgePath, url);
    button.setVisibility(true, url);
    tldrData[url] = data;
  });

  // Sync Userdata
  worker.port.on('SYNC_USER_DATA', function (data) {
    if (userData.username !== data.username) {
      userData = data;
      sendEventToAllWorkers('SYNC_USER_DATA', data);
    }
  });

  // Support for easter eggs
  isTldrPage = url.match(new RegExp(env.websiteUrl + '/tldrs/[a-f0-9]{24}/.+'));
  isProfilePage = url.match(new RegExp(env.websiteUrl + '/(?!(about|account|confirmEmail|login|index|browser-extension|signup|what-is-tldr|forgotPassword|resetPassword|third-party-auth|discover|forum|moderation))'));
  if (isTldrPage || isProfilePage) {
    button.setImage(greenBadgePath, url);
    button.setVisibility(true, url);
    if (isTldrPage) {
      tldrData[url] = { _id: 'fakeid', easterEgg: '/assets/img/easter-tldr-page.jpg'};
    } else if (isProfilePage) {
      tldrData[url] = { _id: 'fakeid', easterEgg: '/assets/img/easter-profile-page.jpg'};
    }
    return;
  }

  new Request({ url: env.apiUrl + '/tldrs/searchBatch'
         , contentType: 'application/json'
         , content: JSON.stringify({ batch: [url] })
         , headers: env.firefoxExtensionAPICreds
         , onComplete: function (response) {
           if (response.status === 200) {
             var data = response.json;
             if (data.tldrs.length) {
               tldrData[url] = data.tldrs[0];
               button.setImage(greenBadgePath, url);
               button.setVisibility(true, url);
             } else {
               tldrData[url] = {};
               button.setImage(redBadgePath, url);
               button.setVisibility(true, url);
             }
           }
         }
         }).post();

}

function injectEmbed (tab) {
  var url = tab.url
    , worker
    , embedData;

  if (!prefs.injectEmbed) {
    return;
  }

  if (url.match( new RegExp('news.ycombinator.com/item')) || url.match( new RegExp('reddit.com/.*/comments/.*'))) {
    // Inject content script for Embed in HN/Reddit pages
    worker = tab.attach({
      contentScriptFile: self.data.url('src/inject-embed.outer.js')
    });

    // Store the worker - Used when toggling
    storeWorker(worker, url);

    worker.on('detach', function () {
      detachWorker(this, url);
    });

    worker.port.on('GET_EMBED_DATA', function (data) {
      worker.port.emit('GET_EMBED_DATA', {tldrData: embedData, userData: userData});
    });

    worker.port.on('SYNC_USER_DATA', function (data) {
      if (userData.username !== data.username) {
        userData = data;
        sendEventToAllWorkers('SYNC_USER_DATA', data);
      }
    });

    worker.port.on('FETCH_EMBED_DATA', function (data) {
      new Request({ url: env.apiUrl + '/tldrs/searchBatch'
             , contentType: 'application/json'
             , headers: env.firefoxExtensionAPICreds
             , content: JSON.stringify({ batch: [data.url] })
             , onComplete: function (response) {
                embedData = response.json.tldrs[0];
             }
             }).post();
    });
  }
}

function injectPreviews (tab) {
  var url = tab.url
    , worker
    , tldrs = {}
    , previews = {};

  if (!prefs.injectPreviews) {
    return;
  }

  worker = tab.attach({
    contentScriptFile: self.data.url('src/preview-popover.outer.js')
  });

  // Store the worker - Used when toggling
  storeWorker(worker, url);

  worker.on('detach', function () {
    detachWorker(this, url);
  });


  // Background receive the urls to look for and send the results to CS
  worker.port.on('SEND_URLS_FOR_POWERTIPS_TO_BACKGROUND', function ($linksList) {
    new Request({ url: env.apiUrl + '/tldrs/searchBatch'
           , contentType: 'application/json'
           , content: JSON.stringify({ batch: $linksList })
           , headers: env.firefoxExtensionAPICreds
           , onComplete: function (response) {
             worker.port.emit('SEND_TLDRS_FOR_POWERTIPS_TO_CONTENT_SCRIPT', response.json);
           }
           }).post();

  });

  worker.port.on('SEND_ENTRIES_FOR_PREVIEW_TO_BACKGROUND', function (entries) {
    new Request({ url: env.proxyBaseUrl + '/duckduckgo'
           , contentType: 'application/json'
           , content: JSON.stringify({ batch: entries })
           , onComplete: function (response) {
             worker.port.emit('SEND_ENTRIES_FOR_PREVIEW_TO_CONTENT_SCRIPT', response.json);
           }
           }).post();

  });

  worker.port.on('POSITION_POPOVER', function (data) {
    worker.port.emit('POSITION_POPOVER');
  });
  worker.port.on('REMOVE_POPOVER_TIP', function (data) {
    worker.port.emit('REMOVE_POPOVER_TIP', data);
  });
  worker.port.on('SEND_POPOVER_TIP', function (data) {
    worker.port.emit('SEND_POPOVER_TIP', data);
  });
  worker.port.on('PRERENDER_POPOVER', function (data) {
    worker.port.emit('PRERENDER_POPOVER', tldrs[data._id]);
  });
  worker.port.on('PRERENDER_PREVIEW_POPOVER', function (data) {
    worker.port.emit('PRERENDER_PREVIEW_POPOVER', previews[data.previewId]);
  });
  worker.port.on('CTA_IMPROVE_SUMMARY', function (data) {
    tabs.open({ url: data.url
              , onReady: function(tab) {
      tab.attach({
        contentScript: 'unsafeWindow.tldr_cta_improve_summary=true;'
      });
    }
    });
  });
  worker.port.on('STORE_PREVIEW_DATA_IN_BACKGROUND', function (data) {
    previews[data.previewData.id] = data;
  });
  // Store the tldrData in tldrs object
  worker.port.on('STORE_TLDR_DATA_IN_BACKGROUND', function (data) {
    tldrs[data.tldrData._id] = data;
  });
  worker.port.on('UPDATE_TLDR_DATA', function (data) {
    tldrs[data.tldrData._id] = data;
  });
  worker.port.on('POPOVER_OPENED', function (data) {
    // Send request to increment readCount
    new Request({ url: env.apiUrl + '/tldrs/'+ data.tldrId
           , contentType: 'application/json'
           , content: JSON.stringify({ incrementReadCount: 1 })
           , headers: env.firefoxExtensionAPICreds
           }).put();
  });
  // Sync Userdata
  worker.port.on('SYNC_USER_DATA', function (data) {
    if (userData.username !== data.username) {
      userData = data;
      sendEventToAllWorkers('SYNC_USER_DATA', data);
    }
  });
}

tabs.on('ready', function (tab) {
  showPageAction(tab);
  injectEmbed(tab);
  injectPreviews(tab);
});

exports.main = function (options) {
  var tab,i;
  // Open signup page on install
  if (options.loadReason === 'install') {
    for (i = 0; i < tabs.length; i += 1) {
      tab = tabs[i];
          if (tab.url === tabs.activeTab.url) {
            tab.url = env.websiteUrl + '/signup?returnUrl=/browser-extension%3Finstalled';
          }
    }
  }
  // Button that we display in the urlbar
  button = urlbarButton({
     id : 'foobar-button'
   , image : redBadgePath
   , onClick: toggleOverlay
  });

  // Listen on tab change to update the button
  listeners = showForPage({
    onLocationChange : checkLocation
  });

  new Request({ url: env.apiUrl + '/users/you'
         , type: 'GET'
         , headers: env.firefoxExtensionAPICreds
         , dataType: 'json'
         , accepts: 'application/json'
         , onComplete: function (response) {
             var data = response.json;
             userData = data;
         }
         }).get();
};

exports.onUnload = function (reason) {
  if (reason !== 'shutdown') {
    button.remove();
    listeners.remove();
  }
};

