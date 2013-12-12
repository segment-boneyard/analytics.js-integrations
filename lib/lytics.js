
var alias = require('alias');
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Lytics);
};


/**
 * Expose `Lytics` integration.
 */

var Lytics = exports.Integration = integration('Lytics')
  .assumesPageview()
  .readyOnInitialize()
  .global('jstag')
  .option('cid', '')
  .option('cookie', 'seerid')
  .option('delay', 200)
  .option('sessionTimeout', 1800)
  .option('url', '//c.lytics.io');


/**
 * Options aliases.
 */

var aliases = {
  sessionTimeout: 'sessecs'
};


/**
 * Initialize.
 *
 * http://admin.lytics.io/doc#jstag
 *
 * @param {Object} page
 */

Lytics.prototype.initialize = function (page) {
  var options = alias(this.options, aliases);
  window.jstag = (function () {var t = {_q: [], _c: options, ts: (new Date()).getTime() }; t.send = function() {this._q.push([ 'ready', 'send', Array.prototype.slice.call(arguments) ]); return this; }; return t; })();
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Lytics.prototype.loaded = function () {
  return !! (window.jstag && window.jstag.bind);
};


/**
 * Load the Lytics library.
 *
 * @param {Function} callback
 */

Lytics.prototype.load = function (callback) {
  load('//c.lytics.io/static/io.min.js', callback);
};


/**
 * Page.
 *
 * @param {Page} page
 */

Lytics.prototype.page = function (page) {
  window.jstag.send(page.properties());
};


/**
 * Idenfity.
 *
 * @param {Identify} identify
 */

Lytics.prototype.identify = function (identify) {
  var traits = identify.traits({ userId: '_uid' });
  window.jstag.send(traits);
};


/**
 * Track.
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Lytics.prototype.track = function (track) {
  var props = track.properties();
  props._e = track.event();
  window.jstag.send(props);
};
