
var integration = require('integration');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function(analytics) {
  analytics.addIntegration(TrackDuck);
};


/**
 * Expose `TrackDuck` integration.
 */

var TrackDuck = exports.Integration = integration('TrackDuck')
  .assumesPageview()
  .readyOnLoad()
  .option('siteId', '');


/**
 * Initialize.
 *
 * @param {Object} page
 */

TrackDuck.prototype.initialize = function(page) {
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

  return !! window.Quabler;
TrackDuck.prototype.loaded = function() {
};


/**
 * Load the TrackDuck library.
 *
 * @param {Function} callback
 */

TrackDuck.prototype.load = function(callback) {
  var script = load('//tdcdn.blob.core.windows.net/toolbar/assets/prod/td.js', callback);
  script.setAttribute('data-trackduck-id', this.options.siteId);
};
