
var alias = require('alias');
var Batch = require('batch');
var callback = require('callback');
var integration = require('integration');
var is = require('is');
var load = require('load-script');
var push = require('global-queue')('_kmq');
var Track = require('facade').Track;
var each = require('each');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(KISSmetrics);
};

/**
 * Expose `KISSmetrics` integration.
 */

var KISSmetrics = exports.Integration = integration('KISSmetrics')
  .assumesPageview()
  .readyOnInitialize()
  .global('_kmq')
  .global('KM')
  .global('_kmil')
  .option('apiKey', '')
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true);

/**
 * Initialize.
 *
 * http://support.kissmetrics.com/apis/javascript
 *
 * @param {Object} page
 */

KISSmetrics.prototype.initialize = function(page){
  window._kmq = [];
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

KISSmetrics.prototype.loaded = function(){
  return is.object(window.KM);
};

/**
 * Load.
 *
 * @param {Function} callback
 */

KISSmetrics.prototype.load = function(callback){
  var key = this.options.apiKey;
  var useless = '//i.kissmetrics.com/i.js';
  var library = '//doug1izaerwt3.cloudfront.net/' + key + '.1.js';

  new Batch()
    .push(function(done){ load(useless, done); }) // :)
    .push(function(done){ load(library, done); })
    .end(callback);
};

/**
 * Page.
 *
 * @param {String} category (optional)
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

KISSmetrics.prototype.page = function(page){
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  // named pages
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }

  // categorized pages
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

KISSmetrics.prototype.identify = function(identify){
  var traits = identify.traits();
  var id = identify.userId();
  if (id) push('identify', id);
  if (traits) push('set', traits);
};

/**
 * Track.
 *
 * @param {Track} track
 */

KISSmetrics.prototype.track = function(track){
  var props = track.properties({ revenue: 'Billing Amount' });
  push('record', track.event(), props);
};

/**
 * Alias.
 *
 * @param {Alias} to
 */

KISSmetrics.prototype.alias = function(alias){
  push('alias', alias.to(), alias.from());
};

/**
 * Viewed product.
 *
 * @param {Track} track
 * @api private
 */

KISSmetrics.prototype.viewedProduct = function(track){
  push('record', 'Product Viewed', toProduct(track));
};

/**
 * Product added.
 *
 * @param {Track} track
 * @api private
 */

KISSmetrics.prototype.addedProduct = function(track){
  push('record', 'Product Added', toProduct(track));
};

/**
 * Completed order.
 *
 * @param {Track} track
 * @api private
 */

KISSmetrics.prototype.completedOrder = function(track){
  var orderId = track.orderId();
  var products = track.products();

  // transaction
  push('record', 'Purchased', {
    'Order ID': track.orderId(),
    'Order Total': track.total()
  });

  // items
  window._kmq.push(function(){
    var km = window.KM;
    each(products, function(product, i){
      var track = new Track({ properties: product });
      var item = toProduct(track);
      item['Order ID'] = orderId;
      item._t = km.ts() + i;
      item._d = 1;
      km.set(item);
    });
  });
};

/**
 * Get a product from the given `track`.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

function toProduct(track){
  return {
    Quantity: track.quantity(),
    Price: track.price(),
    Name: track.name(),
    SKU: track.sku()
  };
}
