
var integration = require('integration');
var alias = require('alias');
var clone = require('clone');
var load = require('load-script');
var push = require('global-queue')('__insp');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Inspectlet);
};

/**
 * Expose `Inspectlet` integration.
 */

var Inspectlet = exports.Integration = integration('Inspectlet')
  .assumesPageview()
  .readyOnLoad()
  .global('__insp')
  .global('__insp_')
  .option('wid', '');

/**
 * Initialize.
 *
 * https://www.inspectlet.com/dashboard/embedcode/1492461759/initial
 *
 * @param {Object} page
 */

Inspectlet.prototype.initialize = function(page){
  push('wid', this.options.wid);
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Inspectlet.prototype.loaded = function(){
  return !! window.__insp_;
};

/**
 * Load the Inspectlet library.
 *
 * @param {Function} callback
 */

Inspectlet.prototype.load = function(callback){
  load('//www.inspectlet.com/inspectlet.js', callback);
};

/**
 * Track.
 *
 * http://www.inspectlet.com/docs/tags
 *
 * @param {Track} track
 */

Inspectlet.prototype.track = function(track){
  push('tagSession', track.event());
};
