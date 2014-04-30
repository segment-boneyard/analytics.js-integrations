
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(LeadLander);
};

/**
 * Expose `LeadLander` integration.
 */

var LeadLander = exports.Integration = integration('LeadLander')
  .assumesPageview()
  .readyOnLoad()
  .global('llactid')
  .global('trackalyzer')
  .option('accountId', null);

/**
 * Initialize.
 *
 * @param {Object} page
 */

LeadLander.prototype.initialize = function(page){
  window.llactid = this.options.accountId;
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

LeadLander.prototype.loaded = function(){
  return !! window.trackalyzer;
};

/**
 * Load.
 *
 * @param {Function} callback
 */

LeadLander.prototype.load = function(callback){
  load('http://t6.trackalyzer.com/trackalyze-nodoc.js', callback);
};