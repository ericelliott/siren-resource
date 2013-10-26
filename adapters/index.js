'use strict';

var join = require('path').join,
  path = join(__dirname, '/');

require('fs').readdirSync(path).forEach(function(file) {
  var name = file.split('.')[0];
  if (name === 'index') {
    return;
  }
  module.exports[name] = require(path + file);
});
