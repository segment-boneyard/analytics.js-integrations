
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var extend = require('extend');
var is = require('is');
var rollbarSnippet = require('./snippet');

/**
 * Expose `Rollbar` integration.
 */

var RollbarIntegration = module.exports = integration('Rollbar')
  .global('Rollbar')
  .option('identify', true)
  .option('accessToken', '')
  .option('environment', 'unknown')
  .option('captureUncaught', true);

/**
 * Initialize.
 *
 * @param {Object} page
 */

RollbarIntegration.prototype.initialize = function(page){
  var _rollbarConfig = this.config = {
    accessToken: this.options.accessToken,
    captureUncaught: this.options.captureUncaught,
    payload: {
      environment: this.options.environment
    }
  };

  rollbarSnippet(window, _rollbarConfig);

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

RollbarIntegration.prototype.loaded = function(){
  return is.object(window.Rollbar) && null == window.Rollbar.shimId;
};

/**
 * Load.
 *
 * @param {Function} callback
 */

RollbarIntegration.prototype.load = function(callback){
  window.Rollbar.loadFull(window, document, true, this.config, callback);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */
RollbarIntegration.prototype.identify = function(identify){
  // do stuff with `id` or `traits`
  if (!this.options.identify) return;

  // Don't allow identify without a user id
  var uid = identify.userId();
  if (uid === null || uid === undefined) return;

  var rollbar = window.Rollbar;
  var person = { id: uid };
  extend(person, identify.traits());
  rollbar.configure({ payload: { person: person }});
};
