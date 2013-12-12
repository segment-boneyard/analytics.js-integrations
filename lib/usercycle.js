
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_uc');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Usercycle);
};


/**
 * Expose `Usercycle` integration.
 */

var Usercycle = exports.Integration = integration('USERcycle')
  .assumesPageview()
  .readyOnInitialize()
  .global('_uc')
  .option('key', '');


/**
 * Initialize.
 *
 * http://docs.usercycle.com/javascript_api
 *
 * @param {Object} page
 */

Usercycle.prototype.initialize = function (page) {
  push('_key', this.options.key);
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Usercycle.prototype.loaded = function () {
  return !! (window._uc && window._uc.push !== Array.prototype.push);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Usercycle.prototype.load = function (callback) {
  load('//api.usercycle.com/javascripts/track.js', callback);
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

Usercycle.prototype.identify = function (identify) {
  var traits = identify.traits();
  var id = identify.userId();
  if (id) push('uid', id);
  // there's a special `came_back` event used for retention and traits
  push('action', 'came_back', traits);
};


/**
 * Track.
 *
 * @param {Track} track
 */

Usercycle.prototype.track = function (track) {
  push('action', track.event(), track.properties());
};
