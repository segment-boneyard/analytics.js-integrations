
/**
 * Module dependencies.
 */

var alias = require('alias');
var integration = require('analytics.js-integration');

/**
 * Expose `Nudgespot` integration.
 */

var Nudgespot = module.exports = integration('Nudgespot')
  .assumesPageview()
  .global('nudgespot')
  .option('clientApiKey', '')
  .tag('<script id="nudgespot" src="//cdn.nudgespot.com/nudgespot.js">');

/**
 * Initialize Nudgespot.
 *
 * @api public
 */

Nudgespot.prototype.initialize = function(){
  window.nudgespot = window.nudgespot || [];
  /* eslint-disable */
  window.nudgespot.init = function(n, t){function f(n,m){var a=m.split('.');2==a.length&&(n=n[a[0]],m=a[1]);n[m]=function(){n.push([m].concat(Array.prototype.slice.call(arguments,0)))}}n._version=0.1;n._globals=[t];n.people=n.people||[];n.params=n.params||[];m="track register unregister identify set_config people.delete people.create people.update people.create_property people.tag people.remove_Tag".split(" ");for (var i=0;i<m.length;i++)f(n,m[i])};
  /* eslint-enable */
  window.nudgespot.init(window.nudgespot, this.options.clientApiKey);
  this.load(this.ready);
};

/**
 * Has the Nudgespot library been loaded yet?
 *
 * @api private
 * @return {boolean}
 */

Nudgespot.prototype.loaded = function(){
  return !!(window.nudgespot && window.nudgespot.push !== Array.prototype.push);
};

/**
 * Identify a user.
 *
 * @api public
 * @param {Identify} identify
 */

Nudgespot.prototype.identify = function(identify){
  if (!identify.userId()) return this.debug('user id required');
  var traits = identify.traits({ createdAt: 'created' });
  traits = alias(traits, { created: 'created_at' });
  window.nudgespot.identify(identify.userId(), traits);
};

/**
 * Track an event.
 *
 * @api public
 * @param {Track} track
 */

Nudgespot.prototype.track = function(track){
  window.nudgespot.track(track.event(), track.properties());
};
