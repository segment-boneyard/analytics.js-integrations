
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose `CrazyEgg` integration.
 */

var CrazyEgg = module.exports = integration('Crazy Egg')
  .assumesPageview()
  .global('CE2')
  .option('accountNumber', '')
  .tag('<script src="//dnn506yrbagrg.cloudfront.net/pages/scripts/{{ path }}.js?{{ cache }}">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

CrazyEgg.prototype.initialize = function(page){
  var number = this.options.accountNumber;
  var path = number.slice(0,4) + '/' + number.slice(4);
  var cache = Math.floor(new Date().getTime() / 3600000);
  this.load({ path: path, cache: cache }, this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

CrazyEgg.prototype.loaded = function(){
  return !! window.CE2;
};
