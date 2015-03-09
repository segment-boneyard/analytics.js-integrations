
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var each = require('each');

/**
 * Expose `Awesm` integration.
 */

var Awesm = module.exports = integration('awe.sm')
  .assumesPageview()
  .global('AWESM')
  .option('apiKey', '')
  .tag('<script src="//widgets.awe.sm/v3/widgets.js?key={{ apiKey }}&async=true">')
  .mapping('events');

/**
 * Initialize.
 *
 * http://developers.awe.sm/guides/javascript/
 *
 * @param {Object} page
 */

Awesm.prototype.initialize = function(page){
  window.AWESM = { api_key: this.options.apiKey };
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Awesm.prototype.loaded = function(){
  return !! (window.AWESM && window.AWESM._exists);
};

/**
 * Track.
 *
 * @param {Track} track
 */

Awesm.prototype.track = function(track){
  var user = this.analytics.user();
  var goals = this.events(track.event());
  each(goals, function(goal){
    window.AWESM.convert(goal, track.cents(), null, user.id());
  });
};
