
var integration = require('integration');
var load = require('load-script');
var alias = require('alias');

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(ChurnBee);
};

/**
 * Expose `ChurnBee`
 */

var ChurnBee = exports.Integration = integration('ChurnBee')
  .readyOnLoad()
  .global('_cbq')
  .global('ChurnBee')
  .option('_setApiKey', '');

/**
 * Initialize
 *
 * https://churnbee.com/docs
 *
 * @param {Object} page
 */

ChurnBee.prototype.initialize = function(page){
  window._cbq = window._cbq || [];
  var key = this.options._setApiKey;
  window._cbq.push(['_setApiKey', key]);
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

ChurnBee.prototype.loaded = function(){
  return !! window.ChurnBee;
};

/**
 * Load.
 *
 * @param {Function} fn
 */

ChurnBee.prototype.load = function(fn){
  load('//api.churnbee.com/cb.js', fn);
};

/**
 * Track `event` with `properties`
 *
 * @param {String} event
 * @param {Object} properties
 */

ChurnBee.prototype.track = function(event, properties){
  window._cbq.push([event, properties || {}]);
};

