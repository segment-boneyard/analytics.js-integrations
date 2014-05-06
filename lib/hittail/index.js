
var integration = require('integration');
var is = require('is');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(HitTail);
};

/**
 * Expose `HitTail` integration.
 */

var HitTail = exports.Integration = integration('HitTail')
  .assumesPageview()
  .readyOnLoad()
  .global('htk')
  .option('siteId', '');

/**
 * Initialize.
 *
 * @param {Object} page
 */

HitTail.prototype.initialize = function(page){
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

HitTail.prototype.loaded = function(){
  return is.fn(window.htk);
};

/**
 * Load the HitTail library.
 *
 * @param {Function} callback
 */

HitTail.prototype.load = function(callback){
  var id = this.options.siteId;
  load('//' + id + '.hittail.com/mlt.js', callback);
};