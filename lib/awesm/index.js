
var integration = require('integration');
var load = require('load-script');

/**
 * User reference.
 */

var user;

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Awesm);
  user = analytics.user(); // store for later
};

/**
 * Expose `Awesm` integration.
 */

var Awesm = exports.Integration = integration('awe.sm')
  .assumesPageview()
  .readyOnLoad()
  .global('AWESM')
  .option('apiKey', '')
  .option('events', {});

/**
 * Initialize.
 *
 * http://developers.awe.sm/guides/javascript/
 *
 * @param {Object} page
 */

Awesm.prototype.initialize = function(page){
  window.AWESM = { api_key: this.options.apiKey };
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Awesm.prototype.loaded = function(){
  return !! window.AWESM._exists;
};

/**
 * Load.
 *
 * @param {Function} callback
 */

Awesm.prototype.load = function(callback){
  var key = this.options.apiKey;
  load('//widgets.awe.sm/v3/widgets.js?key=' + key + '&async=true', callback);
};

/**
 * Track.
 *
 * @param {Track} track
 */

Awesm.prototype.track = function(track){
  var event = track.event();
  var goal = this.options.events[event];
  if (!goal) return;
  window.AWESM.convert(goal, track.cents(), null, user.id());
};
