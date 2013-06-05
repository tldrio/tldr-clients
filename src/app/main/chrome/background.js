require([ 'devmodeRetroCompatibility'
        , 'lib/blackList'
        , 'lib/environment'
        , 'lib/whitelist'
        , 'mixpanel'
        , 'jquery'
        , 'underscore'
        ],
function (
  devmodeRetroCompatibility
, globalBlackList
, env
, whitelist
, mixpanelInit   // Only needed in the entry point as this module defines a global mixpanel object
, $
, _
) {

  var tldrData = {}
    , embedData = {}
    , userData = {}
    , syncUnloggedUserWithMixpanel = false
    , syncLoggedUserWithMixpanel = false;

  mixpanel.tldr_d4a6ebe3.register({ from: 'Chrome Extension' });

  // Show page action icon in omnibar.
  function showPageAction (tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {

      var localBlackList = JSON.parse(localStorage['tldr-d4a6ebe3-blackList'] || '[]')
        , disableAll = JSON.parse(localStorage['tldr-d4a6ebe3-disableCheck'] || false)
        , tldr
        , url = tab.url
        , checkTldr = true
        , regexp
        , isTldrPage
        , isProfilePage
        , blackList;


      if (disableAll) {
        DEVMODE && console.log('Check is completely disabled');
        chrome.pageAction.hide(tabId);
        return;
      }

      blackList = _.union(localBlackList, globalBlackList.tldrCheckBlackList, globalBlackList.pornList);

      blackList.forEach(function(element) {
        regexp = new RegExp("^" + element.replace(/[.]/g,'[.]').replace(/\*/g, ".*") + "$");
        if (url.match(regexp)) {
          checkTldr = false;
        }
      });

      isTldrPage = url.match(new RegExp(env.websiteUrl + '/tldrs/[a-f0-9]{24}/.+'));
      isProfilePage = url.match(new RegExp(env.websiteUrl + '/(?!(about|account|confirmEmail|login|index|browser-extension|signup|what-is-tldr|forgotPassword|resetPassword|third-party-auth|discover|forum|moderation))'));

      if (isTldrPage || isProfilePage) {
        DEVMODE && console.log('Easter Egg');
        chrome.pageAction.setIcon({ tabId: tabId, path: 'assets/img/icon38-green.png'});
        chrome.pageAction.show(tabId);
        chrome.tabs.executeScript(tabId, {
          code: "chrome.extension.sendMessage({ action: 'EXECUTE_CONTENT_SCRIPT' , type: 'OVERLAY' , loaded: window.tldr_d4a6ebe3_inject_overlay|| false });"
        });
        if (isTldrPage) {
          tldrData[tabId] = { easterEgg: 'assets/img/easter-tldr-page.jpg'};
        } else if (isProfilePage) {
          tldrData[tabId] = { easterEgg: 'assets/img/easter-profile-page.jpg'};
        }
        return;
      }


      if (checkTldr) {

        chrome.tabs.executeScript(tabId, {
          code: "chrome.extension.sendMessage({ action: 'EXECUTE_CONTENT_SCRIPT' , type: 'OVERLAY' , loaded: window.tldr_d4a6ebe3_inject_overlay|| false });"
        });

        // Search batch request to avoid readcount being incremented
        $.ajax({ url: env.apiUrl + '/tldrs/searchBatch'
               , type: 'POST'
               , dataType: 'json'
               , accepts: 'application/json'
               , contentType: 'application/json'
               , data: JSON.stringify({ batch: [url] })
               })
          .done(function (data) {
            if (_.isEmpty(data.tldrs)) {
              tldrData[tabId] = null;
              chrome.pageAction.setIcon({ tabId: tabId, path: 'assets/img/icon38-red.png'});
              chrome.pageAction.show(tabId);
            } else {
              tldrData[tabId] = data.tldrs[0];
              chrome.pageAction.setIcon({ tabId: tabId, path: 'assets/img/icon38-green.png'});
              chrome.pageAction.show(tabId);
            }
          })
          .fail(function (jqXHR) {
            if (jqXHR.status === 404) {
              tldrData[tabId] = null;
              chrome.pageAction.setIcon({ tabId: tabId, path: 'assets/img/icon38-red.png'});
              chrome.pageAction.show(tabId);
            }
          });
      } else {
        DEVMODE && console.log('Page blacklisted');
        chrome.pageAction.hide(tabId);
      }

    }
  }

  // injectEmbed
  function injectEmbed (tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {

      var disableEmbed = JSON.parse(localStorage['tldr-d4a6ebe3-disableEmbed'] || false);

      if (disableEmbed) {
        DEVMODE && console.log('Embed is disabled');
        return;
      }

      if (tab.url.match( new RegExp('news.ycombinator.com/item')) || tab.url.match( new RegExp('reddit.com/.*/comments/.*'))) {
        DEVMODE && console.log('Inject Embed');
        chrome.tabs.executeScript(tabId, {
          code: "chrome.extension.sendMessage({ action: 'EXECUTE_CONTENT_SCRIPT' , type: 'EMBED' , loaded: window.tldr_d4a6ebe3_inject_embed || false });"
        });
      }
    }
  }

  // allow display summaries by hovering over links
  function injectPopoverOnHover (tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {

      var disablePreview = JSON.parse(localStorage['tldr-d4a6ebe3-disablePreview'] || false);

      if (disablePreview) {
        DEVMODE && console.log('Preview is disabled');
        return;
      }
      chrome.tabs.executeScript(tabId, {
        code: "chrome.extension.sendMessage({ action: 'EXECUTE_CONTENT_SCRIPT' , type: 'PREVIEW_POPOVER' , loaded: window.tldr_d4a6ebe3_inject_preview_popover || false });"
      });

    }
  }

  function syncUserDataWithMixpanel (data) {
    // We have a logged user
    if (Object.keys(data).length > 0) {
      if (!syncLoggedUserWithMixpanel) {
        syncLoggedUserWithMixpanel = true;
        syncUnloggedUserWithMixpanel = false;
        mixpanel.tldr_d4a6ebe3.register({ "isLogged": true, "isAdmin": data.isAdmin });
        mixpanel.tldr_d4a6ebe3.identify(data.username);
        mixpanel.tldr_d4a6ebe3.name_tag(data.username);
        $.ajax({ url: chrome.extension.getURL('manifest.json')})
         .done(function(data) {
          mixpanel.tldr_d4a6ebe3.people.set({ $email: data.email
                                            , $username: data.username
                                            , $last_login: new Date()
                                            , "version": JSON.parse(data).version
                                            });
         });
      }

    } else {
      if (!syncUnloggedUserWithMixpanel) {
        syncLoggedUserWithMixpanel = false;
        syncUnloggedUserWithMixpanel = true;
        mixpanel.tldr_d4a6ebe3.unregister('mp_name_tag');
        mixpanel.tldr_d4a6ebe3.register({ "isLogged": false, "isAdmin": false });
      }
    }
  }

  function identifyUser () {
    // Identify user
    //$.ajax({ url: 'http://api.tldr.io/staging/users/you'
    $.ajax({ url: env.apiUrl + '/users/you'
           , type: 'GET'
           , headers: env.chromeExtensionAPICreds
           , dataType: 'json'
           , accepts: 'application/json'
           })
      .done(function (data, textStatus, jqXHR) {
        DEVMODE && console.log('username', data.username);
        userData = data;
        syncUserDataWithMixpanel(userData);
      })
      .fail(function () {
        syncUserDataWithMixpanel({});
      })
      ;
  }

  function relayMessagesForPopover () {
    var tldrs = {}
      , previews = {};
    chrome.extension.onMessage.addListener(function (message, sender, callback) {
      switch(message.action) {
        case 'CTA_IMPROVE_SUMMARY':
          chrome.tabs.create({url: message.previewData.url}, function (tab) {
            chrome.tabs.executeScript(tab.id, { code: 'window.tldr_cta_improve_summary=true;', runAt: 'document_end'});
          });
          break;
        case 'STORE_TLDR_DATA_IN_BACKGROUND':
          tldrs[message.tldrData._id] = { tldrData: message.tldrData };
          break;
        case 'STORE_PREVIEW_DATA_IN_BACKGROUND':
          previews[message.previewData.id] = message.previewData;
          break;
        case 'PRERENDER_POPOVER':
          chrome.tabs.sendMessage(sender.tab.id, { action: 'PRERENDER_POPOVER'
                                                 , tldrData: tldrs[message.tldrId].tldrData
                                                 , hostname: message.hostname
          });
          break;
        case 'PRERENDER_PREVIEW_POPOVER':
          chrome.tabs.sendMessage(sender.tab.id, { action: 'PRERENDER_PREVIEW_POPOVER'
                                                 , previewData: previews[message.previewId]
          });
          break;
        case 'SEND_POPOVER_TIP':
          chrome.tabs.sendMessage(sender.tab.id, { action: 'PLACE_POPOVER_TIP'
                                                 , placement: message.placement
          });
          break;
        case 'REMOVE_POPOVER_TIP':
        case 'POSITION_POPOVER':
        case 'SWITCH_POPOVER_IN_EDIT_MODE':
          chrome.tabs.sendMessage(sender.tab.id, message);
          break;
        case 'TRACK_HOVER':
          mixpanel.tldr_d4a6ebe3.track('[TldrRead]', { url: message.url
                                                     , timeStamp: (new Date()).toISOString()
                                                     , referrer: message.referrer
                                                     , channel: 'Badge' });
          mixpanel.tldr_d4a6ebe3.people.increment({ "readCount": 1
                                                  , "readViaCRX": 1
                                                  , "readWithBadge": 1
                                                  , "readsSinceLastContribution": 1
          });
          callback();
          break;
        case 'TRACK_PREVIEW':
          mixpanel.tldr_d4a6ebe3.track('[Preview]', { entry: message.entry
                                                     , timeStamp: (new Date()).toISOString()
                                                     , referrer: message.referrer
                                                     , type: message.type
                                                     });
          mixpanel.tldr_d4a6ebe3.people.increment({ "readPreview": 1 });
          callback();
          break;
        case 'SET_POPOVER_HEIGHT':
          //DEVMODE && console.log('SET_POPOVER_HEIGHT', message);
          chrome.tabs.sendMessage(sender.tab.id, message);
          break;
        case 'UPDATE_PREVIEW_DATA':
          previews[message.previewData.id] = message.previewData;
          break;
        case 'UPDATE_TLDR_DATA':
          tldrs[message.tldrData._id].tldrData = message.tldrData;
          break;
      }
    });
  }

  function handleWidgetEmbedRequests () {
    chrome.extension.onMessage.addListener(function (message, sender, callback) {
      switch(message.action) {
        case 'SET_EMBED_DATA':
          embedData[sender.tab.id] = message.data;
          callback();
          break;
        case 'DISMISS_IFRAME_EMBED':
        case 'SET_IFRAME_EMBED_HEIGHT':
          chrome.tabs.sendMessage(sender.tab.id, message);
          break;
        case 'GET_EMBED_DATA':
          callback({ userData: userData, tldrData: embedData[sender.tab.id] });
          break;
      }
    });
  }

  function handleOverlayRequests () {
    chrome.extension.onMessage.addListener(function (message, sender, callback) {

      var validForContributionOnboarding = true
        , validForReadOnboarding = true
        , validForCTAContribution = true
        , validToShowCTA = true
        , triggerCTAContribution = true
        , PERIOD_CTA_CONTRIBUTION = 5
        , currentTldrData
        , mixpanelData;

      switch(message.action) {
        case 'GET_ONBOARDING_READ_STATUS':
          validForReadOnboarding = !localStorage['tldr-d4a6ebe3-first-read-onboarding'];
          validForReadOnboarding = validForReadOnboarding && tldrData[sender.tab.id];
          validForReadOnboarding = validForReadOnboarding && !globalBlackList.isBlacklistedDomainForReadOnboarding(message.domain);
          callback(validForReadOnboarding);
          break;
        case 'ONBOARDING_SHOWN':
          if (message.type === 'READ') {
            localStorage['tldr-d4a6ebe3-first-read-onboarding'] = true;
            mixpanel.tldr_d4a6ebe3.track('[OnboardingFirstRead]', { url: sender.tab.url
                                                         , timeStamp: (new Date()).toISOString()
            });
          }
          break;
        case 'SHOW_IFRAME_CRX':
          currentTldrData = tldrData[sender.tab.id];
          mixpanelData = { url: sender.tab.url
                         , timeStamp: (new Date()).toISOString()
                         , channel: 'Overlay'
                         };

          if (currentTldrData) {
            $.ajax({ url: env.apiUrl + '/tldrs/'+ currentTldrData._id
                   , type: 'PUT'
                   , dataType: 'json'
                   , accepts: 'application/json'
                   , contentType: 'application/json'
                   , data: JSON.stringify({ incrementReadCount: 1 })
                   });
            if (message.after) {
              mixpanelData.after = message.after;
            }
            mixpanel.tldr_d4a6ebe3.track('[TldrRead]', mixpanelData);
            mixpanel.tldr_d4a6ebe3.people.increment({ 'readCount': 1
                                                    , 'readViaCRX': 1
                                                    , "readWithOverlay": 1
                                                    , 'readsSinceLastContribution': 1
            });
          } else {
            if (message.after) {
              mixpanelData.after = message.after;
            }
            mixpanel.tldr_d4a6ebe3.track('[TldrCreate]', mixpanelData);
          }
          break;
      }
    });

    chrome.tabs.onActivated.addListener(function(activeInfo) {
      chrome.tabs.sendMessage(activeInfo.tabId, { action: 'TAB_ACTIVE'});
    });
  }


  function relayMessagesForOverlay () {
    chrome.extension.onMessage.addListener(function (message, sender, callback) {
      var currentTldrData;

      switch(message.action) {
        case 'CLOSE_IFRAME':
        case 'INIT_DONE':
        case 'SCRAPE_METADATA':
        case 'SET_IFRAME_HEIGHT':
        case 'STORE_METADATA':
        case 'SHOW_ONBOARDING_CONTRIBUTION':
        case 'SWITCH_IFRAME_MODE':
          //DEVMODE && console.log('Relaying message', message);
          chrome.tabs.sendMessage(sender.tab.id, message);
          if (message.mode === 'edit' && tldrData[sender.tab.id]) {
            mixpanel.tldr_d4a6ebe3.track('[TldrEdit]', { url: sender.tab.url, timeStamp: (new Date()).toISOString() });
          }
          callback();
          break;
        case 'TLDR_SAVED':
          chrome.pageAction.setIcon({ tabId: sender.tab.id, path: 'assets/img/icon38-green.png'});
          chrome.pageAction.show(sender.tab.id);
          mixpanel.tldr_d4a6ebe3.people.set({ 'readsSinceLastContribution': 0 });
          break;
        case 'SYNC_USER_DATA':
          DEVMODE && console.log('Sync user data', message.data);
          if (userData.username !== message.data.username) {
            userData = message.data;
            syncUserDataWithMixpanel(userData);
            chrome.tabs.query({}, function (tabList) {
              tabList.forEach(function (tab) {
                chrome.tabs.sendMessage(tab.id, message);
              });
            });
          }
          break;
        case 'GET_TLDR_DATA_FOR_IFRAME':
          callback(tldrData[sender.tab.id]);
          break;
        }
    });
  }

  function setupToggleTldr () {
    chrome.pageAction.onClicked.addListener(function(tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_TLDR' });
      mixpanel.tldr_d4a6ebe3.people.increment({ "toggleCount": 1 });
    });
  }

  function executeContentScripts () {
    chrome.extension.onMessage.addListener(function (message, sender, callback) {
      if (message.action === 'EXECUTE_CONTENT_SCRIPT') {
        if (message.type === 'OVERLAY' && !message.loaded) {
          chrome.tabs.executeScript(sender.tab.id, { file: 'src/overlay.outer.js'
                                          , runAt: 'document_end'});
        }
        if (message.type === 'EMBED' && !message.loaded) {
          chrome.tabs.insertCSS(sender.tab.id, { file: "assets/css/inject-embed.outer.css", runAt: 'document_start' });
          chrome.tabs.executeScript(sender.tab.id, { file: 'src/inject-embed.outer.js'
                                          , runAt: 'document_end'});
        }
        if (message.type === 'PREVIEW_POPOVER' && !message.loaded) {
          chrome.tabs.insertCSS(sender.tab.id, { file: "assets/css/popover.outer.css", runAt: 'document_start' });
          chrome.tabs.executeScript(sender.tab.id, { file: 'src/preview-popover.outer.js'
                                          , runAt: 'document_end'});
        }
      }
    });
  }


  function init () {
    // Call the above function when the url of a tab changes.
    chrome.tabs.onUpdated.addListener(showPageAction);
    chrome.tabs.onUpdated.addListener(injectEmbed);
    chrome.tabs.onUpdated.addListener(injectPopoverOnHover);
    identifyUser();
    setupToggleTldr();
    relayMessagesForPopover();
    handleOverlayRequests();
    handleWidgetEmbedRequests();
    relayMessagesForOverlay();
    executeContentScripts();
  }

  init();

});
