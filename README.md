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
var resource = require('siren-resource'),
  index = function index(req, res, next) {
    var href = '/albums',
      idx = map(albums, function (album) {
        return {
          href: href + '/' + album.id,
          properties: {
            name: album.name,
            artist: album.artist
          }
        };
      }),
      sobj = resource.entity(href, {
        title: 'Albums',
        entityAttributes: {
          rel: ['item'],
          class: ['album']
        },
        entities: idx
      });
    res.send(sobj);
  };

resource('/albums', app, {
  routes: {
    index: index
  }
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

Note that it also hooks up lots of other routes, defaulting to 404 and 401 error handling for undefined routes. It also handles paging automatically... just pass paging rules in on the options, and it will automatically create prev / next links that look like:

`/resource?offset=20&limit=10`


## Credits

Copyright (c) Eric Elliott 2013

Written for the book, ["Programming JavaScript Applications"](http://ericleads.com/javascript-applications/) (O'Reilly)
