
var callback = require('callback');
var clone = require('clone');
var extend = require('extend');
var integration = require('integration');
var load = require('load-script');
var onError = require('on-error');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Rollbar);
};


/**
 * Expose `Rollbar` integration.
 */

var Rollbar = exports.Integration = integration('Rollbar')
  .readyOnInitialize()
  .assumesPageview()
  .global('_rollbar')
  .option('accessToken', '')
  .option('identify', true);


/**
 * Initialize.
 *
 * https://rollbar.com/docs/notifier/rollbar.js/
 *
 * @param {Object} page
 */

Rollbar.prototype.initialize = function (page) {
  var options = this.options;
  window._rollbar = window._rollbar || window._ratchet || [options.accessToken, options];
  onError(function() { window._rollbar.push.apply(window._rollbar, arguments); });
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Rollbar.prototype.loaded = function () {
  return !! (window._rollbar && window._rollbar.push !== Array.prototype.push);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Rollbar.prototype.load = function (callback) {
  load('//d37gvrvc0wt4s1.cloudfront.net/js/1/rollbar.min.js', callback);
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

Rollbar.prototype.identify = function (identify) {
  if (!this.options.identify) return;

  var traits = identify.traits();
  var rollbar = window._rollbar;
  var params = rollbar.shift
    ? rollbar[1] = rollbar[1] || {}
    : rollbar.extraParams = rollbar.extraParams || {};

  params.person = params.person || {};
  extend(params.person, traits);
};
