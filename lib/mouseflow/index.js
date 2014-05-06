
var push = require('global-queue')('_mfq');
var integration = require('integration');
var load = require('load-script');
var each = require('each');

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Mouseflow);
};

/**
 * Expose `Mouseflow`
 */

var Mouseflow = exports.Integration = integration('Mouseflow')
  .assumesPageview()
  .readyOnLoad()
  .global('mouseflow')
  .global('_mfq')
  .option('apiKey', '')
  .option('mouseflowHtmlDelay', 0);

/**
 * Iniitalize
 *
 * @param {Object} page
 */

Mouseflow.prototype.initialize = function(page){
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Mouseflow.prototype.loaded = function(){
  return !! (window._mfq && [].push != window._mfq.push);
};

/**
 * Load mouseflow.
 *
 * @param {Function} fn
 */

Mouseflow.prototype.load = function(fn){
  var apiKey = this.options.apiKey;
  window.mouseflowHtmlDelay = this.options.mouseflowHtmlDelay;
  load('//cdn.mouseflow.com/projects/' + apiKey + '.js', fn);
};

/**
 * Page.
 *
 * //mouseflow.zendesk.com/entries/22528817-Single-page-websites
 *
 * @param {Page} page
 */

Mouseflow.prototype.page = function(page){
  if (!window.mouseflow) return;
  if ('function' != typeof mouseflow.newPageView) return;
  mouseflow.newPageView();
};

/**
 * Identify.
 *
 * //mouseflow.zendesk.com/entries/24643603-Custom-Variables-Tagging
 *
 * @param {Identify} identify
 */

Mouseflow.prototype.identify = function(identify){
  set(identify.traits());
};

/**
 * Track.
 *
 * //mouseflow.zendesk.com/entries/24643603-Custom-Variables-Tagging
 *
 * @param {Track} track
 */

Mouseflow.prototype.track = function(track){
  var props = track.properties();
  props.event = track.event();
  set(props);
};

/**
 * Push the given `hash`.
 *
 * @param {Object} hash
 */

function set(hash){
  each(hash, function(k, v){
    push('setVariable', k, v);
  });
}
