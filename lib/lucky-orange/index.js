
var Identify = require('facade').Identify;
var integration = require('integration');
var load = require('load-script');

/**
 * User ref
 */

var user;

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(LuckyOrange);
  user = analytics.user();
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
  .global('__wtw_custom_user_data')
  .option('siteId', null);

/**
 * Initialize.
 *
 * @param {Object} page
 */

LuckyOrange.prototype.initialize = function(page){
  window._loq || (window._loq = []);
  window.__wtw_lucky_site_id = this.options.siteId;
  this.identify(new Identify({
    traits: user.traits(),
    userId: user.id()
  }));
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

LuckyOrange.prototype.loaded = function(){
  return !! window.__wtw_watcher_added;
};

/**
 * Load.
 *
 * @param {Function} callback
 */

LuckyOrange.prototype.load = function(callback){
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

LuckyOrange.prototype.identify = function(identify){
  var traits = window.__wtw_custom_user_data = identify.traits();
  var email = identify.email();
  var name = identify.name();
  if (name) traits.name = name;
  if (email) traits.email = email;
};
