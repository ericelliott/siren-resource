'use strict';

var 
  statusCodes = require('http').STATUS_CODES,
  mixIn = require('mout/object/mixIn'),
  link = require('./lib/links.js').link,
  entity = require('./lib/entity.js'),
  adapters = require('./adapters'),

  sirenError = 
      function sirenError(status, options) {
    return entity('', {
      class: 'error',
      properties: mixIn({
        status: status,
        message: options.message ||
          statusCodes[status]
      }, options.properties),
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
      var routes = options.routes || options,
        route = routes[action];

      if (typeof route === 'function') {
        res.setHeader('Content-Type',
          'application/vnd.siren+json');
        return route.call(options, req, res, next);
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

  router = function router(path, app, collection) {

    collection.settings.href = path;

    // GET /resource -> index
    app.get( path,
      handler(path, 'index', collection) );

    // POST /resource -> create
    app.post( path, 
      handler(path, 'create', collection) );

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
      handler(path, 'show', collection) );

    // PUT /resource/:id -> update / append
    app.put( path + '/:id',
      handler(path, 'put', collection) );

    // DELETE /resource -> delete
    app.delete( path + '/:id',
      handler(path, 'delete', collection) );

    app.all( path + '/:id', function (req, res) {
      error405(path, res);
    });
  };

  router.entity = entity;
  router.link = link;
  router.adapters = adapters;

module.exports = router;
