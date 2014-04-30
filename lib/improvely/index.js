
var alias = require('alias');
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Improvely);
};

/**
 * Expose `Improvely` integration.
 */

var Improvely = exports.Integration = integration('Improvely')
  .assumesPageview()
  .readyOnInitialize()
  .global('_improvely')
  .global('improvely')
  .option('domain', '')
  .option('projectId', null);

/**
 * Initialize.
 *
 * http://www.improvely.com/docs/landing-page-code
 *
 * @param {Object} page
 */

Improvely.prototype.initialize = function(page){
  window._improvely = [];
  window.improvely = { init: function(e, t){ window._improvely.push(["init", e, t]); }, goal: function(e){ window._improvely.push(["goal", e]); }, label: function(e){ window._improvely.push(["label", e]); }};

  var domain = this.options.domain;
  var id = this.options.projectId;
  window.improvely.init(domain, id);
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Improvely.prototype.loaded = function(){
  return !! (window.improvely && window.improvely.identify);
};

/**
 * Load the Improvely library.
 *
 * @param {Function} callback
 */

Improvely.prototype.load = function(callback){
  var domain = this.options.domain;
  load('//' + domain + '.iljmp.com/improvely.js', callback);
};

/**
 * Identify.
 *
 * http://www.improvely.com/docs/labeling-visitors
 *
 * @param {Identify} identify
 */

Improvely.prototype.identify = function(identify){
  var id = identify.userId();
  if (id) window.improvely.label(id);
};

/**
 * Track.
 *
 * http://www.improvely.com/docs/conversion-code
 *
 * @param {Track} track
 */

Improvely.prototype.track = function(track){
  var props = track.properties({ revenue: 'amount' });
  props.type = track.event();
  window.improvely.goal(props);
};
