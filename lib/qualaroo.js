
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_kiq');
var Facade = require('facade');
var Identify = Facade.Identify;


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Qualaroo);
};


/**
 * Expose `Qualaroo` integration.
 */

var Qualaroo = exports.Integration = integration('Qualaroo')
  .assumesPageview()
  .readyOnInitialize()
  .global('_kiq')
  .option('customerId', '')
  .option('siteToken', '')
  .option('track', false);


/**
 * Initialize.
 *
 * @param {Object} page
 */

Qualaroo.prototype.initialize = function (page) {
  window._kiq = window._kiq || [];
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Qualaroo.prototype.loaded = function () {
  return !! (window._kiq && window._kiq.push !== Array.prototype.push);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Qualaroo.prototype.load = function (callback) {
  var token = this.options.siteToken;
  var id = this.options.customerId;
  load('//s3.amazonaws.com/ki.js/' + id + '/' + token + '.js', callback);
};


/**
 * Identify.
 *
 * http://help.qualaroo.com/customer/portal/articles/731085-identify-survey-nudge-takers
 * http://help.qualaroo.com/customer/portal/articles/731091-set-additional-user-properties
 *
 * @param {Identify} identify
 */

Qualaroo.prototype.identify = function (identify) {
  var traits = identify.traits();
  var id = identify.userId();
  var email = identify.email();
  if (email) id = email;
  if (id) push('identify', id);
  if (traits) push('set', traits);
};


/**
 * Track.
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Qualaroo.prototype.track = function (track) {
  if (!this.options.track) return;
  var event = track.event();
  var traits = {};
  traits['Triggered: ' + event] = true;
  this.identify(new Identify({ traits: traits }));
};
