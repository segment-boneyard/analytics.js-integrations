
/**
 * Module dependencies.
 */

var alias = require('alias');
var integration = require('analytics.js-integration');

/**
 * Expose `Lytics` integration.
 */

var Lytics = module.exports = integration('Lytics')
  .global('jstag')
  .option('cid', '')
  .option('cookie', 'seerid')
  .option('delay', 2000)
  .option('sessionTimeout', 1800)
  .option('url', '//c.lytics.io')
  .tag('<script src="//c.lytics.io/static/io.min.js">');

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
 * @api public
 */

Lytics.prototype.initialize = function() {
  var options = alias(this.options, aliases);
  /* eslint-disable */
  window.jstag = (function(){var t = { _q: [], _c: options, ts: (new Date()).getTime() }; t.send = function(){this._q.push(['ready', 'send', Array.prototype.slice.call(arguments)]); return this; }; return t; })();
  /* eslint-enable */
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Lytics.prototype.loaded = function() {
  return !!(window.jstag && window.jstag.bind);
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

Lytics.prototype.page = function(page) {
  window.jstag.send(page.properties());
};

/**
 * Idenfity.
 *
 * @api public
 * @param {Identify} identify
 */

Lytics.prototype.identify = function(identify) {
  var traits = identify.traits({ userId: '_uid' });
  window.jstag.send(traits);
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Lytics.prototype.track = function(track) {
  var props = track.properties();
  props._e = track.event();
  window.jstag.send(props);
};
