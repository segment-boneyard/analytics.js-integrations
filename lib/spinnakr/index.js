
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Spinnakr);
};

/**
 * Expose `Spinnakr` integration.
 */

var Spinnakr = exports.Integration = integration('Spinnakr')
  .assumesPageview()
  .readyOnLoad()
  .global('_spinnakr_site_id')
  .global('_spinnakr')
  .option('siteId', '');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Spinnakr.prototype.initialize = function(page){
  window._spinnakr_site_id = this.options.siteId;
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Spinnakr.prototype.loaded = function(){
  return !! window._spinnakr;
};

/**
 * Load.
 *
 * @param {Function} callback
 */

Spinnakr.prototype.load = function(callback){
  load('//d3ojzyhbolvoi5.cloudfront.net/js/so.js', callback);
};