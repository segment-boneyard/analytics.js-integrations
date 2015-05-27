
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose `hellobar.com` integration.
 */

var Hellobar = module.exports = integration('Hello Bar')
  .assumesPageview()
  .global('_hbq')
  .option('apiKey', '')
  .tag('<script src="//s3.amazonaws.com/scripts.hellobar.com/{{ apiKey }}.js">');

/**
 * Initialize.
 *
 * https://s3.amazonaws.com/scripts.hellobar.com/bb900665a3090a79ee1db98c3af21ea174bbc09f.js
 *
 * @api public
 */

Hellobar.prototype.initialize = function(){
  window._hbq = window._hbq || [];
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Hellobar.prototype.loaded = function(){
  return !!(window._hbq && window._hbq.push !== Array.prototype.push);
};
