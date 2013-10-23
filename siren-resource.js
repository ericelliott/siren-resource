'use strict';

var format = require('util').format,
  statusCodes = require('http').STATUS_CODES,
  values = require('mout/object/values'),
  compact = require('mout/array/compact'),

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

    var template = '/offset/%s/limit/%s';

    return link(rel, uri +
        format(template, offset, limit));
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
    var offset = options.offset,
    limit = options.limit,
    prevOffset, nextOffset;

    if (limit && offset) {
      prevOffset =
        ((offset - limit) >= 0) ?
          offset - limit : 0;
      nextOffset = 
        ((offset + limit) <= length) ?
          offset + limit : false;

      return [
        pageLink(uri, 'prev', prevOffset, limit),
        pageLink(uri, 'next', nextOffset, limit)
      ];
    }
  },

  /**
   * Take href and options, and return a valid
   * Siren object, complete with automatic
   * navigation links (self, prev, next).
   * 
   * @param  {[type]} href    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  entity = function entity (href, options) {
    var links = options.links || [],
      length = options.entities ?
        options.entities.length : 0,
      navLinks = pageLinks(href, length, options),
      entities = options.entities,
      sclass = options.class,
      selfLink = href ? { 
          rel: ['self'],
          href: href
        } : [];

    links =
      compact( links.concat(navLinks, selfLink) );

    return {
      title: options.title,
      class: !sclass ? undefined :
        Array.isArray(sclass) ?
          sclass : [sclass],
      properties: options.properties,
      entityAttributes: options.entityAttributes,
      entities: entities ?
        Array.isArray(entities) ?
          entities : values(entities) :
        undefined,
      actions: options.actions,
      links: links.length ? links : undefined
    };
  },

  sirenError = 
      function sirenError(status, options) {
    return entity('', {
      class: 'error',
      properties: {
        status: status,
        message: options.message ||
          statusCodes[status]
      },
      links: options.links
    });
  },

  send = function send(res, obj, status) {
    if (status) {
      res.statusCode = status;
    }

    res.setHeader('Content-Type',
      'application/vnd.siren+json');

    res.send(obj);
  },

  handler = function
      handler(path, action, options) {
    return function (req, res, next) {
      var routes = options.routes || {},
        route = routes[action];

      if (typeof route === 'function') {
        res.setHeader('Content-Type',
          'application/vnd.siren+json');

        return route(req, res, next);
      }

      send(res, sirenError(404, {
        links: [
          link('index', path)
        ]
      }, 404));
    };
  },

  error405 = function error405(path, res) {
    var badMethod = 405;
    send(res, sirenError(405, {
      links: [
        link('index', path)
      ]
    }, badMethod));
  },

  router = function router(path, app, options) {

    // GET /resource -> index
    app.get( path,
      handler(path, 'index', options) );

    // POST /resource -> create
    app.post( path, 
      handler(path, 'create', options) );

    app.options(path, function (req, res) {
      var sobj = entity(path, {
        properties: {
          options: ['GET', 'POST', 'OPTIONS']
        }
      });

      send(res, sobj);
    });

    app.all( path, function (req, res) {
      error405(path, res);
    });

    // GET /resource/:id -> show
    app.get( path + '/:id',
      handler(path, 'show', options) );

    // PUT /resource/:id -> update / append
    app.put( path + '/:id',
      handler(path, 'put', options) );

    // DELETE /resource -> delete
    app.delete( path + '/:id',
      handler(path, 'delete', options) );

    app.all( path + '/:id', function (req, res) {
      error405(path, res);
    });
  };

  router.entity = entity;
  router.link = link;

module.exports = router;
