
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var each = require('each');

/**
 * HOP.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `TwitterAds`.
 */

var TwitterAds = module.exports = integration('Twitter Ads')
  .option('page', '')
  .tag('<img src="//analytics.twitter.com/i/adsct?txn_id={{ pixelId }}&p_id=Twitter"/>')
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
 * Page.
 *
 * @param {Page} page
 */

TwitterAds.prototype.page = function(page){
  if (this.options.page) {
    this.load({ pixelId: this.options.page });
  }
};

/**
 * Track.
 *
 * @param {Track} track
 */

TwitterAds.prototype.track = function(track){
  var events = this.events(track.event());
  var self = this;
  each(events, function(pixelId){
    self.load({ pixelId: pixelId });
  });
};
