
var date = require('load-date');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_prum');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Pingdom);
};

/**
 * Expose `Pingdom` integration.
 */

var Pingdom = exports.Integration = integration('Pingdom')
  .assumesPageview()
  .readyOnLoad()
  .global('_prum')
  .option('id', '');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Pingdom.prototype.initialize = function(page){
  window._prum = window._prum || [];
  push('id', this.options.id);
  push('mark', 'firstbyte', date.getTime());
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Pingdom.prototype.loaded = function(){
  return !! (window._prum && window._prum.push !== Array.prototype.push);
};

/**
 * Load.
 *
 * @param {Function} callback
 */

Pingdom.prototype.load = function(callback){
  load('//rum-static.pingdom.net/prum.min.js', callback);
};