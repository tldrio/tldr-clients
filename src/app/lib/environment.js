/**
 * Environement / Config Module
 */


define(['devmodeRetroCompatibility'], function (devmodeRetroCompatibility) {

  var env = {}
    , protocol = 'https:' === document.location.protocol ? 'https://' : 'http://'
    ;

  // Strange construct but the only way I found to use has.js which is recommended by requireJS (http://requirejs.org/docs/optimization.html#hasjs)
  // If directly executed, the call to has() throws an exception so env is not rewritten. If built with r.js, the call to has() is replaced
  // by true or false depending on the build profile
  try {
    if (has('local') ) {
      protocol = 'http://';
      env.name = 'local';
      env.host = 'localhost:8888';
      env.apiUrl = protocol + 'localhost:8787';
      env.websiteUrl = protocol + 'localhost:8888';
      env.pageBaseUrl = protocol + 'localhost:8888';
      env.baseUrl = protocol + 'localhost:8888/iframe';
      env.extensionBaseUrl = protocol + 'localhost:8888/firefox/public';
      env.BMBaseUrl = protocol + 'localhost:8888/bookmarklet';
      env.embedBaseUrl = 'http://localhost:8888';
      env.proxyBaseUrl = 'http://localhost:8914';
      env.mixpanelToken = "9a04cbef8eb564642205ec7afeb1bbcb";
      env.chromeExtensionAPICreds = { 'api-client-name': 'chrome-ext-local', 'api-client-key': 'JjlZcfAW8NMFWXSCIeiz' };
      env.firefoxExtensionAPICreds = { 'api-client-name': 'firefox-ext-local', 'api-client-key': 'VkLGTWnKPMWQhDkvtDBz' };
      env.BMAPICreds = { 'api-client-name': 'bm-local', 'api-client-key': 'fF5TVeCAlTqsLjEpNCb9' };
    }
    else if (has('prod') ) {
      env.name = 'production';
      env.host = 'tldr.io';
      env.apiUrl = 'https://api.tldr.io';
      env.websiteUrl = protocol + 'tldr.io';
      env.pageBaseUrl = protocol + 'tldr.io';
      env.baseUrl = protocol + 'tldr.io/iframe';
      env.BMBaseUrl = protocol + 'tldr.io/bookmarklet';
      env.extensionBaseUrl = protocol + 'tldr.io/firefox/public';
      env.embedBaseUrl = 'https://tldr.io';
      env.proxyBaseUrl = 'http://proxy.tldr.io';
      env.mixpanelToken = "bbab35cee590d192ebd7fec3e8c88dee";
      env.chromeExtensionAPICreds = { 'api-client-name': 'chrome-ext-prod', 'api-client-key': 'JjlZcfAW8NMFWXSCIeiz' };
      env.firefoxExtensionAPICreds = { 'api-client-name': 'firefox-ext-prod', 'api-client-key': 'VkLGTWnKPMWQhDkvtDBz' };
      env.BMAPICreds = { 'api-client-name': 'bm-prod', 'api-client-key': 'fF5TVeCAlTqsLjEpNCb9' };
    }
    else if (has('staging')) {
      env.name = 'staging';
      env.host = 'staging.tldr.io';
      env.apiUrl = 'https://api.tldr.io/staging';
      env.websiteUrl = protocol + 'staging.tldr.io';
      env.pageBaseUrl = protocol + 'staging.tldr.io';
      env.baseUrl = protocol + 'staging.tldr.io/iframe';
      env.BMBaseUrl = protocol + 'staging.tldr.io/bookmarklet';
      env.extensionBaseUrl = protocol + 'staging.tldr.io/firefox/public';
      env.embedBaseUrl = 'https://staging.tldr.io';
      env.proxyBaseUrl = 'http://proxy.tldr.io';
      env.mixpanelToken = "64223fb861fd99302a8d85c70c260ed3";
      env.chromeExtensionAPICreds = { 'api-client-name': 'chrome-ext-staging', 'api-client-key': 'JjlZcfAW8NMFWXSCIeiz' };
      env.firefoxExtensionAPICreds = { 'api-client-name': 'firefox-ext-staging', 'api-client-key': 'VkLGTWnKPMWQhDkvtDBz' };
      env.BMAPICreds = { 'api-client-name': 'bm-staging', 'api-client-key': 'fF5TVeCAlTqsLjEpNCb9' };
    }
  } catch(e) {}

  DEVMODE && console.log("[Environment] Current environment is ", env.name);

  return env;
});
