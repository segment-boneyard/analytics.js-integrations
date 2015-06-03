
var integration = require('analytics.js-integration');
var Track = require('facade').Track;
var each = require('each');

/**
 * Expose `MentAd` integration.
 */
var MentAd = module.exports = integration('MentAd')
  //.assumesPageview()
  .global('mentad_website_id')
  .global('mentad_purchase_items')
  .global('mentad_shopper_info')
  .global('mentad_purchase_currency')
  .global('mentad_purchase_total')
  .global('mentad_purchase_order_id')
  .global('mentad_purchase_type')
  .option('mentad_website_id', "###")
  .option('mentad_purchase_currency', "###")
  .option('mentad_purchase_total', '###')
  .option('mentad_purchase_order_id', '###')
  .option('mentad_purchase_type', '###')
  .tag('visit', '<script src="https://pixels.mentad.com/mentad-visit-notification.js">')
  .tag('purchase', '<script src="http://pixels.mentad.com/mentad-purchase-notification.js">')

/**
 * Initialize MentAd.
 *
 * @param {Facade} page
 */
MentAd.prototype.initialize = function(page){
  window.mentad_website_id = this.options.mentad_website_id;
  window.mentad_purchase_currency = this.options.mentad_purchase_currency;
  window.mentad_purchase_total = this.options.mentad_purchase_total;
  window.mentad_purchase_order_id = this.options.mentad_purchase_order_id;
  window.mentad_purchase_type = this.options.mentad_purchase_type;
  window.mentad_purchase_items = window.mentad_purchase_items || [];
  window.mentad_shopper_info = window.mentad_shopper_info || {};
  this.ready();
};

/**
 * Has the MentAd library been loaded yet?
 *
 * @return {Boolean}
 */
MentAd.prototype.loaded = function(){
  return !! window.mentad_website_id;
};

MentAd.prototype.page = function(){
  this.load('visit', this.ready);
};

/**
 * Identify
 */
MentAd.prototype.identify = function(identify){
  window.mentad_shopper_info = {
    first_name: identify.firstName(),
    last_name: identify.lastName(),
    address: identify.address(),
    email: identify.email(),
    phone: identify.phone(),
  };
};

/**
 * Completed Order tracking
 *
 * @param {Facade} track
 */

MentAd.prototype.completedOrder = function(track){
  var identify = track.identify();
  var products = track.products();
  var props = track.properties();

  window.mentad_shopper_info = {
    first_name: identify.firstName(),
    last_name: identify.lastName(),
    address: identify.address(),
    email: identify.email(),
    phone: identify.phone(),
  };
  window.mentad_purchase_total = track.total() || track.revenue() || 0;
  window.mentad_purchase_currency = track.currency();
  window.mentad_purchase_order_id = track.orderId();

  // add products
  each(products, function(product){
    var track = new Track({ properties: product });
    window.mentad_purchase_items.push({
      category: track.category(),
      quantity: track.quantity(),
      price: track.price(),
      name: track.name(),
      sku: track.sku(),
      currency: track.currency()
    });
  });
  this.load('purchase', this.ready);
};
