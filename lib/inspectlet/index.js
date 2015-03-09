
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('__insp');
var alias = require('alias');
var clone = require('clone');

/**
 * Expose `Inspectlet` integration.
 */

var Inspectlet = module.exports = integration('Inspectlet')
  .assumesPageview()
  .global('__insp')
  .global('__insp_')
  .option('wid', '')
  .tag('<script src="//cdn.inspectlet.com/inspectlet.js">');

/**
 * Initialize.
 *
 * https://www.inspectlet.com/dashboard/embedcode/1492461759/initial
 *
 * @param {Object} page
 */

Inspectlet.prototype.initialize = function(page){
  push('wid', this.options.wid);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Inspectlet.prototype.loaded = function(){
  return !! (window.__insp_ && window.__insp);
};

/**
 * Identify.
 *
 * http://www.inspectlet.com/docs#tagging
 *
 * @param {Identify} identify
 */

Inspectlet.prototype.identify = function(identify){
  var traits = identify.traits({ id: 'userid' });
  push('tagSession', traits);
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

/**
 * Page.
 *
 * http://www.inspectlet.com/docs/tags
 *
 * @param {Track} track
 */

Inspectlet.prototype.page = function(){
  push('virtualPage');
};
