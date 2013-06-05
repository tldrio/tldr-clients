define(['lib/environment'], function(env){

  var utils = {};

  // Get the tldr page link from a tldr model
  utils.getTldrPageLink = function (tldrData) {
      // This is not a really beautiful method but it is the only place
      // where we want to force the protocol (here, http) in the url

      var pageUrl
        , slug = tldrData.slug || utils.slugify(tldrData.title)
        ;

      if ("https:" === document.location.protocol) {
        pageUrl = "http://" + env.pageBaseUrl.slice(8) + '/tldrs/' + tldrData._id + '/' + slug;
      } else {
        pageUrl = env.pageBaseUrl + '/tldrs/' + tldrData._id + '/' + slug;
      }

      return pageUrl;
    };


  /**
   * Get a tweet text corresponding to this tldr model
   * @param {TldrObject} data needed to build the tweet text
   * @return {String} The tweet
   */
  utils.getTweetText = function (tldrData) {
    var  stringsLengths = { shortenedUrl: 20
                           , hash: 6
                           , via: 12
                           , titleMax: 70   // Dont display more than the 70 first characters of the title
                           }
        , clippedTitle = tldrData.title.length <= stringsLengths.titleMax ?
                         tldrData.title :
                         tldrData.title.substring(0, stringsLengths.titleMax-3) + '...'
        , tweetText = clippedTitle + ' ' + tldrData.originalUrl + ', TLDR';

      if (tldrData.creator && tldrData.creator.twitterHandle && tldrData.creator.twitterHandle.length > 0) {
        tweetText = tweetText + " by @" + tldrData.creator.twitterHandle;
      }

      tweetText += ": ";

      return tweetText;
  };


  /**
   * Return a slug of the given string
   */
  utils.slugify = function (input) {
    var res = input || ''
      , resParts
      , toReplace = [ { pattern: 'éèêëẽ', replacement: 'e' }
                    , { pattern: 'áàâäã', replacement: 'a' }
                    , { pattern: 'úùûüũ', replacement: 'u' }
                    , { pattern: 'íìîïĩ', replacement: 'i' }
                    , { pattern: 'óòôöõ', replacement: 'o' }
                    , { pattern: 'ýỳŷÿỹ', replacement: 'y' }
                    ]
      , i
      ;

    res = res.toLowerCase();

    // Replace all non-English characters by their English counterparts
    for (i = 0; i < toReplace.length; i += 1) {
      res = res.replace(new RegExp('[' + toReplace[i].pattern + ']', "g"), toReplace[i].replacement);
    }

    // Use only dashes as delimiters
    res = res.replace(/[ _\.,;]/g, '-');


    // Remove all characters that are not alphanumeric or a dash
    res = res.replace(/[^a-z0-9\-]/g, '');

    // Collapse multiple successive dashes into one
    res = res.replace(/-+/g, '-');

    return res;
  };

  // Inject the css file in the DOM
  utils.loadCssFile = function (url) {

    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);

  };

  // Generate a random string that looks like a guid
  // Used to distinguish between iframe, very low risk of collision
  utils.guid = function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };


  return utils;

});
