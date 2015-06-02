
/**
 * Module dependencies.
 */

var Track = require('facade').Track;
var each = require('each');
var integration = require('analytics.js-integration');
var push = require('global-queue')('_fxm');

/**
 * Expose `FoxMetrics` integration.
 */

var FoxMetrics = module.exports = integration('FoxMetrics')
  .assumesPageview()
  .global('_fxm')
  .option('appId', '')
  .tag('<script src="//d35tca7vmefkrc.cloudfront.net/scripts/{{ appId }}.js">');

/**
 * Initialize.
 *
 * http://foxmetrics.com/documentation/apijavascript
 *
 * @api public
 */

FoxMetrics.prototype.initialize = function() {
  window._fxm = window._fxm || [];
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

FoxMetrics.prototype.loaded = function() {
  return !!(window._fxm && window._fxm.appId);
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

FoxMetrics.prototype.page = function(page) {
  var properties = page.proxy('properties');
  var category = page.category();
  var name = page.name();
  // store for later
  // TODO: Why? Document me
  this._category = category;

  push(
    '_fxm.pages.view',
    properties.title,
    name,
    category,
    properties.url,
    properties.referrer
  );
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

FoxMetrics.prototype.identify = function(identify) {
  var id = identify.userId();

  if (!id) return;

  push(
    '_fxm.visitor.profile',
    id,
    identify.firstName(),
    identify.lastName(),
    identify.email(),
    identify.address(),
    // social
    // TODO: Why is this `undefined`? Document
    undefined,
    // partners
    // TODO: Why is this `undefined`? Document
    undefined,
    identify.traits()
  );
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

FoxMetrics.prototype.track = function(track) {
  var props = track.properties();
  var category = this._category || props.category;
  push(track.event(), category, props);
};

/**
 * Viewed product.
 *
 * @api private
 * @param {Track} track
 */

FoxMetrics.prototype.viewedProduct = function(track) {
  ecommerce('productview', track);
};

/**
 * Removed product.
 *
 * @api private
 * @param {Track} track
 */

FoxMetrics.prototype.removedProduct = function(track) {
  ecommerce('removecartitem', track);
};

/**
 * Added product.
 *
 * @api private
 * @param {Track} track
 */

FoxMetrics.prototype.addedProduct = function(track) {
  ecommerce('cartitem', track);
};

/**
 * Completed Order.
 *
 * @api private
 * @param {Track} track
 */

FoxMetrics.prototype.completedOrder = function(track) {
  var orderId = track.orderId();

  // transaction
  push(
    '_fxm.ecommerce.order',
    orderId,
    track.subtotal(),
    track.shipping(),
    track.tax(),
    track.city(),
    track.state(),
    track.zip(),
    track.quantity()
  );

  // items
  each(track.products(), function(product) {
    var track = new Track({ properties: product });
    ecommerce('purchaseitem', track, [
      track.quantity(),
      track.price(),
      orderId
    ]);
  });
};

/**
 * Track ecommerce `event` with `track`
 * with optional `arr` to append.
 *
 * @api private
 * @param {string} event
 * @param {Track} track
 * @param {Array} arr
 */

function ecommerce(event, track, arr) {
  push.apply(null, [
    '_fxm.ecommerce.' + event,
    track.id() || track.sku(),
    track.name(),
    track.category()
  ].concat(arr || []));
}
