siren-resource
==============

Resourceful routing with siren+json hypermedia for Express.

## Status - Developer Preview

Here be dragons.

Here's how you use it:

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

`/resource/offset/20/limit/10`


## Credits

Copyright (c) Eric Elliott 2013

Written for the book, ["Programming JavaScript Applications"](http://ericleads.com/javascript-applications/) (O'Reilly)
