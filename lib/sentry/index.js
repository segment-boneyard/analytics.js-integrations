
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var is = require('is');

/**
 * Expose `Sentry` integration.
 */

var Sentry = module.exports = integration('Sentry')
  .global('Raven')
  .option('config', '')
  .tag('<script src="//cdn.ravenjs.com/1.1.16/native/raven.min.js">');

/**
 * Initialize.
 *
 * http://raven-js.readthedocs.org/en/latest/config/index.html
 * https://github.com/getsentry/raven-js/blob/1.1.16/src/raven.js#L734-L741
 */

Sentry.prototype.initialize = function(){
  var config = window.RavenConfig || (window.RavenConfig = {});
  config.dsn = this.options.config;

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Sentry.prototype.loaded = function(){
  return is.object(window.Raven);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Sentry.prototype.identify = function(identify){
  window.Raven.setUser(identify.traits());
};
