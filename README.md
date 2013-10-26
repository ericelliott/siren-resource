siren-resource
==============

Resourceful routing with siren+json hypermedia for Express.

## Status - Developer Preview

Here be dragons.

## What it does

Creates a bunch of routes for you automatically, based on resources, and maps them to actions. Here's the mapping, right from the source:

```js
// GET /resource -> index
app.get( path,
  handler(path, 'index', options) );

// POST /resource -> create
app.post( path, 
  handler(path, 'create', options) );

// GET /resource/:id -> show
app.get( path + '/:id',
  handler(path, 'show', options) );

// PUT /resource/:id -> update / append
app.put( path + '/:id',
  handler(path, 'put', options) );

// DELETE /resource -> delete
app.delete( path + '/:id',
  handler(path, 'delete', options) );
```

It also automatically sets content type to siren+json, and provides a super easy `.entity()` function to help you encode your responses so that they conform to the spec.


## Usage

```js
'use strict';

var express = require('express'),
  http = require('http'),
  resource = require('siren-resource'),

  collection = resource.adapters.memory,  
  app = express(),
  server,
  port = 3000,

  // Collections are the database abstraction layer
  // that backs your resources. You can initialize
  // them by passing in an array of models.
  albums = collection({
    models: [
      {
        "id": "chmzq50np0002gfixtr1qp64o",
        "name": "Settle",
        "artist": "Disclosure",
        "artistId": "chmzq4l480001gfixe8a3nzhm",
        "coverImage": "/covers/medium/zrms5gxr.jpg",
        "year": "2013",
        "genres": [
          "electronic", "house", "garage", "UK garage",
          "future garage"
        ]
      }
    ],

    // They also take some config....
    config: {
      title: 'Albums',
      description: 'Some great albums you should ' +
        'listen to.',
      class: ['album']      
    }
  });

app.use( express.json() );
app.use( express.urlencoded() );
app.use( express.methodOverride() );
// app.use( log.requestLogger() );

// Once you're ready, hook up your RESTful
// routes by passing your collection into
// the resource() function.
resource('/albums', app, albums);

// Create the server
server = http.createServer(app);


server.listen(port, function () {
  console.log('Listening on port ' + port);
});
```

Here's what the output looks like:

```js
{
  "title": "Albums",
  "entityAttributes": {
    "rel": [
      "item"
    ],
    "class": [
      "album"
    ]
  },
  "entities": [
    {
      "href": "/albums/chmzq50np0002gfixtr1qp64o",
      "properties": {
        "name": "Settle",
        "artist": "Disclosure"
      }
    }
  ],
  "links": [
    {
      "rel": [
        "self"
      ],
      "href": "/albums"
    }
  ]
}
```

## Error messaging

404 and 401 error handling routes get hooked up for you for unsupported methods and urls.

## Paging

Pass paging rules in on the options, and it will automatically create prev / next links that look like.
Those links work automatically, too:

`/resource?offset=20&limit=10`


## Credits

Copyright (c) Eric Elliott 2013

Written for the book, ["Programming JavaScript Applications"](http://ericleads.com/javascript-applications/) (O'Reilly)
