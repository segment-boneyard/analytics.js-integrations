
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('optimizely');
var callback = require('callback');
var tick = require('next-tick');
var bind = require('bind');
var each = require('each');
var isEmpty = require('is-empty');
var foldl = require('foldl');

/**
 * Expose `Optimizely` integration.
 */

var Optimizely = module.exports = integration('Optimizely')
  .option('variations', true)
  .option('listen', false)
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true);

/**
 * The name and version for this integration.
 */

var integration = {
  name: 'optimizely',
  version: '1.0.0'
};

/**
 * Initialize.
 *
 * https://www.optimizely.com/docs/api#function-calls
 */

Optimizely.prototype.initialize = function(){
  var self = this;
  if (this.options.variations) {
    tick(function(){
      self.replay();
    });
  }
  if (this.options.listen) {
    tick(function(){
      self.roots();
    });
  }
  this.ready();
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
 * Send experiment data as track events to Segment
 *
 * https://www.optimizely.com/docs/api#data-object
 */

Optimizely.prototype.roots = function(){
  if (!window.optimizely) return; // in case the snippet isnt on the page

  var data = window.optimizely.data;
  if (!data) return;
  var allExperiments = data.experiments;
  if (!data || !data.state || !allExperiments) return;
  var variationNamesMap = data.state.variationNamesMap;
  var variationIdsMap = data.state.variationIdsMap;
  var activeExperimentIds = data.state.activeExperiments;
  var activeExperiments = getExperiments(activeExperimentIds, variationNamesMap,
    variationIdsMap, allExperiments);
  var self = this;

  each(activeExperiments, function(props){
    self.analytics.track(
      'Experiment Viewed',
      props,
      { context: { integration: integration } }
    );
  });
};

/**
 * Retrieves active experiments
 *
 * @param {Object} state
 * @param {Object} allExperiments
 */

function getExperiments(activeExperimentIds, variationNamesMap, variationIdsMap,
  allExperiments) {

  return foldl(function(results, experimentId){
    var experiment = allExperiments[experimentId];
    if (experiment) {
      results.push({
        variationName: variationNamesMap[experimentId],
        variationId: variationIdsMap[experimentId],
        experimentId: experimentId,
        experimentName: experiment.name
      });
    }
    return results;
  }, [], activeExperimentIds);
};

/**
 * Replay experiment data as traits to other enabled providers.
 *
 * https://www.optimizely.com/docs/api#data-object
 */

Optimizely.prototype.replay = function(){
  if (!window.optimizely) return; // in case the snippet isnt on the page

  var data = window.optimizely.data;
  if (!data || !data.experiments || !data.state) return;

  var experiments = data.experiments;
  var map = data.state.variationNamesMap;
  var traits = {};

  each(map, function(experimentId, variation){
    var experiment = experiments[experimentId].name;
    traits['Experiment: ' + experiment] = variation;
  });

  this.analytics.identify(traits);
};
