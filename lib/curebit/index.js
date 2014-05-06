
var clone = require('clone');
var each = require('each');
var Identify = require('facade').Identify;
var integration = require('integration');
var iso = require('to-iso-string');
var load = require('load-script');
var push = require('global-queue')('_curebitq');
var Track = require('facade').Track;

/**
 * User reference
 */

var user;

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Curebit);
  user = analytics.user();
};

/**
 * Expose `Curebit` integration
 */

var Curebit = exports.Integration = integration('Curebit')
  .readyOnInitialize()
  .global('_curebitq')
  .global('curebit')
  .option('siteId', '')
  .option('iframeWidth', '100%')
  .option('iframeHeight', '480')
  .option('iframeBorder', 0)
  .option('iframeId', '')
  .option('responsive', true)
  .option('device', '')
  .option('insertIntoId', 'curebit-frame')
  .option('campaigns', {})
  .option('server', 'https://www.curebit.com');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Curebit.prototype.initialize = function(page){
  push('init', {
    site_id: this.options.siteId,
    server: this.options.server
  });
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Curebit.prototype.loaded = function(){
  return !! window.curebit;
};

/**
 * Load Curebit's Javascript library.
 *
 * @param {Function} fn
 */

Curebit.prototype.load = function(fn){
  load('//d2jjzw81hqbuqv.cloudfront.net/integration/curebit-1.0.min.js', fn);
};

/**
 * Page.
 *
 * Call the `register_affiliate` method of the Curebit API that will load a
 * custom iframe onto the page, only if this page's path is marked as a
 * campaign.
 *
 * http://www.curebit.com/docs/affiliate/registration
 *
 * @param {String} url
 * @param {String} id
 * @param {Function} fn
 * @api private
 */

Curebit.prototype.injectIntoId = function(url, id, fn){
  var server = this.options.server;
  when(function(){
    return document.getElementById(id);
  }, function(){
    var script = document.createElement('script');
    script.src = url;
    var parent = document.getElementById(id);
    parent.appendChild(script);
    onload(script, fn);
  });
};

/**
 * Campaign tags.
 *
 * @param {Page} page
 */

Curebit.prototype.page = function(page){
  var campaigns = this.options.campaigns;
  var path = window.location.pathname;
  if (!campaigns[path]) return;

  var tags = (campaigns[path] || '').split(',');
  if (!tags.length) return;

  var settings = {
    responsive: this.options.responsive,
    device: this.options.device,
    campaign_tags: tags,
    iframe: {
      width: this.options.iframeWidth,
      height: this.options.iframeHeight,
      id: this.options.iframeId,
      frameborder: this.options.iframeBorder,
      container: this.options.insertIntoId
    }
  };

  var identify = new Identify({
    userId: user.id(),
    traits: user.traits()
  });

  // if we have an email, add any information about the user
  if (identify.email()) {
    settings.affiliate_member = {
      email: identify.email(),
      first_name: identify.firstName(),
      last_name: identify.lastName(),
      customer_id: identify.userId()
    };
  }

  push('register_affiliate', settings);
};

/**
 * Completed order.
 *
 * Fire the Curebit `register_purchase` with the order details and items.
 *
 * https://www.curebit.com/docs/ecommerce/custom
 *
 * @param {Track} track
 */

Curebit.prototype.completedOrder = function(track){
  var orderId = track.orderId();
  var products = track.products();
  var props = track.properties();
  var items = [];
  var identify = new Identify({
    traits: user.traits(),
    userId: user.id()
  });

  each(products, function(product){
    var track = new Track({ properties: product });
    items.push({
      product_id: track.id() || track.sku(),
      quantity: track.quantity(),
      image_url: product.image,
      price: track.price(),
      title: track.name(),
      url: product.url,
    });
  });

  push('register_purchase', {
    order_date: iso(props.date || new Date()),
    order_number: orderId,
    coupon_code: track.coupon(),
    subtotal: track.total(),
    customer_id: identify.userId(),
    first_name: identify.firstName(),
    last_name: identify.lastName(),
    email: identify.email(),
    items: items
  });
};
