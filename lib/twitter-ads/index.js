
var pixel = require('load-pixel')('//analytics.twitter.com/i/adsct');
var integration = require('integration');

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(TwitterAds);
};

/**
 * Expose `load`
 */

exports.load = pixel;

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `TwitterAds`
 */

var TwitterAds = exports.Integration = integration('Twitter Ads')
  .readyOnInitialize()
  .option('events', {});

/**
 * Track.
 *
 * @param {Track} track
 */

TwitterAds.prototype.track = function(track){
  var events = this.options.events;
  var event = track.event();
  if (!has.call(events, event)) return;
  return exports.load({
    txn_id: events[event],
    p_id: 'Twitter'
  });
};
