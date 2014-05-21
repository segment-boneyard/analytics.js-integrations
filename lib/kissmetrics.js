
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

module.exports = exports = function (analytics) {
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
  .option('trackCategorizedPages', true)
  .option('prefixProperties', true);

/**
 * Check if browser is mobile, for kissmetrics.
 *
 * http://support.kissmetrics.com/how-tos/browser-detection.html#mobile-vs-non-mobile
 */

exports.isMobile = navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/iPhone|iPod/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/Opera Mini/i)
  || navigator.userAgent.match(/IEMobile/i);

/**
 * Initialize.
 *
 * http://support.kissmetrics.com/apis/javascript
 *
 * @param {Object} page
 */

KISSmetrics.prototype.initialize = function (page) {
  window._kmq = [];
  if (exports.isMobile) push('set', { 'Mobile Session': 'Yes' });
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

KISSmetrics.prototype.loaded = function () {
  return is.object(window.KM);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

KISSmetrics.prototype.load = function (callback) {
  var key = this.options.apiKey;
  var useless = '//i.kissmetrics.com/i.js';
  var library = '//doug1izaerwt3.cloudfront.net/' + key + '.1.js';

  new Batch()
    .push(function (done) { load(useless, done); }) // :)
    .push(function (done) { load(library, done); })
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

KISSmetrics.prototype.page = function (page) {
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

KISSmetrics.prototype.identify = function (identify) {
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

KISSmetrics.prototype.track = function (track) {
  var mapping = { revenue: 'Billing Amount' };
  var event = track.event();
  var properties = track.properties(mapping);
  if (this.options.prefixProperties) properties = prefix(event, properties);
  push('record', event, properties);
};


/**
 * Alias.
 *
 * @param {Alias} to
 */

KISSmetrics.prototype.alias = function (alias) {
  push('alias', alias.to(), alias.from());
};

/**
 * Completed order.
 *
 * @param {Track} track
 * @api private
 */

KISSmetrics.prototype.completedOrder = function(track){
  var products = track.products();
  var event = track.event();

  // transaction
  push('record', event, prefix(event, track.properties()));

  // items
  window._kmq.push(function(){
    var km = window.KM;
    each(products, function(product, i){
      var temp = new Track({ event: event, properties: product });
      var item = prefix(event, product);
      item._t = km.ts() + i;
      item._d = 1;
      km.set(item);
    });
  });
};

/**
 * Prefix properties with the event name.
 *
 * @param {String} event
 * @param {Object} properties
 * @return {Object} prefixed
 * @api private
 */

function prefix(event, properties){
  var prefixed = {};
  each(properties, function(key, val){
    if (key === 'Billing Amount') {
      prefixed[key] = val;
    } else {
      prefixed[event + ' - ' + key] = val;
    }
  });
  return prefixed;
}