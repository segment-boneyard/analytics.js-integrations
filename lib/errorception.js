
var callback = require('callback');
var extend = require('extend');
var integration = require('integration');
var load = require('load-script');
var onError = require('on-error');
var push = require('global-queue')('_errs');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Errorception);
};


/**
 * Expose `Errorception` integration.
 */

var Errorception = exports.Integration = integration('Errorception')
  .assumesPageview()
  .readyOnInitialize()
  .global('_errs')
  .option('projectId', '')
  .option('meta', true);


/**
 * Initialize.
 *
 * https://github.com/amplitude/Errorception-Javascript
 *
 * @param {Object} page
 */

Errorception.prototype.initialize = function (page) {
  window._errs = window._errs || [this.options.projectId];
  onError(push);
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Errorception.prototype.loaded = function () {
  return !! (window._errs && window._errs.push !== Array.prototype.push);
};


/**
 * Load the Errorception library.
 *
 * @param {Function} callback
 */

Errorception.prototype.load = function (callback) {
  load('//beacon.errorception.com/' + this.options.projectId + '.js', callback);
};


/**
 * Identify.
 *
 * http://blog.errorception.com/2012/11/capture-custom-data-with-your-errors.html
 *
 * @param {Object} identify
 */

Errorception.prototype.identify = function (identify) {
  if (!this.options.meta) return;
  var traits = identify.traits();
  window._errs = window._errs || [];
  window._errs.meta = window._errs.meta || {};
  extend(window._errs.meta, traits);
};
