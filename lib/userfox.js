
var alias = require('alias');
var callback = require('callback');
var convertDates = require('convert-dates');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_ufq');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Userfox);
};


/**
 * Expose `Userfox` integration.
 */

var Userfox = exports.Integration = integration('userfox')
  .assumesPageview()
  .readyOnInitialize()
  .global('_ufq')
  .option('clientId', '');


/**
 * Initialize.
 *
 * https://www.userfox.com/docs/
 *
 * @param {Object} page
 */

Userfox.prototype.initialize = function (page) {
  window._ufq = [];
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Userfox.prototype.loaded = function () {
  return !! (window._ufq && window._ufq.push !== Array.prototype.push);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Userfox.prototype.load = function (callback) {
  load('//d2y71mjhnajxcg.cloudfront.net/js/userfox-stable.js', callback);
};


/**
 * Identify.
 *
 * https://www.userfox.com/docs/#custom-data
 *
 * @param {Identify} identify
 */

Userfox.prototype.identify = function (identify) {
  var traits = identify.traits({ created: 'signup_date' });
  var email = identify.email();

  if (!email) return;

  // initialize the library with the email now that we have it
  push('init', {
    clientId: this.options.clientId,
    email: email
  });

  traits = convertDates(traits, formatDate);
  push('track', traits);
};


/**
 * Convert a `date` to a format userfox supports.
 *
 * @param {Date} date
 * @return {String}
 */

function formatDate (date) {
  return Math.round(date.getTime() / 1000).toString();
}
