
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var is = require('is');

/**
 * Expose `Atatus` integration.
 */

var Atatus = module.exports = integration('Atatus')
  .global('atatus')
  .option('apiKey', '')
  .tag('<script src="//dmc1acwvwny3.cloudfront.net/atatus.js">');

/**
 * Initialize.
 *
 * https://www.atatus.com/docs.html
 *
 * @param {Object} page
 */

Atatus.prototype.initialize = function(page) {
  var self = this;

  this.load(function () {
    // Configure Atatus and install default handler to capture uncaught exceptions
    window.atatus.config(self.options.apiKey).install();
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Atatus.prototype.loaded = function() {
  return is.object(window.atatus);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Atatus.prototype.identify = function(identify) {
  window.atatus.setCustomData({ person: identify.traits() });
};
