
/**
 * Module dependencies.
 */

var integration = require('integration');
var Track = require('facade').Track;
var load = require('load-script');
var each = require('each');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Bronto);
};

/**
 * Expose `Bronto` integration.
 */

var Bronto = exports.Integration = integration('Bronto')
  .readyOnLoad()
  .global('__bta')
  .option('siteId', '')
  .option('host', '');

/**
 * Initialize.
 *
 * http://bronto.com/product-blog/features/using-conversion-tracking-private-domain#.Ut_Vk2T8KqB
 * http://bronto.com/product-blog/features/javascript-conversion-tracking-setup-and-reporting#.Ut_VhmT8KqB
 *
 * @param {Object} page
 */

Bronto.prototype.initialize = function(page){
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Bronto.prototype.loaded = function(){
  return this.bta;
};

/**
 * Load the Bronto library.
 *
 * @param {Function} fn
 */

Bronto.prototype.load = function(fn){
  var self = this;
  load('//p.bm23.com/bta.js', function(err){
    if (err) return fn(err);
    var opts = self.options;
    self.bta = new window.__bta(opts.siteId);
    if (opts.host) self.bta.setHost(opts.host);
    fn();
  });
};

/**
 * Track.
 *
 * @param {Track} event
 */

Bronto.prototype.track = function(track){
  var revenue = track.revenue();
  var event = track.event();
  var type = 'number' == typeof revenue ? '$' : 't';
  this.bta.addConversionLegacy(type, event, revenue);
};

/**
 * Completed order.
 *
 * @param {Track} track
 * @api private
 */

Bronto.prototype.completedOrder = function(track){
  var products = track.products();
  var props = track.properties();
  var items = [];

  // items
  each(products, function(product){
    var track = new Track({ properties: product });
    items.push({
      item_id: track.id() || track.sku(),
      desc: product.description || track.name(),
      quantity: track.quantity(),
      amount: track.price(),
    });
  });

  // add conversion
  this.bta.addConversion({
    order_id: track.orderId(),
    date: props.date || new Date,
    items: items
  });
};
