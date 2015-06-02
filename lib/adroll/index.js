
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var snake = require('to-snake-case');
var useHttps = require('use-https');
var each = require('each');
var is = require('is');
var del = require('obj-case').del;

/**
 * Expose `AdRoll` integration.
 */

var AdRoll = module.exports = integration('AdRoll')
  .assumesPageview()
  .global('__adroll')
  .global('__adroll_loaded')
  .global('adroll_adv_id')
  .global('adroll_custom_data')
  .global('adroll_pix_id')
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
 * @api public
 */

AdRoll.prototype.initialize = function() {
  window.adroll_adv_id = this.options.advId;
  window.adroll_pix_id = this.options.pixId;
  window.__adroll_loaded = true;
  var name = useHttps() ? 'https' : 'http';
  this.load(name, this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

AdRoll.prototype.loaded = function() {
  return !!window.__adroll;
};

/**
 * Page.
 *
 * http://support.adroll.com/segmenting-clicks/
 *
 * @api public
 * @param {Page} page
 */

AdRoll.prototype.page = function(page) {
  var name = page.fullName();
  this.track(page.track(name));
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

AdRoll.prototype.track = function(track) {
  var event = track.event();
  var user = this.analytics.user();
  var events = this.events(event);
  var total = track.revenue() || track.total() || 0;
  var orderId = track.orderId() || 0;
  var productId = track.id();
  var sku = track.sku();
  var customProps = track.properties();

  var data = {};
  if (user.id()) data.user_id = user.id();
  if (orderId) data.order_id = orderId;
  if (productId) data.product_id = productId;
  if (sku) data.sku = sku;
  if (total) data.adroll_conversion_value_in_dollars = total;
  del(customProps, 'revenue');
  del(customProps, 'total');
  del(customProps, 'orderId');
  del(customProps, 'id');
  del(customProps, 'sku');
  if (!is.empty(customProps)) data.adroll_custom_data = customProps;

  each(events, function(event) {
    // the adroll interface only allows for
    // segment names which are snake cased.
    data.adroll_segments = snake(event);
    window.__adroll.record_user(data);
  });

  // no events found
  if (!events.length) {
    data.adroll_segments = snake(event);
    window.__adroll.record_user(data);
  }
};
