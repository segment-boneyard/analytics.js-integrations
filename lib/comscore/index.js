
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var useHttps = require('use-https');

/**
 * Expose `Comscore` integration.
 */

var Comscore = module.exports = integration('comScore')
  .assumesPageview()
  .global('_comscore')
  .global('COMSCORE')
  .option('c1', '2')
  .option('c2', '')
  .tag('http', '<script src="http://b.scorecardresearch.com/beacon.js">')
  .tag('https', '<script src="https://sb.scorecardresearch.com/beacon.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Comscore.prototype.initialize = function(page){
  window._comscore = window._comscore || [this.options];
  var name = useHttps() ? 'https' : 'http';
  this.load(name, this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Comscore.prototype.loaded = function(){
  return !! window.COMSCORE;
};

/**
 * Page
 *
 * @param {Object} page
 */

Comscore.prototype.page = function(page){
  window.COMSCORE.beacon(this.options);
};
