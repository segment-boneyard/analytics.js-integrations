
/**
 * Module dependencies.
 */

var integration = require('segmentio/analytics.js-integration');
var each = require('each');

/**
 * HOP.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `TwitterAds`.
 */

var TwitterAds = module.exports = integration('Twitter Ads')
  .tag('pixel', '<img src="//analytics.twitter.com/i/adsct?txn_id={{ event }}&p_id=Twitter"/>')
  .mapping('events');

/**
 * Initialize.
 *
 * @param {Object} page
 */

TwitterAds.prototype.initialize = function(){
  this.ready();
};

/**
 * Track.
 *
 * @param {Track} track
 */

TwitterAds.prototype.track = function(track){
  var events = this.events(track.event());
  var self = this;
  each(events, function(event){
    var el = self.load('pixel', {
      event: event
    });
  });
};
