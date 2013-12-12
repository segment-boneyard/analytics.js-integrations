
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_veroq');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Vero);
};


/**
 * Expose `Vero` integration.
 */

var Vero = exports.Integration = integration('Vero')
  .assumesPageview()
  .readyOnInitialize()
  .global('_veroq')
  .option('apiKey', '');


/**
 * Initialize.
 *
 * https://github.com/getvero/vero-api/blob/master/sections/js.md
 *
 * @param {Object} page
 */

Vero.prototype.initialize = function (pgae) {
  push('init', { api_key: this.options.apiKey });
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Vero.prototype.loaded = function () {
  return !! (window._veroq && window._veroq.push !== Array.prototype.push);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Vero.prototype.load = function (callback) {
  load('//d3qxef4rp70elm.cloudfront.net/m.js', callback);
};


/**
 * Identify.
 *
 * https://github.com/getvero/vero-api/blob/master/sections/js.md#user-identification
 *
 * @param {Identify} identify
 */

Vero.prototype.identify = function (identify) {
  var traits = identify.traits();
  var email = identify.email();
  var id = identify.userId();
  if (!id || !email) return; // both required
  push('user', traits);
};


/**
 * Track.
 *
 * https://github.com/getvero/vero-api/blob/master/sections/js.md#tracking-events
 *
 * @param {Track} track
 */

Vero.prototype.track = function (track) {
  push('track', track.event(), track.properties());
};
