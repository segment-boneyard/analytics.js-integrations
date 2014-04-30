
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(WebEngage);
};

/**
 * Expose `WebEngage` integration
 */

var WebEngage = exports.Integration = integration('WebEngage')
  .assumesPageview()
  .readyOnLoad()
  .global('_weq')
  .global('webengage')
  .option('widgetVersion', '4.0')
  .option('licenseCode', '');

/**
 * Initialize.
 *
 * @param {Object} page
 */

WebEngage.prototype.initialize = function(page){
  var _weq = window._weq = window._weq || {};
  _weq['webengage.licenseCode'] = this.options.licenseCode;
  _weq['webengage.widgetVersion'] = this.options.widgetVersion;
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

WebEngage.prototype.loaded = function(){
  return !! window.webengage;
};

/**
 * Load
 *
 * @param {Function} fn
 */

WebEngage.prototype.load = function(fn){
  var path = '/js/widget/webengage-min-v-4.0.js';
  load({
    https: 'https://ssl.widgets.webengage.com' + path,
    http: 'http://cdn.widgets.webengage.com' + path
  }, fn);
};
