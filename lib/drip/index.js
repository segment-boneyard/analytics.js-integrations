
/**
 * Module dependencies.
 */

var alias = require('alias');
var integration = require('analytics.js-integration');
var is = require('is');
var load = require('load-script');
var push = require('global-queue')('_dcq');

/**
 * Expose `Drip` integration.
 */

var Drip = module.exports = integration('Drip')
  .assumesPageview()
  .global('_dc')
  .global('_dcqi')
  .global('_dcq')
  .global('_dcs')
  .option('account', '')
  .tag('<script src="//tag.getdrip.com/{{ account }}.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Drip.prototype.initialize = function(page){
  window._dcq = window._dcq || [];
  window._dcs = window._dcs || {};
  window._dcs.account = this.options.account;
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Drip.prototype.loaded = function(){
  return is.object(window._dc);
};

/**
 * Track.
 *
 * @param {Track} track
 */

Drip.prototype.track = function(track){
  var props = track.properties();
  var cents = track.cents();
  if (cents) props.value = cents;
  delete props.revenue;
  push('track', track.event(), props);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Drip.prototype.identify = function(identify){
  push('identify', identify.traits());
};
