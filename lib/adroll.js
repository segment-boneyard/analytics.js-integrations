
var integration = require('integration');
var is = require('is');
var load = require('load-script');


/**
 * User reference.
 */

var user;

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(AdRoll);
  user = analytics.user(); // store for later
};


/**
 * Expose `AdRoll` integration.
 */

var AdRoll = exports.Integration = integration('AdRoll')
  .assumesPageview()
  .readyOnLoad()
  .global('__adroll_loaded')
  .global('adroll_adv_id')
  .global('adroll_pix_id')
  .global('adroll_custom_data')
  .option('events', {})
  .option('advId', '')
  .option('pixId', '');


/**
 * Initialize.
 *
 * http://support.adroll.com/getting-started-in-4-easy-steps/#step-one
 * http://support.adroll.com/enhanced-conversion-tracking/
 *
 * @param {Object} page
 */

AdRoll.prototype.initialize = function (page) {
  window.adroll_adv_id = this.options.advId;
  window.adroll_pix_id = this.options.pixId;
  window.__adroll_loaded = true;
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

AdRoll.prototype.loaded = function () {
  return window.__adroll;
};


/**
 * Load the AdRoll library.
 *
 * @param {Function} callback
 */

AdRoll.prototype.load = function (callback) {
  load({
    http: 'http://a.adroll.com/j/roundtrip.js',
    https: 'https://s.adroll.com/j/roundtrip.js'
  }, callback);
};

/**
 * Track.
 * 
 * @param {Track} track
 */

AdRoll.prototype.track = function(track){
  var events = this.options.events;
  var total = track.revenue();
  var event = track.event();
  if (has.call(events, event)) event = events[event];
  var data = {
    adroll_conversion_value_in_dollars: total || 0,
    order_id: track.orderId() || 0,
    adroll_segments: event
  };
  if (user.id()) data.user_id = user.id();
  window.__adroll.record_user(data);
};
