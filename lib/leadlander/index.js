
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var useHttps = require('use-https');

/**
 * Expose `LeadLander` integration.
 */

var LeadLander = module.exports = integration('LeadLander')
  .assumesPageview()
  .global('tl813v')
  .global('trackalyzer')
  .option('accountId', null)
  .tag('<script src="//1.tl813.com/tl813.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

LeadLander.prototype.initialize = function(page){
  window.tl813v = this.options.accountId;
  this.load(name, this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

LeadLander.prototype.loaded = function(){
  return !! window.trackalyzer;
};
