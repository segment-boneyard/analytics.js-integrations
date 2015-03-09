
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_prum');
var date = require('load-date');

/**
 * Expose `Pingdom` integration.
 */

var Pingdom = module.exports = integration('Pingdom')
  .assumesPageview()
  .global('_prum')
  .global('PRUM_EPISODES')
  .option('id', '')
  .tag('<script src="//rum-static.pingdom.net/prum.min.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Pingdom.prototype.initialize = function(page){
  window._prum = window._prum || [];
  push('id', this.options.id);
  push('mark', 'firstbyte', date.getTime());
  var self = this;
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Pingdom.prototype.loaded = function(){
  return !! (window._prum && window._prum.push !== Array.prototype.push);
};
