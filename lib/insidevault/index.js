
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_iva');
var is = require('is');

/**
 * Expose `InsideVault` integration.
 */

var InsideVault = module.exports = integration('InsideVault')
  .global('_iva')
  .option('clientId', '')
  .option('domain', '')
  .tag('<script src="//analytics.staticiv.com/iva.js">');

/**
 * Initialize.
 *
 * @param page
 */

InsideVault.prototype.initialize = function(page){
  var domain = this.options.domain;

  window._iva = window._iva || [];

  push('setClientId', this.options.clientId);
  if (domain) push('setDomain', domain);

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

InsideVault.prototype.loaded = function(){
  return !! (window._iva && window._iva.push !== Array.prototype.push);
};

/**
 * Track.
 *
 * Tracks everything except 'sale' events.
 *
 * @param {Track} track
 */

InsideVault.prototype.track = function(track){
  var event = track.event();
  var value = track.revenue() || track.value() || 0;
  var orderId = track.orderId() || '';

  // 'sale' is a special event that will be routed to a table that is deprecated on our end.
  // We don't want a generic 'sale' event to go to our deprecated table.
  if (event != 'sale') {
    push('trackEvent', event, value, orderId);
  }
};