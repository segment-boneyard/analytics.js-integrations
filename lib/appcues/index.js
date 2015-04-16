
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var load = require('load-script');
var is = require('is');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Appcues);
};

/**
 * Expose `Appcues` integration.
 */

var Appcues = exports.Integration = integration('Appcues')
  .assumesPageview()
  .global('Appcues')
  .option('appcuesId', '');

/**
 * Initialize.
 *
 * http://appcues.com/docs/
 *
 * @param {Object}
 */

Appcues.prototype.initialize = function(){
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Appcues.prototype.loaded = function(){
  return is.object(window.Appcues);
};

/**
 * Load the Appcues library.
 *
 * @param {Function} callback
 */

Appcues.prototype.load = function(callback){
  var id = this.options.appcuesId || 'appcues';
  var script = load('//fast.appcues.com/' + id + '.js', callback);
};

/**
 * Identify.
 *
 * http://appcues.com/docs#identify
 *
 * @param {Identify} identify
 */

Appcues.prototype.identify = function(identify){
  window.Appcues.identify(identify.userId(), identify.traits());
};
