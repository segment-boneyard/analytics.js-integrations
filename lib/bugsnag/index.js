
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var is = require('is');
var extend = require('extend');

/**
 * UMD ?
 */

var umd = typeof window.define === 'function' && window.define.amd;

/**
 * Source.
 */

var src = '//d2wy8f7a9ursnm.cloudfront.net/bugsnag-2.min.js';

/**
 * Expose `Bugsnag` integration.
 */

var Bugsnag = module.exports = integration('Bugsnag')
  .global('Bugsnag')
  .option('apiKey', '')
  .tag('<script src="' + src + '">');

/**
 * Initialize.
 *
 * https://bugsnag.com/docs/notifiers/js
 *
 * @api public
 */

Bugsnag.prototype.initialize = function() {
  var self = this;

  if (umd) {
    window.require([src], function(bugsnag) {
      bugsnag.apiKey = self.options.apiKey;
      window.Bugsnag = bugsnag;
      self.ready();
    });
    return;
  }

  this.load(function() {
    window.Bugsnag.apiKey = self.options.apiKey;
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Bugsnag.prototype.loaded = function() {
  return is.object(window.Bugsnag);
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Bugsnag.prototype.identify = function(identify) {
  window.Bugsnag.metaData = window.Bugsnag.metaData || {};
  extend(window.Bugsnag.metaData, identify.traits());
};
