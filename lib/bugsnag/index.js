
var integration = require('integration');
var is = require('is');
var extend = require('extend');
var load = require('load-script');
var onError = require('on-error');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Bugsnag);
};

/**
 * Expose `Bugsnag` integration.
 */

var Bugsnag = exports.Integration = integration('Bugsnag')
  .readyOnLoad()
  .global('Bugsnag')
  .option('apiKey', '');

/**
 * Initialize.
 *
 * https://bugsnag.com/docs/notifiers/js
 *
 * @param {Object} page
 */

Bugsnag.prototype.initialize = function(page){
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Bugsnag.prototype.loaded = function(){
  return is.object(window.Bugsnag);
};

/**
 * Load.
 *
 * @param {Function} callback (optional)
 */

Bugsnag.prototype.load = function(callback){
  var apiKey = this.options.apiKey;
  load('//d2wy8f7a9ursnm.cloudfront.net/bugsnag-2.min.js', function(err){
    if (err) return callback(err);
    window.Bugsnag.apiKey = apiKey;
    callback();
  });
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Bugsnag.prototype.identify = function(identify){
  window.Bugsnag.metaData = window.Bugsnag.metaData || {};
  extend(window.Bugsnag.metaData, identify.traits());
};
