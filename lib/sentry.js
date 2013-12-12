
var integration = require('integration');
var is = require('is');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Sentry);
};


/**
 * Expose `Sentry` integration.
 */

var Sentry = exports.Integration = integration('Sentry')
  .readyOnLoad()
  .global('Raven')
  .option('config', '');


/**
 * Initialize.
 *
 * http://raven-js.readthedocs.org/en/latest/config/index.html
 */

Sentry.prototype.initialize = function () {
  var config = this.options.config;
  this.load(function () {
    // for now, raven basically requires `install` to be called
    // https://github.com/getsentry/raven-js/blob/master/src/raven.js#L113
    window.Raven.config(config).install();
  });
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Sentry.prototype.loaded = function () {
  return is.object(window.Raven);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Sentry.prototype.load = function (callback) {
  load('//d3nslu0hdya83q.cloudfront.net/dist/1.0/raven.min.js', callback);
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

Sentry.prototype.identify = function (identify) {
  window.Raven.setUser(identify.traits());
};
