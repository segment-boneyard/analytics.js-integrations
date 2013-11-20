
var callback = require('callback');
var convert = require('convert-dates');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_hsq');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(HubSpot);
};


/**
 * Expose `HubSpot` integration.
 */

var HubSpot = exports.Integration = integration('HubSpot')
  .assumesPageview()
  .readyOnInitialize()
  .global('_hsq')
  .option('portalId', null);


/**
 * Initialize.
 *
 * @param {Object} page
 */

HubSpot.prototype.initialize = function (page) {
  window._hsq = [];
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

HubSpot.prototype.loaded = function () {
  return !! (window._hsq && window._hsq.push !== Array.prototype.push);
};


/**
 * Load the HubSpot library.
 *
 * @param {Function} fn
 */

HubSpot.prototype.load = function (fn) {
  if (document.getElementById('hs-analytics')) return callback.async(fn);

  var id = this.options.portalId;
  var cache = Math.ceil(new Date() / 300000) * 300000;
  var url = 'https://js.hs-analytics.net/analytics/' + cache + '/' + id + '.js';
  var script = load(url, fn);
  script.id = 'hs-analytics';
};


/**
 * Page.
 *
 * @param {String} category (optional)
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

HubSpot.prototype.page = function (category, name, properties, options) {
  push('_trackPageview');
};


/**
 * Identify.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

HubSpot.prototype.identify = function (id, traits, options) {
  traits = traits || {};

  if (!traits.email) return;
  if (id) traits.id = id;
  traits = convertDates(traits);
  push('identify', traits);
};


/**
 * Track.
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

HubSpot.prototype.track = function (event, properties, options) {
  properties = properties || {};
  properties = convertDates(properties);
  push('trackEvent', event, properties);
};


/**
 * Convert all the dates in the HubSpot properties to millisecond times
 *
 * @param {Object} properties
 */

function convertDates (properties) {
  return convert(properties, function (date) { return date.getTime(); });
}
