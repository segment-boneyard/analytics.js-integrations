
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var useHttps = require('use-https');

/**
 * Expose `WebEngage` integration.
 */

var WebEngage = module.exports = integration('WebEngage')
  .assumesPageview()
  .global('_weq')
  .global('webengage')
  .option('widgetVersion', '4.0')
  .option('licenseCode', '')
  .tag('http', '<script src="http://cdn.widgets.webengage.com/js/widget/webengage-min-v-4.0.js">')
  .tag('https', '<script src="https://ssl.widgets.webengage.com/js/widget/webengage-min-v-4.0.js">');

/**
 * Initialize.
 *
 * @api public
 */

WebEngage.prototype.initialize = function() {
  var _weq = window._weq = window._weq || {};
  _weq['webengage.licenseCode'] = this.options.licenseCode;
  _weq['webengage.widgetVersion'] = this.options.widgetVersion;
  var name = useHttps() ? 'https' : 'http';
  this.load(name, this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

WebEngage.prototype.loaded = function() {
  return !!window.webengage;
};
