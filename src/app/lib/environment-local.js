/**
 * Environement / Config Module
 */


var env = {}
  , protocol = 'http://';

env.name = 'local';
env.host = 'localhost:8888';
env.apiUrl = protocol + 'localhost:8787';
env.websiteUrl = protocol + 'localhost:8888';
env.pageBaseUrl = protocol + 'localhost:8888';
env.baseUrl = protocol + 'localhost:8888/iframe';
env.extensionBaseUrl = protocol + 'localhost:8888/firefox/public';
env.BMBaseUrl = protocol + 'localhost:8888/bookmarklet';
env.embedBaseUrl = protocol + 'localhost:8888/embed';
env.mixpanelToken = "9a04cbef8eb564642205ec7afeb1bbcb";
env.firefoxExtensionAPICreds = { 'api-client-name': 'firefox-ext-local', 'api-client-key': 'VkLGTWnKPMWQhDkvtDBz' };
env.BMAPICreds = { 'api-client-name': 'bm-local', 'api-client-key': 'fF5TVeCAlTqsLjEpNCb9' };
env.proxyBaseUrl = 'http://localhost:8914';

exports.env = env;
