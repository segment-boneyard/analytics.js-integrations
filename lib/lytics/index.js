
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var alias = require('alias');

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
 * @param {Object} page
 */

Lytics.prototype.initialize = function(page){
  var options = alias(this.options, aliases);
  window.jstag = (function(){var t = { _q: [], _c: options, ts: (new Date()).getTime() }; t.send = function(){this._q.push(['ready', 'send', Array.prototype.slice.call(arguments)]); return this; }; return t; })();
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Lytics.prototype.loaded = function(){
  return !! (window.jstag && window.jstag.bind);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Lytics.prototype.page = function(page){
  var props = page.properties();
  props._e = props.name;
  delete props.name;
  window.jstag.send(props);
};

/**
 * Idenfity.
 *
 * @param {Identify} identify
 */

Lytics.prototype.identify = function(identify){
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

Lytics.prototype.track = function(track){
  var props = track.properties();
  props._e = track.event();
  window.jstag.send(props);
};
