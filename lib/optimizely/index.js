
/**
 * Module dependencies.
 */

var each = require('each');
var foldl = require('foldl');
var integration = require('analytics.js-integration');
var push = require('global-queue')('optimizely');
var tick = require('next-tick');

/**
 * Expose `Optimizely` integration.
 */

var Optimizely = module.exports = integration('Optimizely')
  .option('listen', false)
  .option('trackCategorizedPages', true)
  .option('trackNamedPages', true)
  .option('variations', true);

/**
 * The name and version for this integration.
 */

var integrationContext = {
  name: 'optimizely',
  version: '1.0.0'
};

/**
 * Initialize.
 *
 * https://www.optimizely.com/docs/api#function-calls
 *
 * @api public
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
 * @api public
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
 * @api public
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
 *
 * @api private
 */

Optimizely.prototype.roots = function(){
  // In case the snippet isn't on the page
  //
  // FIXME: Under what conditions does this happen? Sounds like we should fix
  // our #loaded method?
  if (!window.optimizely) return;

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
      { context: { integration: integrationContext } }
    );
  });
};

/**
 * Replay experiment data as traits to other enabled providers.
 *
 * https://www.optimizely.com/docs/api#data-object
 *
 * @api private
 */

Optimizely.prototype.replay = function(){
  // In case the snippet isn't on the page
  //
  // FIXME: Under what conditions does this happen? Sounds like we should fix
  // our #loaded method?
  if (!window.optimizely) return;

  var data = window.optimizely.data;
  if (!data || !data.experiments || !data.state) return;

  var traits = foldl(function(traits, variation, experimentId){
    var experiment = data.experiments[experimentId].name;
    traits['Experiment: ' + experiment] = variation;
    return traits;
  }, {}, data.state.variationNamesMap);

  this.analytics.identify(traits);
};

/**
 * Retrieves active experiments.
 *
 * @api private
 * @param {Object} state
 * @param {Object} allExperiments
 */

// FIXME: This should accept an options object rather than all these parameters
function getExperiments(activeExperimentIds, variationNamesMap, variationIdsMap, allExperiments){
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
}
