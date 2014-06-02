
var load = require('load-pixel')('//www.facebook.com/tr/');
var integration = require('integration');

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Facebook);
};

/**
 * Expose `load`.
 */

exports.load = load;

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `Facebook`
 */

var Facebook = exports.Integration = integration('Facebook Ads')
  .readyOnInitialize()
  .option('currency', 'USD')
  .option('events', {});

/**
 * Track.
 *
 * @param {Track} track
 */

Facebook.prototype.track = function(track){
  var events = this.options.events;
  var traits = track.traits();
  var event = track.event();
  if (!has.call(events, event)) return;
  return exports.load({
    'cd[currency]': this.options.currency,
    'cd[value]': track.revenue() || 0,
    ev: events[event]
  });
};
