
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_gauges');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Gauges);
};

/**
 * Expose `Gauges` integration.
 */

var Gauges = exports.Integration = integration('Gauges')
  .assumesPageview()
  .readyOnInitialize()
  .global('_gauges')
  .option('siteId', '');

/**
 * Initialize Gauges.
 *
 * http://get.gaug.es/documentation/tracking/
 *
 * @param {Object} page
 */

Gauges.prototype.initialize = function(page){
  window._gauges = window._gauges || [];
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Gauges.prototype.loaded = function(){
  return !! (window._gauges && window._gauges.push !== Array.prototype.push);
};

/**
 * Load the Gauges library.
 *
 * @param {Function} callback
 */

Gauges.prototype.load = function(callback){
  var id = this.options.siteId;
  var script = load('//secure.gaug.es/track.js', callback);
  script.id = 'gauges-tracker';
  script.setAttribute('data-site-id', id);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Gauges.prototype.page = function(page){
  push('track');
};
