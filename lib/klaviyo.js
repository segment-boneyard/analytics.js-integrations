
var alias = require('alias');
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_learnq');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Klaviyo);
};


/**
 * Expose `Klaviyo` integration.
 */

var Klaviyo = exports.Integration = integration('Klaviyo')
  .assumesPageview()
  .readyOnInitialize()
  .global('_learnq')
  .option('apiKey', '');


/**
 * Initialize.
 *
 * https://www.klaviyo.com/docs/getting-started
 *
 * @param {Object} page
 */

Klaviyo.prototype.initialize = function (page) {
  push('account', this.options.apiKey);
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Klaviyo.prototype.loaded = function () {
  return !! (window._learnq && window._learnq.push !== Array.prototype.push);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Klaviyo.prototype.load = function (callback) {
  load('//a.klaviyo.com/media/js/learnmarklet.js', callback);
};


/**
 * Trait aliases.
 */

var aliases = {
  id: '$id',
  email: '$email',
  firstName: '$first_name',
  lastName: '$last_name',
  phone: '$phone_number',
  title: '$title'
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

Klaviyo.prototype.identify = function (identify) {
  var traits = identify.traits(aliases);
  if (!traits.$id && !traits.$email) return;
  push('identify', traits);
};


/**
 * Group.
 *
 * @param {Group} group
 */

Klaviyo.prototype.group = function (group) {
  var props = group.properties();
  if (!props.name) return;
  push('identify', { $organization: props.name });
};


/**
 * Track.
 *
 * @param {Track} track
 */

Klaviyo.prototype.track = function (track) {
  push('track', track.event(), track.properties());
};
