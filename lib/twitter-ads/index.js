
/**
 * Module dependencies.
 */

var each = require('each');
var integration = require('analytics.js-integration');

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
 * @api public
 */

TwitterAds.prototype.initialize = function() {
  this.ready();
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

TwitterAds.prototype.page = function() {
  if (this.options.page) {
    this.load({ pixelId: this.options.page });
  }
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

TwitterAds.prototype.track = function(track) {
  var events = this.events(track.event());
  var self = this;
  each(events, function(pixelId) {
    self.load({ pixelId: pixelId });
  });
};
