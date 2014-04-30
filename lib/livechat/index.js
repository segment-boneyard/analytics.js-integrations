
var each = require('each');
var integration = require('integration');
var load = require('load-script');
var clone = require('clone');
var when = require('when');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(LiveChat);
};

/**
 * Expose `LiveChat` integration.
 */

var LiveChat = exports.Integration = integration('LiveChat')
  .assumesPageview()
  .readyOnLoad()
  .global('__lc')
  .global('__lc_inited')
  .global('LC_API')
  .global('LC_Invite')
  .option('group', 0)
  .option('license', '');

/**
 * Initialize.
 *
 * http://www.livechatinc.com/api/javascript-api
 *
 * @param {Object} page
 */

LiveChat.prototype.initialize = function(page){
  window.__lc = clone(this.options);
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

LiveChat.prototype.loaded = function(){
  return !!(window.LC_API && window.LC_Invite);
};

/**
 * Load.
 *
 * @param {Function} callback
 */

LiveChat.prototype.load = function(callback){
  var self = this;
  load('//cdn.livechatinc.com/tracking.js', function(err){
    if (err) return callback(err);
    when(function(){
      return self.loaded();
    }, callback);
  });
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

LiveChat.prototype.identify = function(identify){
  var traits = identify.traits({ userId: 'User ID' });
  window.LC_API.set_custom_variables(convert(traits));
};

/**
 * Convert a traits object into the format LiveChat requires.
 *
 * @param {Object} traits
 * @return {Array}
 */

function convert(traits){
  var arr = [];
  each(traits, function(key, value){
    arr.push({ name: key, value: value });
  });
  return arr;
}
