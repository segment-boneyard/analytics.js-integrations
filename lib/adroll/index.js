
/**
 * Module dependencies.
 */

var integration = require('segmentio/analytics.js-integration');
var snake = require('to-snake-case');
var useHttps = require('use-https');
var each = require('each');
var is = require('is');

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `AdRoll` integration.
 */

var AdRoll = module.exports = integration('AdRoll')
  .assumesPageview()
  .global('__adroll_loaded')
  .global('adroll_adv_id')
  .global('adroll_pix_id')
  .global('adroll_custom_data')
  .option('advId', '')
  .option('pixId', '')
  .tag('http', '<script src="http://a.adroll.com/j/roundtrip.js">')
  .tag('https', '<script src="https://s.adroll.com/j/roundtrip.js">')
  .mapping('events');

/**
 * Initialize.
 *
 * http://support.adroll.com/getting-started-in-4-easy-steps/#step-one
 * http://support.adroll.com/enhanced-conversion-tracking/
 *
 * @param {Object} page
 */

AdRoll.prototype.initialize = function(page){
  window.adroll_adv_id = this.options.advId;
  window.adroll_pix_id = this.options.pixId;
  window.__adroll_loaded = true;
  var name = useHttps() ? 'https' : 'http';
  this.load(name, this.ready);
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
  var event = track.event();
  var user = this.analytics.user();
  var events = this.events(event);
  var total = track.revenue() || track.total() || 0;
  var orderId = track.orderId() || 0;

  each(events, function(event){
    var data = {};
    if (user.id()) data.user_id = user.id();
    data.adroll_conversion_value_in_dollars = total;
    data.order_id = orderId;
    // the adroll interface only allows for
    // segment names which are snake cased.
    data.adroll_segments = snake(event);
    window.__adroll.record_user(data);
  });

  // no events found
  if (!events.length) {
    var data = {};
    if (user.id()) data.user_id = user.id();
    data.adroll_segments = snake(event);
    window.__adroll.record_user(data);
  }
};
