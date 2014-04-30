
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(CrazyEgg);
};

/**
 * Expose `CrazyEgg` integration.
 */

var CrazyEgg = exports.Integration = integration('Crazy Egg')
  .assumesPageview()
  .readyOnLoad()
  .global('CE2')
  .option('accountNumber', '');

/**
 * Initialize.
 *
 * @param {Object} page
 */

CrazyEgg.prototype.initialize = function(page){
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

CrazyEgg.prototype.loaded = function(){
  return !! window.CE2;
};

/**
 * Load the Crazy Egg library.
 *
 * @param {Function} callback
 */

CrazyEgg.prototype.load = function(callback){
  var number = this.options.accountNumber;
  var path = number.slice(0,4) + '/' + number.slice(4);
  var cache = Math.floor(new Date().getTime()/3600000);
  var url = '//dnn506yrbagrg.cloudfront.net/pages/scripts/' + path + '.js?' + cache;
  load(url, callback);
};