
var integration = require('integration');
var load = require('load-script');
var is = require('is');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Kenshoo);
};

/**
 * Expose `Kenshoo` integration.
 */

var Kenshoo = exports.Integration = integration('Kenshoo')
  .readyOnLoad()
  .global('k_trackevent')
  .option('cid', '')
  .option('subdomain', '')
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true);

/**
 * Initialize.
 *
 * See https://gist.github.com/justinboyle/7875832
 *
 * @param {Object} page
 */

Kenshoo.prototype.initialize = function(page){
  this.load();
};

/**
 * Loaded? (checks if the tracking function is set)
 *
 * @return {Boolean}
 */

Kenshoo.prototype.loaded = function(){
  return is.fn(window.k_trackevent);
};

/**
 * Load Kenshoo script.
 *
 * @param {Function} callback
 */

Kenshoo.prototype.load = function(callback){
  var url = '//' + this.options.subdomain + '.xg4ken.com/media/getpx.php?cid=' + this.options.cid;
  load(url, callback);
};

/**
 * Completed order.
 *
 * https://github.com/jorgegorka/the_tracker/blob/master/lib/the_tracker/trackers/kenshoo.rb
 *
 * @param {Track} track
 * @api private
 */

Kenshoo.prototype.completedOrder = function(track){
  this._track(track, { val: track.total() });
};

/**
 * Page.
 *
 * @param {Page} page
 */

Kenshoo.prototype.page = function(page){
  var category = page.category();
  var name = page.name();
  var fullName = page.fullName();
  var isNamed = (name && this.options.trackNamedPages);
  var isCategorized = (category && this.options.trackCategorizedPages);
  var track;

  if (name && ! this.options.trackNamedPages) {
    return;
  }

  if (category && ! this.options.trackCategorizedPages) {
    return;
  }

  if (isNamed && isCategorized) {
    track = page.track(fullName);
  } else if (isNamed) {
    track = page.track(name);
  } else if (isCategorized) {
    track = page.track(category);
  } else {
    track = page.track();
  }

  this._track(track);
};

/**
 * Track.
 *
 * https://github.com/jorgegorka/the_tracker/blob/master/lib/the_tracker/trackers/kenshoo.rb
 *
 * @param {Track} event
 */

Kenshoo.prototype.track = function(track){
  this._track(track);
};

/**
 * Track a Kenshoo event.
 *
 * Private method for sending an event. We use it because `completedOrder`
 * can't call track directly (would result in an infinite loop).
 *
 * @param {track} event
 * @param {options} object
 */

Kenshoo.prototype._track = function(track, options){
  options = options || { val: track.revenue() };

  var params = [
    'id=' + this.options.cid,
    'type=' + track.event(),
    'val=' + (options.val || '0.0'),
    'orderId=' + (track.orderId() || ''),
    'promoCode=' + (track.coupon() || ''),
    'valueCurrency=' + (track.currency() || ''),

    // Live tracking fields. Ignored for now (until we get documentation).
    'GCID=',
    'kw=',
    'product='
  ];

  window.k_trackevent(params, this.options.subdomain);
};
