/**
 * Module dependencies.
 */
var integration = require('analytics.js-integration');

/**
 * Expose `Blueshift` integration.
 */

var Blueshift = module.exports = integration('Blueshift')
  .global('blueshift')
  .global('_blueshiftid')
  .option('apiKey', '')
  .option('retarget', false)
  .tag('<script src="https://cdn.getblueshift.com/blueshift.js">');

/**
 * Initialize.
 *
 * Documentation: http://getblueshift.com/documentation
 *
 * @param {Object} page
 */

Blueshift.prototype.initialize = function(page){
  window.blueshift=window.blueshift||[];
  // jscs:disable
  window.blueshift.load=function(a){window._blueshiftid=a;var d=function(a){return function(){blueshift.push([a].concat(Array.prototype.slice.call(arguments,0)))}},e=["identify","track","click", "pageload", "capture", "retarget"];for(var f=0;f<e.length;f++)blueshift[e[f]]=d(e[f])};
  // jscs:enable
  window.blueshift.load(this.options.apiKey);

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Blueshift.prototype.loaded = function(){
  return !! (window.blueshift && window._blueshiftid);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Blueshift.prototype.page = function(page){
  if (this.options.retarget) window.blueshift.retarget();
  var properties = page.properties();
  properties._bsft_source = 'segment.com';
  window.blueshift.pageload(properties);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Blueshift.prototype.identify = function(identify){
  if (!identify.userId()) return this.debug('user id required');
  var traits = identify.traits({ created: 'created_at' });
  traits._bsft_source = 'segment.com';
  window.blueshift.identify(traits);
};

/**
 * Group.
 *
 * @param {Group} group
 */

Blueshift.prototype.group = function(group){
  var traits = group.traits({ created: 'created_at' });
  traits._bsft_source = 'segment.com';
  window.blueshift.track('group', traits);
};

/**
 * Track.
 *
 * @param {Track} track
 */

Blueshift.prototype.track = function(track){
  var properties = track.properties();
  properties._bsft_source = 'segment.com';
  window.blueshift.track(track.event(), properties);
};
