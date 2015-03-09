
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var useHttps = require('use-https');
var each = require('each');
var is = require('is');

/**
 * Expose `MouseStats` integration.
 */

var MouseStats = module.exports = integration('MouseStats')
  .assumesPageview()
  .global('msaa')
  .global('MouseStatsVisitorPlaybacks')
  .option('accountNumber', '')
  .tag('http', '<script src="http://www2.mousestats.com/js/{{ path }}.js?{{ cache }}">')
  .tag('https', '<script src="https://ssl.mousestats.com/js/{{ path }}.js?{{ cache }}">');

/**
 * Initialize.
 *
 * http://www.mousestats.com/docs/pages/allpages
 *
 * @param {Object} page
 */

MouseStats.prototype.initialize = function(page){
  var number = this.options.accountNumber;
  var path = number.slice(0,1) + '/' + number.slice(1,2) + '/' + number;
  var cache = Math.floor(new Date().getTime() / 60000);
  var name = useHttps() ? 'https' : 'http';
  this.load(name, { path: path, cache: cache }, this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

MouseStats.prototype.loaded = function(){
  return is.array(window.MouseStatsVisitorPlaybacks);
};

/**
 * Identify.
 *
 * http://www.mousestats.com/docs/wiki/7/how-to-add-custom-data-to-visitor-playbacks
 *
 * @param {Identify} identify
 */

MouseStats.prototype.identify = function(identify){
  each(identify.traits(), function(key, value){
    window.MouseStatsVisitorPlaybacks.customVariable(key, value);
  });
};
