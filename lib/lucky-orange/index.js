
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var Identify = require('facade').Identify;
var useHttps = require('use-https');

/**
 * Expose `LuckyOrange` integration.
 */

var LuckyOrange = module.exports = integration('Lucky Orange')
  .assumesPageview()
  .global('_loq')
  .global('__wtw_watcher_added')
  .global('__wtw_lucky_site_id')
  .global('__wtw_lucky_is_segment_io')
  .global('__wtw_custom_user_data')
  .option('siteId', null)
  .tag('http', '<script src="http://www.luckyorange.com/w.js?{{ cache }}">')
  .tag('https', '<script src="https://ssl.luckyorange.com/w.js?{{ cache }}">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

LuckyOrange.prototype.initialize = function(page){
  var user = this.analytics.user();
  window._loq || (window._loq = []);
  window.__wtw_lucky_site_id = this.options.siteId;
  this.identify(new Identify({
    traits: user.traits(),
    userId: user.id()
  }));
  var cache = Math.floor(new Date().getTime() / 60000);
  var name = useHttps() ? 'https' : 'http';
  this.load(name, { cache: cache }, this.ready);
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
 * Identify.
 *
 * @param {Identify} identify
 */

LuckyOrange.prototype.identify = function(identify){
  var traits = identify.traits();
  var email = identify.email();
  var name = identify.name();
  if (name) traits.name = name;
  if (email) traits.email = email;
  window.__wtw_custom_user_data = traits;
};
