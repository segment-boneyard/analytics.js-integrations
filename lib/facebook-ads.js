
var load = require('load-script');
var integration = require('integration');
var push = require('global-queue')('_fbq');

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Facebook);
};

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `Facebook`
 */

var Facebook = exports.Integration = integration('Facebook Ads')
  .readyOnInitialize()
  .global('_fbq')
  .option('currency', 'USD')
  .option('events', {});

/**
 * Initialize Facebook Ads.
 *
 * https://developers.facebook.com/docs/ads-for-websites/conversion-pixel-code-migration
 *
 * @param {Object} page
 */

Facebook.prototype.initialize = function(page){
  window._fbq = window._fbq || [];
  this.load();
  window._fbd.loaded = true;
};

/**
 * Load the Facebook Ads library.
 *
 * @param {Function} fn
 */

Facebook.prototype.load = function(fn){
  load('//connect.facebook.net/en_US/fbds.js', fn);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Facebook.prototype.loaded = function(){
  return !!window._fbq;
};

/**
 * Track.
 *
 * @param {Track} track
 */

Facebook.prototype.track = function(track){
  var events = this.options.events;
  var traits = track.traits();
  var event = track.event();
  var revenue = track.revenue() || 0;
  if (!has.call(events, event)) return;
  push('track', events[event], {
    value: revenue,
    currency: this.options.currency
  });
};
