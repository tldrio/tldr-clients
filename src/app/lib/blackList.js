  var tldrCheckBlackList = ["*://(?!plus)*.google.*/*"
            ,"chrome*://*"
            ,"*://cl.ly*"
            ,"*://*.mailchimp.com*" // all subdomains from mailchimp
            ,"*://*yammer.com*"
            ,"*://*trello.com*"
            ,"*://www.amazon.*"
            ,"*://amazon.*"
            ,"*://github.com(?!/blog)*"
            ,"*://*taobao.com*"
            ,"*://*ebay.*"
            ,"*://*linkedin.com*"
            ,"*://*identi.ca*"
            ,"*://*msn.com*"
            ,"*://*bing.com*"
            ,"*://*pinterest.com*"
            ,"*://*facebook.com*"
            ,"*://mixpanel.com*"
            ,"*://www.intercom.io*"
            ,"*://*.craigslist.*"
            ,"*://*chase.com*"
            ,"*://*paypal.com*"
            ,"*://*bankofamerica.com*"
            ,"*://*wellsfargo.com*"
            ,"*://*americanexpress.com*"
            ,"*://*bankofthewest.com*"
            ,"*://*capitalone.com*"
            ,"*://*citibank.com*"
            ,"*://*cibc.ca*"
            ,"*://*mbna.com*"
            ,"*://*usbank.com*"
            ,"*://*visa.*"
            ,"*://*westernunion.*"
            ,"*://*bing.com*"
            ,"*://*gmail.com*"
            ,"*://*citi.com*"
            ,"*://*hsbc.com*"
            ,"*://*barclays.com*"
            ,"*://*ally.com*"
            ,"*://*etrade.com*"
            ,"*://*ameritrade.com*"
            ,"*://*vanguard.com*"
            ,"*://*ml.com*"
            ,"*://*schwab.com*"
            ,"*://*scottrade.com*"
            ,"*://*fidelity.com*"
            ,"*://*sharebuilder.com*"
            ,"*://*ingdirect.com*"
            ,"*://*troweprice.com*"
            ,"*://*ameriprise.com*"
            ,"*://*edwardjones.com*"
            ,"*://*russell.com*"
            ,"*://*hotmail.com*"
            ,"*://*outlook.com*"
            ,"*://*mail.yahoo.com*"
            ,"*://*webmail.aol.com*"
            ,"*://*mail.com*"
            ,"*://*fastmail.com*"
            ,"*://*shortmail.com*"
            ,"*://*live.com*"
            ,"*://*mywebsearch.com*"
            ,"*://*baidu.com*"
            ,"*://*discovercard.com*"
            ,"*://*pnc.com*"
            ,"*://www.turnjs.com*"
            ,"*://(i.)?imgur.com*"
            ,"*://i.*"
            ,"*://*googleusercontent.com*"]
    , pornList = [ "*://*xhamster.com*"
               ,"*://*youporn.com*"
               ,"*://*pornhub.com*"
               ,"*://*redtube.com*"
               ,"*://*tube8.com*"
               ,"*://*xnxx.com*"
               ,"*://*wide6.com*"
               ,"*://*livejasmin.com*"
               ,"*://*xvideos.com*"
               ,"*://*adultfriendfinder.com*"
               ,"*://*youjizz.com*"
               ,"*://*freeones.com*"
               ,"*://*streamate.com*"
               ,"*://*adam4adam.com*"
               ,"*://*gayromeo.com*"
               ,"*://*literotica.com*"
               ,"*://*imlive.com*"
               ,"*://*manhunt.net*"
               ,"*://*playboy.com*"
               ,"*://*flirt4free.com*"
               ,"*://*debonairblog.com*"
               ,"*://*aebn.net*"
               ,"*://*hqpornlinks.com*"
               ,"*://*fetlife.com*"
               ,"*://*clips4sale.com*"
               ,"*://*femjoy.com*"
               ,"*://*mrskin.com*"
               ,"*://*xtube.com*"
               ,"*://*hardsextube.com*"
               ,"*://*spankwire.com*"
               ,"*://*myfreecams.com*"]
    , previewBlackList = ["*://(?!plus)*.google.*/*"
            ,"chrome*://*"
            ,"*://www.bing.com*"
            ,"*://duckduckgo.com*" ]
    , contributionBlackList = [ 'news.ycombinator.com'
                              , 'www.reddit.com']
    , onboardingReadBlackList = [ 'news.ycombinator.com'
                                , 'tldr.io' ]
    , returnObject;

function isBlacklistedDomainForContributionCTA(hostname) {
  return contributionBlackList.indexOf(hostname) !== -1;
}
function isBlacklistedDomainForReadOnboarding(hostname) {
  return onboardingReadBlackList.indexOf(hostname) !== -1;
}

returnObject = { pornList: pornList
               , tldrCheckBlackList: tldrCheckBlackList
               , isBlacklistedDomainForContributionCTA: isBlacklistedDomainForContributionCTA
               , isBlacklistedDomainForReadOnboarding: isBlacklistedDomainForReadOnboarding
               , previewBlackList: previewBlackList
               };

if (typeof exports !== 'undefined') {
  // CommonJs support
  exports.blackList = returnObject;
} else if (typeof define === 'function' && define.amd) {
  // AMD support
  define(function() {
    return returnObject;
  });
}
