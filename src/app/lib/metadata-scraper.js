/**
 * Module for scraping metadata from the URL and the source.
 * Metadata includes title, date, author, links, etc.
 */

define(['jquery', 'clearly'], function($, clearly) {


  /**
   * Scrapes the date from a pathname of the following form:
   * /foo/YYYY/MM/DD/bar/
   *
   */
  function getDateFromPath (path) {
    var r = /\d{4}\/\d{2}\/\d{2}/;
    return (r.exec(path) && r.exec(path)[0]);
  }

  /**
   * Scrapes the author from a span of class .author .vcard
   *
   */
  function getAuthorFromSource () {
    var next
      , authorTag = document.getElementsByClassName('author');
    if (authorTag.length > 0) {
      next = authorTag[0].firstChild;

      while (next.firstChild !== null) {
        authorTag = next;
        next = authorTag.firstChild;
      }

      return authorTag.innerHTML;
    }
  }

  /**
   * Get image from page source
   * We try to get the Open Graph image, and if there isn't one we try with the former method (link rel="image_src")
   *
   */
  function getImageUrlFromSource() {
    var imageUrl
      , i, w, h;

    imageUrl = $('meta[property="og:image"]').attr('content');
    if (imageUrl) { return imageUrl; }

    imageUrl = $('link[rel="image_src"]').attr('href');
    if (imageUrl) { return imageUrl; }

    // Return "big enough" images (to avoid unrelevant images e.g. for navigation)
    // The aspect ratio must be between 3:1 and 1:3
    for ( i = 0; i < document.images.length; i ++ ) {
      w = document.images[i].width;
      h = document.images[i].height;

      if (w >= 130 && (w < 3 * h || h < 3 * w)) {
        return document.images[i].src;
      }

    }

    return undefined;
  }


  /**
   * Detect whether the website uses querystring
   * For now, only Wordpress
   */
  function detectIfQuerystringOffender() {
    var $generators = $('meta[name="generator"]')
      , $stylesheets = $('link[rel="stylesheet"]')
      , i
      //, foundGeneratorTag = true   // In fact not a good criteria
      , foundStylesheetPath = false
      ;

    //for (i = 0; i < $generators.length; i += 1) {
      //if ($($generators[i]).attr('content').match(/^WordPress.*$/)) {
        //foundGeneratorTag = true;
      //}
    //}

    for (i = 0; i < $stylesheets.length; i += 1) {
      if ($($stylesheets[i]).attr('href').match(/^.*\/wp-content\/.*$/)) {
        foundStylesheetPath = true;
      }
    }

    return foundStylesheetPath;
    //return foundGeneratorTag && foundStylesheetPath;
  }


  function getAvailableMetaData (path) {
    clearly.getContent();
    // remove potential custom tags in title like in NYT articles
    clearly.articleTitle = clearly.articleTitle.replace(/(<([^>]+)>)/ig,"");

    var title = clearly.articleTitle
    , date = getDateFromPath(path)
    , author = getAuthorFromSource()
    , scrapedMetadata = {}
    , imageUrl = getImageUrlFromSource()
    , isQuerystringOffender = detectIfQuerystringOffender()
    ;

    if (title) { scrapedMetadata.title = title; }
    if (author) { scrapedMetadata.resourceAuthor = author; }
    if (date) { scrapedMetadata.resourceDate = date; }
    if (imageUrl) { scrapedMetadata.imageUrl = imageUrl; }
    if (isQuerystringOffender) { scrapedMetadata.isQuerystringOffender = isQuerystringOffender; }

    return scrapedMetadata;
  }

  return { getAvailableMetaData: getAvailableMetaData };

});

