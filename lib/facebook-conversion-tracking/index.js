
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_fbq');
var reduce = require('reduce');
var each = require('each');

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `Facebook`
 */

var Facebook = module.exports = integration('Facebook Conversion Tracking')
  .global('_fbq')
  .option('currency', 'USD')
  .tag('<script src="//connect.facebook.net/en_US/fbds.js">')
  .mapping('events');

/**
 * Initialize Facebook Conversion Tracking
 *
 * https://developers.facebook.com/docs/ads-for-websites/conversion-pixel-code-migration
 *
 * @param {Object} page
 */

Facebook.prototype.initialize = function(page){
  window._fbq = window._fbq || [];
  this.load(this.ready);
  window._fbq.loaded = true;
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Facebook.prototype.loaded = function(){
  return !! (window._fbq && window._fbq.loaded);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Facebook.prototype.page = function(page){
  var name = page.fullName();
  this.track(page.track(name));
};

/**
 * Track.
 *
 * https://developers.facebook.com/docs/reference/ads-api/custom-audience-website-faq/#fbpixel
 *
 * @param {Track} track
 */

Facebook.prototype.track = function(track){
  var event = track.event();
  var events = this.events(event);
  var revenue = track.revenue() || 0;
  var self = this;

  each(events, function(event){
    push('track', event, {
      value: String(revenue.toFixed(2)),
      currency: self.options.currency
    });
  });
};

/**
 * Viewed product.
 *
 * @param {Track} track category
 * @api private
 */

Facebook.prototype.viewedProductCategory = function(track){
  push('track', 'ViewContent', {
    content_ids: [String(track.category() || '')],
    content_type: 'product_group'
  });
};

/**
 * Viewed product.
 *
 * @param {Track} track
 * @api private
 */

Facebook.prototype.viewedProduct = function(track){
  push('track', 'ViewContent', {
    content_ids: [String(track.id() || track.sku() || '')],
    content_type: 'product'
  });
};

/**
 * Added product.
 *
 * @param {Track} track
 * @api private
 */

Facebook.prototype.addedProduct = function(track){
  push('track', 'AddToCart', {
    content_ids: [String(track.id() || track.sku() || '')],
    content_type: 'product'
  });
};

/**
 * Completed Order.
 *
 * @param {Track} track
 * @api private
 */

Facebook.prototype.completedOrder = function(track){
  var content_ids = reduce(track.products() || [], function(ret, product){
    ret.push(product.id || product.sku || '');
    return ret;
  }, []);
  push('track', 'Purchase', {
    content_ids: content_ids,
    content_type: 'product'
  });
};
