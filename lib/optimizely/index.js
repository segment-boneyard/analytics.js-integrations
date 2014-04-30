
var bind = require('bind');
var callback = require('callback');
var each = require('each');
var integration = require('integration');
var push = require('global-queue')('optimizely');
var tick = require('next-tick');

/**
 * Analytics reference.
 */

var analytics;

/**
 * Expose plugin.
 */

module.exports = exports = function(ajs){
  ajs.addIntegration(Optimizely);
  analytics = ajs; // store for later
};

/**
 * Expose `Optimizely` integration.
 */

var Optimizely = exports.Integration = integration('Optimizely')
  .readyOnInitialize()
  .option('variations', true)
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true);

/**
 * Initialize.
 *
 * https://www.optimizely.com/docs/api#function-calls
 */

Optimizely.prototype.initialize = function(){
  if (this.options.variations) tick(this.replay);
};

/**
 * Track.
 *
 * https://www.optimizely.com/docs/api#track-event
 *
 * @param {Track} track
 */

Optimizely.prototype.track = function(track){
  var props = track.properties();
  if (props.revenue) props.revenue *= 100;
  push('trackEvent', track.event(), props);
};

/**
 * Page.
 *
 * https://www.optimizely.com/docs/api#track-event
 *
 * @param {Page} page
 */

Optimizely.prototype.page = function(page){
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  // categorized pages
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named pages
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};

/**
 * Replay experiment data as traits to other enabled providers.
 *
 * https://www.optimizely.com/docs/api#data-object
 */

Optimizely.prototype.replay = function(){
  if (!window.optimizely) return; // in case the snippet isnt on the page

  var data = window.optimizely.data;
  if (!data) return;

  var experiments = data.experiments;
  var map = data.state.variationNamesMap;
  var traits = {};

  each(map, function(experimentId, variation){
    var experiment = experiments[experimentId].name;
    traits['Experiment: ' + experiment] = variation;
  });

  analytics.identify(traits);
};
