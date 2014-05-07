
/**
 * Module dependencies.
 */

var each = require('each');
var plugin = require('./integrations.js');

/**
 * Expose the integrations, using their own `name` from their `prototype`.
 */

each(plugin, function(plugin){
  var name = plugin.Integration.prototype.name;
  exports[name] = plugin;
});
