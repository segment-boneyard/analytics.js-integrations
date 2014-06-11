var integration = require('integration');
var is = require('is');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Appcues);
};


/**
 * Expose `Appcues` integration.
 */

var Appcues = exports.Integration = integration('Appcues')
  .assumesPageview()
  .readyOnLoad()
  .global('Appcues')
  .global('AppcuesIdentity')
  .option('appcuesId', '')
  .option('userId', '')
  .option('userEmail', '');


/**
 * Initialize.
 *
 * http://appcues.com/docs/
 *
 * @param {Object}
 */

Appcues.prototype.initialize = function () {
  this.load(function() {
    window.Appcues.init();
  });
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Appcues.prototype.loaded = function () {
  return is.object(window.Appcues);
};


/**
 * Load the Appcues library.
 *
 * @param {Function} callback
 */

Appcues.prototype.load = function (callback) {
  var script = load('//d2dubfq97s02eu.cloudfront.net/appcues-bundle.min.js', callback);
  script.setAttribute('data-appcues-id', this.options.appcuesId);
  script.setAttribute('data-user-id', this.options.userId);
  script.setAttribute('data-user-email', this.options.userEmail);
};


/**
 * Identify.
 *
 * http://appcues.com/docs#identify
 *
 * @param {Identify} identify
 */

Appcues.prototype.identify = function (identify) {
  window.Appcues.identify(identify.traits());
};
