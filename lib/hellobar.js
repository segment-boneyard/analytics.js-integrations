
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Hellobar);
};


/**
 * Expose `hellobar.com` integration.
 */

var Hellobar = exports.Integration = integration('hellobar.com')
  .assumesPageview()
  .readyOnInitialize()
  .global('_hbq')
  .option('apiKey', '');


/**
 * Initialize.
 *
 * https://s3.amazonaws.com/scripts.hellobar.com/bb900665a3090a79ee1db98c3af21ea174bbc09f.js
 *
 * @param {Object} page
 */

Hellobar.prototype.initialize = function(page) {
  window._hbq = window._hbq || [this.options];
  this.load();
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Hellobar.prototype.load = function (callback) {
  var url = '//s3.amazonaws.com/scripts.hellobar.com/' + this.options.apiKey + '.js';
  load(url, callback);
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Hellobar.prototype.loaded = function () {
  return !! (window._hbq && window._hbq.push !== Array.prototype.push);
};


