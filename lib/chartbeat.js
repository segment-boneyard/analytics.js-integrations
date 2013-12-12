
var integration = require('integration');
var onBody = require('on-body');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
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

Chartbeat.prototype.initialize = function (page) {
  window._sf_async_config = this.options;
  onBody(function () {
    window._sf_endpt = new Date().getTime();
  });
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Chartbeat.prototype.loaded = function () {
  return !! window.pSUPERFLY;
};


/**
 * Load the Chartbeat library.
 *
 * http://chartbeat.com/docs/adding_the_code/
 *
 * @param {Function} callback
 */

Chartbeat.prototype.load = function (callback) {
  load({
    https: 'https://a248.e.akamai.net/chartbeat.download.akamai.com/102508/js/chartbeat.js',
    http: 'http://static.chartbeat.com/js/chartbeat.js'
  }, callback);
};


/**
 * Page.
 *
 * http://chartbeat.com/docs/handling_virtual_page_changes/
 *
 * @param {Page} page
 */

Chartbeat.prototype.page = function (page) {
  var props = page.properties();
  var name = page.fullName();
  window.pSUPERFLY.virtualPage(props.path, name || props.title);
};
