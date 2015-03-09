
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var is = require('is');
var extend = require('extend');
var onError = require('on-error');

/**
 * UMD ?
 */

var umd = 'function' == typeof define && define.amd;

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
 * @param {Object} page
 */

Bugsnag.prototype.initialize = function(page){
  var self = this;

  if (umd) {
    window.require([src], function(bugsnag){
      bugsnag.apiKey = self.options.apiKey;
      window.Bugsnag = bugsnag;
      self.ready();
    });
    return;
  }

  this.load(function(){
    window.Bugsnag.apiKey = self.options.apiKey;
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Bugsnag.prototype.loaded = function(){
  return is.object(window.Bugsnag);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Bugsnag.prototype.identify = function(identify){
  window.Bugsnag.metaData = window.Bugsnag.metaData || {};
  extend(window.Bugsnag.metaData, identify.traits());
};
