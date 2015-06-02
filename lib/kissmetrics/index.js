
/**
 * Module dependencies.
 */

var each = require('each');
var integration = require('analytics.js-integration');
var is = require('is');
var push = require('global-queue')('_kmq');

/**
 * Expose `KISSmetrics` integration.
 */

var KISSmetrics = module.exports = integration('KISSmetrics')
  .assumesPageview()
  .global('KM')
  .global('_kmil')
  .global('_kmq')
  .option('apiKey', '')
  .option('prefixProperties', true)
  .option('trackCategorizedPages', true)
  .option('trackNamedPages', true)
  .tag('library', '<script src="//scripts.kissmetrics.com/{{ apiKey }}.2.js">');

/**
 * Check if browser is mobile, for kissmetrics.
 *
 * http://support.kissmetrics.com/how-tos/browser-detection.html#mobile-vs-non-mobile
 */

exports.isMobile = navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/IEMobile/i)
  || navigator.userAgent.match(/Opera Mini/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPhone|iPod/i);

/**
 * Initialize.
 *
 * http://support.kissmetrics.com/apis/javascript
 *
 * @param {Object} page
 */

KISSmetrics.prototype.initialize = function(page) {
  var self = this;
  window._kmq = [];
  if (exports.isMobile) push('set', { 'Mobile Session': 'Yes' });

  this.load('library', function() {
    self.trackPage(page);
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

KISSmetrics.prototype.loaded = function() {
  return is.object(window.KM);
};

/**
 * Page.
 *
 * @param {Page} page
 */

KISSmetrics.prototype.page = function(page) {
  if (!window.KM_SKIP_PAGE_VIEW) window.KM.pageView();
  this.trackPage(page);
};

/**
 * Track page.
 *
 * @param {Page} page
 */

KISSmetrics.prototype.trackPage = function(page) {
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

KISSmetrics.prototype.identify = function(identify) {
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

KISSmetrics.prototype.track = function(track) {
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

KISSmetrics.prototype.alias = function(alias) {
  push('alias', alias.to(), alias.from());
};

/**
 * Completed order.
 *
 * @param {Track} track
 * @api private
 */

KISSmetrics.prototype.completedOrder = function(track) {
  var products = track.products();
  var event = track.event();

  // transaction
  push('record', event, prefix(event, track.properties()));

  // items
  window._kmq.push(function() {
    var km = window.KM;
    each(products, function(product, i) {
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

function prefix(event, properties) {
  var prefixed = {};
  each(properties, function(key, val) {
    if (key === 'Billing Amount') {
      prefixed[key] = val;
    } else {
      prefixed[event + ' - ' + key] = val;
    }
  });
  return prefixed;
}
