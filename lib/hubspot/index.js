
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_hsq');
var convert = require('convert-dates');

/**
 * Expose `HubSpot` integration.
 */

var HubSpot = module.exports = integration('HubSpot')
  .assumesPageview()
  .global('_hsq')
  .option('portalId', null)
  .tag('<script id="hs-analytics" src="https://js.hs-analytics.net/analytics/{{ cache }}/{{ portalId }}.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

HubSpot.prototype.initialize = function(page){
  window._hsq = [];
  var cache = Math.ceil(new Date() / 300000) * 300000;
  this.load({ cache: cache }, this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

HubSpot.prototype.loaded = function(){
  return !! (window._hsq && window._hsq.push !== Array.prototype.push);
};

/**
 * Page.
 *
 * @param {String} category (optional)
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

HubSpot.prototype.page = function(page){
  push('_trackPageview');
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

HubSpot.prototype.identify = function(identify){
  if (!identify.email()) return;
  var traits = identify.traits();
  traits = convertDates(traits);
  push('identify', traits);
};

/**
 * Track.
 *
 * @param {Track} track
 */

HubSpot.prototype.track = function(track){
  var props = track.properties();
  props = convertDates(props);
  push('trackEvent', track.event(), props);
};

/**
 * Convert all the dates in the HubSpot properties to millisecond times
 *
 * @param {Object} properties
 */

function convertDates(properties){
  return convert(properties, function(date){ return date.getTime(); });
}
