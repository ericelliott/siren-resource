'use strict';
/**
 * Todo: Convert all function sigs to take
 * req param instead of lame custom params.
 */
var stampit = require('stampit'),
  oFilter = require('mout/object/filter'),
  contains = require('mout/array/contains'),
  map = require('mout/object/map'),
  findIndex = require('mout/array/findIndex'),
  mixIn = require('mout/object/mixIn'),
  cuid = require('cuid'),
  entity = require('../lib/entity.js'),
  reserved = ['fields', 'q', 'filter', 'embed'],
  methods = {},

  state = {
    defaults: {
      idProperty: 'id',
      slugProperty: 'slug',
      hrefProperty: 'href',
      title: '',
      rel: ['item']
    }
  },

  filterQuery = function filterQuery(query) {
    return oFilter(query, function (val, key) {
      return !contains(reserved, key);
    });
  },

  find = function find(models, query) {
    var fields = filterQuery(query);
    return map(models, function (model) {
      return oFilter(model, function (obj, key) {
        return obj[key] === fields[key];
      });
    });
  };

methods.filter = function filter(models, req) {
  return find(models, req.query);
};

methods.index = function index(req, res) {
  var items = [],
    offset, limit, max, i, models = this.models,
    query = req.query, entities;

  offset = +query.offset || 0;
  limit = +query.limit || 10;
  i = offset;
  max = Math.min(offset + limit,
      models.length);

  for (i = offset; i < max; i ++) {
    items.push(models[i]);
  }

  entities = methods.filter(items, query);

  res.send(entity(this.settings.href, {
    title: this.settings.title,
    description: this.settings.description,
    length: this.models,
    req: req,
    entityAttributes: {
      rel: this.settings.rel,
      class: this.settings.class
    },
    entities: entities
  }));
};

methods.create = function create(models, req,
    cb) {
  var model = req.body,
    // TODO: Validate req.body against json-schema
    idProperty = this.settings.idProperty,
    slugProperty = this.settings.slugProperty,
    hrefProperty = this.settings.hrefProperty,
    id = cuid(),
    slug = slugProperty ? cuid.slug() : id,
    path = slug || id;

  if (slug) {
    model[slug] = slug;
  }

  model[idProperty] = id;
  model[hrefProperty] = this.settings.href + path;
  models.push(model);
  cb(null, model);
};

methods.getModelById = function
    getModelById(models, req, cb) {
  var queryObject = {},
    idProperty = this.settings.idProperty;
  queryObject[idProperty] = req.params.id;
  cb(null, find(models, queryObject));
};

methods.show = function show(models, req, cb) {
  this.getModelById(models, req,
    function (model) {
      cb(null, model);
    });
};

methods.put = function put(models, req, cb) {
  var model = req.body;
  models.push(model);
  cb(null, model);
};

methods.delete = function del(models, req, cb) {
  var prop = this.settings.idProperty,
    id = req.body[prop],
    index = findIndex(models, function (model) {
      return model[prop] === id;
    });

  delete models[index];

  cb(null);
};

module.exports = 
  stampit().methods(methods).state(state)
  .enclose(function () {
    this.settings = mixIn({}, this.defaults,
      this.config);
    delete this.config;
  });
