/**
 * Environement / Config Module
 */


var env = {}
  , protocol = 'https:';

env.name = 'production';
env.host = 'tldr.io';
env.apiUrl = 'https://api.tldr.io';
env.websiteUrl = 'http://tldr.io';
env.pageBaseUrl = protocol + 'tldr.io';
env.baseUrl = protocol + 'tldr.io/iframe';
env.BMBaseUrl = protocol + 'tldr.io/bookmarklet';
env.extensionBaseUrl = protocol + 'tldr.io/firefox/public';
env.embedBaseUrl = protocol + 'tldr.io/embed';
env.mixpanelToken = "bbab35cee590d192ebd7fec3e8c88dee";
env.firefoxExtensionAPICreds = { 'api-client-name': 'firefox-ext-prod', 'api-client-key': 'VkLGTWnKPMWQhDkvtDBz' };
env.BMAPICreds = { 'api-client-name': 'bm-prod', 'api-client-key': 'fF5TVeCAlTqsLjEpNCb9' };
env.proxyBaseUrl = 'http://proxy.tldr.io';

exports.env = env;
