
/**
 * Module dependencies.
 */

var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('__nls');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Navilytics);
};

/**
 * Expose `Navilytics` integration.
 */

var Navilytics = exports.Integration = integration('Navilytics')
  .assumesPageview()
  .readyOnLoad()
  .global('__nls')
  .option('memberId', '')
  .option('projectId', '');

/**
 * Initialize.
 *
 * https://www.navilytics.com/member/code_settings
 *
 * @param {Object} page
 */

Navilytics.prototype.initialize = function(page){
  window.__nls = window.__nls || [];
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Navilytics.prototype.loaded = function(){
  return !! (window.__nls && [].push != window.__nls.push);
};

/**
 * Load the Navilytics library.
 *
 * @param {Function} callback
 */

Navilytics.prototype.load = function(callback){
  var mid = this.options.memberId;
  var pid = this.options.projectId;
  var url = '//www.navilytics.com/nls.js?mid=' + mid + '&pid=' + pid;
  load(url, callback);
};

/**
 * Track.
 *
 * https://www.navilytics.com/docs#tags
 *
 * @param {Track} track
 */

Navilytics.prototype.track = function(track){
  push('tagRecording', track.event());
};
