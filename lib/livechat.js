
var each = require('each');
var integration = require('integration');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(LiveChat);
};


/**
 * Expose `LiveChat` integration.
 */

var LiveChat = exports.Integration = integration('LiveChat')
  .assumesPageview()
  .readyOnLoad()
  .global('__lc')
  .option('license', '');


/**
 * Initialize.
 *
 * http://www.livechatinc.com/api/javascript-api
 *
 * @param {Object} page
 */

LiveChat.prototype.initialize = function (page) {
  window.__lc = { license: this.options.license };
  this.isLoaded = false;
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

LiveChat.prototype.loaded = function () {
  return this.isLoaded;
};


/**
 * Load.
 *
 * @param {Function} callback
 */

LiveChat.prototype.load = function (callback) {
  var self = this;
  load('//cdn.livechatinc.com/tracking.js', function(err){
    if (err) return callback(err);
    self.isLoaded = true;
    callback();
  });
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

LiveChat.prototype.identify = function (identify) {
  var traits = identify.traits({ userId: 'User ID' });
  window.LC_API.set_custom_variables(convert(traits));
};


/**
 * Convert a traits object into the format LiveChat requires.
 *
 * @param {Object} traits
 * @return {Array}
 */

function convert (traits) {
  var arr = [];
  each(traits, function (key, value) {
    arr.push({ name: key, value: value });
  });
  return arr;
}
