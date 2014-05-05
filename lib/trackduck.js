
var integration = require('integration');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(TrackDuck);
};


/**
 * Expose `Trackduck` integration.
 */

var Trackduck = exports.Integration = integration('Trackduck')
  .assumesPageview()
  .readyOnLoad();


/**
 * Initialize.
 *
 * http://support.bugherd.com/home
 *
 * @param {Object} page
 */

Trackduck.prototype.initialize = function (page) {
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Trackduck.prototype.loaded = function () {
  return !! window._bugHerd;
};


/**
 * Load the Trackduck library.
 *
 * @param {Function} callback
 */

Trackduck.prototype.load = function (callback) {
  load('//tdcdn.blob.core.windows.net/toolbar/assets/prod/td.js', callback);
};
