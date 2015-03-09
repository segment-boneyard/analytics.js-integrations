
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_gauges');

/**
 * Expose `Gauges` integration.
 */

var Gauges = module.exports = integration('Gauges')
  .assumesPageview()
  .global('_gauges')
  .option('siteId', '')
  .tag('<script id="gauges-tracker" src="//secure.gaug.es/track.js" data-site-id="{{ siteId }}">');

/**
 * Initialize Gauges.
 *
 * http://get.gaug.es/documentation/tracking/
 *
 * @param {Object} page
 */

Gauges.prototype.initialize = function(page){
  window._gauges = window._gauges || [];
  this.load(this.ready);
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
 * Page.
 *
 * @param {Page} page
 */

Gauges.prototype.page = function(page){
  push('track');
};
