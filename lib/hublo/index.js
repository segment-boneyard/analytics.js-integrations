
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose `hublo.com` integration.
 */

var Hublo = module.exports = integration('Hublo')
  .assumesPageview()
  .global('_hublo_')
  .option('apiKey', null)
  .tag('<script src="//cdn.hublo.co/{{ apiKey }}.js">');

/**
 * Initialize.
 *
 * https://cdn.hublo.co/5353a2e62b26c1277b000004.js
 *
 * @param {Object} page
 */

Hublo.prototype.initialize = function(page){
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Hublo.prototype.loaded = function(){
  return !! (window._hublo_ && typeof window._hublo_.setup === 'function');
};
