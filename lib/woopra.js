
/**
 * Module dependencies.
 */

var integration = require('integration');
var snake = require('to-snake-case');
var load = require('load-script');
var isEmail = require('is-email');
var extend = require('extend');
var each = require('each');
var type = require('type');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Woopra);
};


/**
 * Expose `Woopra` integration.
 */

var Woopra = exports.Integration = integration('Woopra')
  .readyOnLoad()
  .global('woopra')
  .option('domain', '')
  .option('cookieName', 'wooTracker')
  .option('cookieDomain', null)
  .option('cookiePath', '/')
  .option('ping', true)
  .option('pingInterval', 12000)
  .option('idleTimeout', 300000)
  .option('downloadTracking', true)
  .option('outgoingTracking', true)
  .option('outgoingIgnoreSubdomain', true)
  .option('downloadPause', 200)
  .option('outgoingPause', 400)
  .option('ignoreQueryUrl', true)
  .option('hideCampaign', false);


/**
 * Initialize.
 *
 * http://www.woopra.com/docs/setup/javascript-tracking/
 *
 * @param {Object} page
 */

Woopra.prototype.initialize = function (page) {
  (function () {var i, s, z, w = window, d = document, a = arguments, q = 'script', f = ['config', 'track', 'identify', 'visit', 'push', 'call'], c = function () {var i, self = this; self._e = []; for (i = 0; i < f.length; i++) {(function (f) {self[f] = function () {self._e.push([f].concat(Array.prototype.slice.call(arguments, 0))); return self; }; })(f[i]); } }; w._w = w._w || {}; for (i = 0; i < a.length; i++) { w._w[a[i]] = w[a[i]] = w[a[i]] || new c(); } })('woopra');
  this.load();
  each(this.options, function(key, value){
    key = snake(key);
    if (null == value) return;
    if ('' === value) return;
    window.woopra.config(key, value);
  });
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Woopra.prototype.loaded = function () {
  return !! (window.woopra && window.woopra.loaded);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Woopra.prototype.load = function (callback) {
  load('//static.woopra.com/js/w.js', callback);
};


/**
 * Page.
 *
 * @param {String} category (optional)
 */

Woopra.prototype.page = function (page) {
  var props = page.properties();
  var name = page.fullName();
  if (name) props.title = name;
  window.woopra.track('pv', props);
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

Woopra.prototype.identify = function (identify) {
  window.woopra.identify(identify.traits()).push(); // `push` sends it off async
};


/**
 * Track.
 *
 * @param {Track} track
 */

Woopra.prototype.track = function (track) {
  window.woopra.track(track.event(), track.properties());
};
