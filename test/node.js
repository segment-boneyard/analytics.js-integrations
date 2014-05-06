
var assert = require('assert');
var format = require('util').format;
var readdir = require('fs').readdirSync;
var resolve = require('path').resolve;

/**
 * Read all three different places for the integrations to be added.
 */

var folder = resolve(__dirname, '../lib');
var folders = readdir(folder);
var component = require('../component.json');
var integrations = require('../integrations.json');

/**
 * Make sure each folder is added to component.json and integrations.json.
 */

folders.forEach(function(folder){
  describe(folder, function(){
    it('should be in component.json', function(){
      var file = format('lib/%s/index.js', folder);
      var msg = format('Expected "%s" to be in component.json');
      assert(~component.scripts.indexOf(file), msg);
    });

    it('should be in integrations.json', function(){
      var msg = format('Expected "%s" to be in integrations.json', folder);
      assert(~integrations.indexOf(folder), msg);
    });
  });
});
