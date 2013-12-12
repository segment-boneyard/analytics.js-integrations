
var integration = require('integration');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(LuckyOrange);
};


/**
 * Expose `LuckyOrange` integration.
 */

var LuckyOrange = exports.Integration = integration('Lucky Orange')
  .assumesPageview()
  .readyOnLoad()
  .global('_loq')
  .global('__wtw_watcher_added')
  .global('__wtw_lucky_site_id')
  .global('__wtw_lucky_is_segment_io')
  .option('siteId', null);


/**
 * Initialize.
 *
 * @param {Object} page
 */

LuckyOrange.prototype.initialize = function (page) {
  window._loq || (window._loq = []);
  window.__wtw_lucky_site_id = this.options.siteId;
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

LuckyOrange.prototype.loaded = function () {
  return !! window.__wtw_watcher_added;
};


/**
 * Load.
 *
 * @param {Function} callback
 */

LuckyOrange.prototype.load = function (callback) {
  var cache = Math.floor(new Date().getTime() / 60000);
  load({
    http: 'http://www.luckyorange.com/w.js?' + cache,
    https: 'https://ssl.luckyorange.com/w.js?' + cache
  }, callback);
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

LuckyOrange.prototype.identify = function (identify) {
  var traits = identify.traits();
  var id = identify.userId();
  if (id) window._loq.push(['identify', id]);
  if (traits) window._loq.push(['set', traits]);
};
