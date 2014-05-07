#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs');
var write = fs.writeFileSync;
var readdir = fs.readdirSync;

/**
 * Get all "slugs"
 */

var slugs = readdir(__dirname + '/../lib');

/**
 * Build requires
 */

var requires = slugs.map(function(slug, i){
  var eol = slugs.length - 1 == i ? '\n' : ',\n';
  return '  require(\'./lib/' + slug + '\')' + eol;
});

/**
 * Write `integrations.js`
 */

var js = '\nmodule.exports = [\n' + requires.join('') + '];\n';
write(__dirname + '/../integrations.js', js);
