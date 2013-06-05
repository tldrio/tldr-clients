/**
 * Environement / Config Module
 */


var env = {}
  , protocol = 'https:';

env.name = 'staging';
env.host = 'staging.tldr.io';
env.apiUrl = 'https://api.tldr.io/staging';
env.websiteUrl = 'http://staging.tldr.io';
env.pageBaseUrl = protocol + 'staging.tldr.io';
env.baseUrl = protocol + 'staging.tldr.io/iframe';
env.BMBaseUrl = protocol + 'staging.tldr.io/bookmarklet';
env.extensionBaseUrl = protocol + 'staging.tldr.io/firefox/public';
env.embedBaseUrl = protocol + 'staging.tldr.io/embed';
env.mixpanelToken = "64223fb861fd99302a8d85c70c260ed3";
env.firefoxExtensionAPICreds = { 'api-client-name': 'firefox-ext-staging', 'api-client-key': 'VkLGTWnKPMWQhDkvtDBz' };
env.proxyBaseUrl = 'http://proxy.tldr.io';

exports.env = env;
