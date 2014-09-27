
var integration = require('analytics.js-integration');
var push        = require('global-queue')('_attrq');

/**
 * Expose `Attribution IO` integration.
 */

var Attribution = module.exports = integration('Attribution')
  .global('_attrq')
  .option('projectId', '')
  .tag('library', '<script src="//scripts.attributionapp.com/attribution.js">');

/**
 * Initialize.
 *
 */

Attribution.prototype.initialize = function(){
  window._attrq = window._attrq || [];
  window.Attribution = window.Attribution || {};
  window.Attribution.projectId = this.options.projectId;
  this.load('library',this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Attribution.prototype.loaded = function(){
  return !!(window._attrq);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Attribution.prototype.page = function(page){
  this.track(page.track());
};

/**
 * Track.
 *
 * @param {Track} track
 */

Attribution.prototype.track = function(track) {
  var data = {
    properties: track.properties(),
    event:      track.event()
  }

  push('track', data);
}

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Attribution.prototype.identify = function(identify){
  var traits = identify.traits();
  var id = identify.userId();
  if (id) push('identify', { user_id: id,  traits: traits });
};
