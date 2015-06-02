
/**
 * Module dependencies.
 */

var defaults = require('defaults');
var integration = require('analytics.js-integration');
var onBody = require('on-body');

/**
 * Expose `Chartbeat` integration.
 */

var Chartbeat = module.exports = integration('Chartbeat')
  .assumesPageview()
  .global('_sf_async_config')
  .global('_sf_endpt')
  .global('pSUPERFLY')
  .option('domain', '')
  .option('uid', null)
  .tag('<script src="//static.chartbeat.com/js/chartbeat.js">');

/**
 * Initialize.
 *
 * http://chartbeat.com/docs/configuration_variables/
 *
 * @api public
 */

Chartbeat.prototype.initialize = function() {
  var self = this;

  window._sf_async_config = window._sf_async_config || {};
  window._sf_async_config.useCanonical = true;
  defaults(window._sf_async_config, this.options);

  onBody(function() {
    window._sf_endpt = new Date().getTime();
    // Note: Chartbeat depends on document.body existing so the script does
    // not load until that is confirmed. Otherwise it may trigger errors.
    self.load(self.ready);
  });
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Chartbeat.prototype.loaded = function() {
  return !!window.pSUPERFLY;
};

/**
 * Page.
 *
 * http://chartbeat.com/docs/handling_virtual_page_changes/
 *
 * @api public
 * @param {Page} page
 */

Chartbeat.prototype.page = function(page) {
  var category = page.category();
  if (category) window._sf_async_config.sections = category;
  var author = page.proxy('properties.author');
  if (author) window._sf_async_config.authors = author;
  var props = page.properties();
  var name = page.fullName();
  window.pSUPERFLY.virtualPage(props.path, name || props.title);
};
