'use strict';

var format = require('util').format,
  url = require('url'),

  link = function link(rel, href) {
    var lnk = {};

    if (!href) {
      return undefined;
    }

    if (rel) {
      lnk.rel = Array.isArray(rel) ?
        rel : [rel];
    }

    lnk.href = href;

    return lnk;
  },

  pageLink = function
      pageLink(uri, rel, offset, limit) {
    var parsedUrl = url.parse(uri, true),
      prefix = parsedUrl.search ? '&' : '?',
      template = '%soffset=%s&limit=%s';

    return link(rel, uri +
        format(template, prefix, offset, limit));
  },

  /**
   * Take uri, collection length, paging options
   * and return previous and next links.
   *
   * @param  {string} uri
   *         Resource base URI
   * 
   * @param  {number} length
   *         The length of the collection
   *
   * @param  {object} options
   *
   * @return {array}
   *         Siren links collection
   */
  pageLinks = function (uri, length, options) {
    var offset = +options.offset || 0,
      limit = +options.limit || 10,
      links = [],

      // Min offset: 0,
      // Max offset: length - limit
      prevOffset = Math.min(
        Math.max(offset - limit, 0),
        Math.max(length - limit, 0)),
      nextOffset = Math.min(
        Math.max(offset + limit, 1),
        Math.max(length - limit, 1)),
      lastOffset = nextOffset < (length - limit) ?
        Math.max(0, length - limit) : 0;

    if (offset > 0) {

      links.push(
        pageLink(uri, 'first', 0, limit));

      if (prevOffset > 0) {
        links.push( 
          pageLink(uri, 'prev', prevOffset, limit));
      }
    }

    if (nextOffset > offset) {
      if (nextOffset < length - limit) {
        links.push(
          pageLink(uri, 'next', nextOffset, limit));
      }

      if (lastOffset) {
        links.push(
          pageLink(uri, 'last', lastOffset, limit));
      }
    }

    if (links.length) {
      return links;
    }
  };

pageLinks.link = link;

module.exports = pageLinks;
