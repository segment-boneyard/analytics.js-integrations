
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var load = require('load-script');
var is = require('is');

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

module.exports = exports = function(analytics){
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

AdRoll.prototype.initialize = function(page){
  // roundtrip.js reads these to record conversion
  // when HTML renders, which would mean a duplicate call
  delete window.adroll_conversion_value;
  delete window.adroll_conversion_value_in_dollars;
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

AdRoll.prototype.loaded = function(){
  return window.__adroll;
};

/**
 * Load the AdRoll library.
 *
 * @param {Function} fn
 */

AdRoll.prototype.load = function(fn){
  load({
    http: 'http://a.adroll.com/j/roundtrip.js',
    https: 'https://s.adroll.com/j/roundtrip.js'
  }, fn);
};

/**
 * Page.
 *
 * http://support.adroll.com/segmenting-clicks/
 *
 * @param {Page} page
 */

AdRoll.prototype.page = function(page){
  var name = page.fullName();
  this.track(page.track(name));
};

/**
 * Track.
 *
 * @param {Track} track
 */

AdRoll.prototype.track = function(track){
  var events = this.options.events;
  var event = track.event();
  var data = {};
  if (user.id()) data.user_id = user.id();

  if (has.call(events, event)) {
    event = events[event];
    var total = track.revenue() || track.total() || 0;
    var orderId = track.orderId() || 0;
    data.adroll_conversion_value_in_dollars = total;
    data.order_id = orderId;
  }

  data.adroll_segments = event;

  window.__adroll.record_user(data);
};
