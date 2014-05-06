
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(PerfectAudience);
};

/**
 * Expose `PerfectAudience` integration.
 */

var PerfectAudience = exports.Integration = integration('Perfect Audience')
  .assumesPageview()
  .readyOnLoad()
  .global('_pa')
  .option('siteId', '');

/**
 * Initialize.
 *
 * https://www.perfectaudience.com/docs#javascript_api_autoopen
 *
 * @param {Object} page
 */

PerfectAudience.prototype.initialize = function(page){
  window._pa = window._pa || {};
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

PerfectAudience.prototype.loaded = function(){
  return !! (window._pa && window._pa.track);
};

/**
 * Load.
 *
 * @param {Function} callback
 */

PerfectAudience.prototype.load = function(callback){
  var id = this.options.siteId;
  load('//tag.perfectaudience.com/serve/' + id + '.js', callback);
};

/**
 * Track.
 *
 * @param {Track} event
 */

PerfectAudience.prototype.track = function(track){
  window._pa.track(track.event(), track.properties());
};
