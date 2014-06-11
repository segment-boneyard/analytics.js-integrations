
/**
 * Module dependencies.
 */

var integration = require('integration');
var defaults = require('defaults');
var load = require('load-script');
var onBody = require('on-body');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Chartbeat);
};

/**
 * Expose `Chartbeat` integration.
 */

var Chartbeat = exports.Integration = integration('Chartbeat')
  .assumesPageview()
  .readyOnLoad()
  .global('_sf_async_config')
  .global('_sf_endpt')
  .global('pSUPERFLY')
  .option('domain', '')
  .option('uid', null);

/**
 * Initialize.
 *
 * http://chartbeat.com/docs/configuration_variables/
 *
 * @param {Object} page
 */

Chartbeat.prototype.initialize = function(page){
  var self = this;

  window._sf_async_config = window._sf_async_config || {};
  window._sf_async_config.useCanonical = true;
  defaults(window._sf_async_config, this.options);

  onBody(function(){
    window._sf_endpt = new Date().getTime();
    // Note: Chartbeat depends on document.body existing so the script does
    // not load until that is confirmed. Otherwise it may trigger errors.
    self.load();
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Chartbeat.prototype.loaded = function(){
  return !! window.pSUPERFLY;
};

/**
 * Load the Chartbeat library.
 *
 * http://chartbeat.com/docs/adding_the_code/
 *
 * @param {Function} fn
 */

Chartbeat.prototype.load = function(fn){
  load('//static.chartbeat.com/js/chartbeat.js', fn);
};

/**
 * Page.
 *
 * http://chartbeat.com/docs/handling_virtual_page_changes/
 *
 * @param {Page} page
 */

Chartbeat.prototype.page = function(page){
  var props = page.properties();
  var name = page.fullName();
  window.pSUPERFLY.virtualPage(props.path, name || props.title);
};
