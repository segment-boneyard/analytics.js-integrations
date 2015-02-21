var integration = require('analytics.js-integration');
var alias = require('alias');
var Identify = require('facade').Identify;

/**
 * Expose `plugin`.
 */

/*module.exports = exports = function(analytics){
  analytics.addIntegration(Nudgespot);
};*/

/**
 * Expose `Nudgespot` integration.
 */

var Nudgespot = module.exports = integration('Nudgespot')
  .assumesPageview()
  .option('apiKey', '')
  .global('nudgespot')
  .tag('<script id="nudgespot" src="http://cdn.nudgespot.com/nudgespot.js">');

/**
 * Initialize Nudgespot.
 */

Nudgespot.prototype.initialize = function(page){
  window.nudgespot = window.nudgespot || [];
  window.nudgespot.init = function(n, t){function f(n,m){var a=m.split('.');2==a.length&&(n=n[a[0]],m=a[1]);n[m]=function(){n.push([m].concat(Array.prototype.slice.call(arguments,0)))}}n._version=0.1;n._globals=[t];n.people=n.people||[];n.params=n.params||[];m="track register unregister identify set_config people.delete people.create people.update people.create_property people.tag people.remove_Tag".split(" ");for (var i=0;i<m.length;i++)f(n,m[i])};
  window.nudgespot.init(window.nudgespot, this.options.apiKey);
  this.load(this.ready);
};

/**
 * Has the Nudgespot library been loaded yet?
 */

Nudgespot.prototype.loaded = function(){
  return (!! window.nudgespot) && (window.nudgespot.push !== Array.prototype.push);
};

/**
 * Identify a user.
 */

Nudgespot.prototype.identify = function(identify){
  if (!identify.userId()) return this.debug('user id required');
  var traits = identify.traits({ createdAt: 'created' });
  traits = alias(traits, { created: 'created_at' });
  window.nudgespot.identify(identify.userId(), traits);
};

/**
 * Track an event.
 */

Nudgespot.prototype.track = function(track){
  var properties = track.properties();
  window.nudgespot.track(track.event(), properties);
};
