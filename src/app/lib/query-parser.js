
/**
 * Module for scraping metadata from the URL and the source.
 * Metadata includes title, date, author, links, etc.
 */

define(function(){

  /**
   * deserializes a query string into an object
   * taken from page 40 in 3rd party javascript book
   *
   * @param {String} query the serialized query string
   *
   */
  function getQueryParameters(query) {
    var args   = query.split('&')
    , params = {}
    , pair
    , key
    , value
    , i;

    function decode(string) {
      return decodeURIComponent(string || "");
      //Dont replace + by ' ' because we want to keep it
      //.replace('+', ' ');
    }

    for (i = 0; i < args.length; i++) {
      pair = args[i].split('=');
      key = decode(pair.shift());
      value = decode(pair ? pair[0] : null);
      params[key] = value;
    }

    return params;
  }

  return {
    getQueryParameters: getQueryParameters
  };

});

