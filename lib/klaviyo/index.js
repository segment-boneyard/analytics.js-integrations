
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_learnq');
var tick = require('next-tick');

/**
 * Trait aliases.
 */

var traitAliases = {
  id: '$id',
  email: '$email',
  firstName: '$first_name',
  lastName: '$last_name',
  phone: '$phone_number',
  title: '$title'
};

/**
 * Expose `Klaviyo` integration.
 */

var Klaviyo = module.exports = integration('Klaviyo')
  .assumesPageview()
  .global('_learnq')
  .option('apiKey', '')
  .tag('<script src="//a.klaviyo.com/media/js/learnmarklet.js">');

/**
 * Initialize.
 *
 * https://www.klaviyo.com/docs/getting-started
 *
 * @api public
 */

Klaviyo.prototype.initialize = function(){
  var self = this;
  push('account', this.options.apiKey);
  this.load(function(){
    tick(self.ready);
  });
};

/**
 * Loaded?
 *
 * @api public
 * @return {Boolean}
 */

Klaviyo.prototype.loaded = function(){
  return !!(window._learnq && window._learnq.push !== Array.prototype.push);
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Klaviyo.prototype.identify = function(identify){
  var traits = identify.traits(traitAliases);
  if (!traits.$id && !traits.$email) return;
  push('identify', traits);
};

/**
 * Group.
 *
 * @param {Group} group
 */

Klaviyo.prototype.group = function(group){
  var props = group.properties();
  if (!props.name) return;
  push('identify', { $organization: props.name });
};

/**
 * Track.
 *
 * @param {Track} track
 */

Klaviyo.prototype.track = function(track){
  push('track', track.event(), track.properties({
    revenue: '$value'
  }));
};
