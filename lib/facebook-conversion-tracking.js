
var load = require('load-pixel')('//www.facebook.com/offsite_event.php');
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

var Facebook = exports.Integration = integration('Facebook Conversion Tracking')
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
    currency: this.options.currency,
    value: track.revenue() || 0,
    id: events[event]
  });
};
