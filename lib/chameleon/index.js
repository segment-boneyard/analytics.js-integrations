
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var each = require('each');

/**
 * Expose `Chameleon` integration.
 */

var Chameleon = module.exports = integration('Chameleon')
  .assumesPageview()
  .readyOnInitialize()
  .readyOnLoad()
  .global('chmln')
  .option('accountId', null)
  .tag('<script src="//cdn.trychameleon.com/east/{{accountId}}.min.js"></script>');

/**
 * Initialize Chameleon.
 *
 * @api public
 */

Chameleon.prototype.initialize = function() {
  /* eslint-disable */
  (window.chmln={}),names='setup alias track set'.split(' ');for (var i=0;i<names.length;i++){(function(){var t=chmln[names[i]+'_a']=[];chmln[names[i]]=function(){t.push(arguments);};})() };
  /* eslint-enable */

  this.ready();
  this.load();
};

/**
 * Has the Chameleon library been loaded yet?
 *
 * @api private
 * @return {boolean}
 */

Chameleon.prototype.loaded = function() {
  return !!window.chmln;
};

/**
 * Identify a user.
 *
 * @api public
 * @param {Facade} identify
 */

Chameleon.prototype.identify = function(identify) {
  var options = identify.traits();

  options.uid = options.id || identify.userId() || identify.anonymousId();
  delete options.id;

  window.chmln.setup(options);
};

/**
 * Associate the current user with a group of users.
 *
 * @api public
 * @param {Facade} group
 */

Chameleon.prototype.group = function(group) {
  var options = {};

  each(group.traits(), function(key, value) {
    options['group:' + key] = value;
  });

  options['group:id'] = group.groupId();

  window.chmln.set(options);
};

/**
 * Track an event.
 *
 * @param {Facade} track
 */

Chameleon.prototype.track = function(track) {
  window.chmln.track(track.event(), track.properties());
};

/**
 * Change the user identifier after we know who they are.
 *
 * @param {Facade} alias
 */

Chameleon.prototype.alias = function(alias) {
  var fromId = alias.previousId() || alias.anonymousId();

  window.chmln.alias({ from: fromId, to: alias.userId() });
};
