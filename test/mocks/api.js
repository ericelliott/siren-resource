'use strict';

var express = require('express'),
  http = require('http'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  resource = require('../siren-resource'),

  collection = resource.adapters.memory,
  app = express(),
  server,

  // Collections are the database abstraction layer
  // that backs your resources. You can initialize
  // them by passing in an array of models.
  albums = collection({
    models: [
      {
        'id': 'chmzq50np0002gfixtr1qp64o',
        'name': 'Settle',
        'artist': 'Disclosure',
        'artistId': 'chmzq4l480001gfixe8a3nzhm',
        'coverImage': '/covers/medium/zrms5gxr.jpg',
        'year': '2013',
        'genres': [
          'electronic', 'house', 'garage', 'UK garage',
          'future garage'
        ]
      }
    ],

    // They also take some config....
    config: {
      title: 'Albums',
      description: 'Some great albums you should ' +
        'listen to.',
      'class': ['album']
    }
  });

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: true}) );
app.use( methodOverride() );
// app.use( log.requestLogger() );

// Once you're ready, hook up your RESTful
// routes by passing your collection into
// the resource() function.
resource('/albums', app, albums);

// Create the server
server = http.createServer(app);

module.exports = server;
