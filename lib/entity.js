'use strict';

var 
  values = require('mout/object/values'),
  compact = require('mout/array/compact'),
  mixIn = require('mout/object/mixIn'),

  pageLinks = require('./links');

/**
 * Take href and options, and return a valid
 * Siren object, complete with automatic
 * navigation links (self, prev, next).
 * 
 * @param  {[type]} href    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports = function entity (href, options) {
  var query = options.req &&
      options.req.query || {},
    links = options.links || [],
    length = +options.length || 0,
    limit = +query.limit || 
      +options.limit || 10,
    offset = +query.offset ||
      +options.offset || 0,
    navLinks = pageLinks(href, length, 
      mixIn({}, options, {
        offset: offset,
        limit: limit
      })),
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
    properties: options.properties || {
      description: options.description,
      entityCount: length + 1
    },
    entities: entities ?
      Array.isArray(entities) ?
        entities : values(entities) :
      undefined,
    entityAttributes: options.entityAttributes,
    actions: options.actions,
    links: links.length ? links : undefined
  };
};
