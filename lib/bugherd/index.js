
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(BugHerd);
};

/**
 * Expose `BugHerd` integration.
 */

var BugHerd = exports.Integration = integration('BugHerd')
  .assumesPageview()
  .readyOnLoad()
  .global('BugHerdConfig')
  .global('_bugHerd')
  .option('apiKey', '')
  .option('showFeedbackTab', true);

/**
 * Initialize.
 *
 * http://support.bugherd.com/home
 *
 * @param {Object} page
 */

BugHerd.prototype.initialize = function(page){
  window.BugHerdConfig = { feedback: { hide: !this.options.showFeedbackTab }};
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

BugHerd.prototype.loaded = function(){
  return !! window._bugHerd;
};

/**
 * Load the BugHerd library.
 *
 * @param {Function} callback
 */

BugHerd.prototype.load = function(callback){
  load('//www.bugherd.com/sidebarv2.js?apikey=' + this.options.apiKey, callback);
};