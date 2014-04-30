
var alias = require('alias');
var integration = require('integration');
var is = require('is');
var load = require('load-script');
var push = require('global-queue')('_dcq');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Drip);
};

/**
 * Expose `Drip` integration.
 */

var Drip = exports.Integration = integration('Drip')
  .assumesPageview()
  .readyOnLoad()
  .global('dc')
  .global('_dcq')
  .global('_dcs')
  .option('account', '');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Drip.prototype.initialize = function(page){
  window._dcq = window._dcq || [];
  window._dcs = window._dcs || {};
  window._dcs.account = this.options.account;
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Drip.prototype.loaded = function(){
  return is.object(window.dc);
};

/**
 * Load.
 *
 * @param {Function} callback
 */

Drip.prototype.load = function(callback){
  load('//tag.getdrip.com/' + this.options.account + '.js', callback);
};

/**
 * Track.
 *
 * @param {Track} track
 */

Drip.prototype.track = function(track){
  var props = track.properties();
  var cents = Math.round(track.cents());
  props.action = track.event();
  if (cents) props.value = cents;
  delete props.revenue;
  push('track', props);
};
