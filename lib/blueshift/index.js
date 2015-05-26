
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var foldl = require('foldl');

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
  properties.customer_id = page.userId();
  properties.anonymousId = page.anonymousId();
  properties.category = page.category();
  properties.name = page.name();
  window.blueshift.pageload(removeBlankAttributes(properties));
};

/**
 * Trait Aliases.
 */
var traitAliases = {
  created: 'created_at',
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Blueshift.prototype.identify = function(identify){
  if (!identify.userId() && !identify.anonymousId()) {
    return this.debug('user id required');
  }
  var traits = identify.traits(traitAliases);
  traits._bsft_source = 'segment.com';
  traits.customer_id = identify.userId();
  traits.anonymousId = identify.anonymousId();
  window.blueshift.identify(removeBlankAttributes(traits));
};

/**
 * Track.
 *
 * @param {Track} track
 */

Blueshift.prototype.track = function(track){
  var properties = track.properties();
  properties._bsft_source = 'segment.com';
  properties.customer_id = track.userId();
  properties.anonymousId = track.anonymousId();
  window.blueshift.track(track.event(), removeBlankAttributes(properties));
};

/**
 * Alias.
 *
 * @param {Alias} alias
 */

Blueshift.prototype.alias = function(alias){
  window.blueshift.track('alias', removeBlankAttributes({
    _bsft_source: 'segment.com',
    customer_id: alias.userId(),
    previous_customer_id: alias.previousId(),
    anonymousId: alias.anonymousId()
  }));
};

/**
 * Returns new object with blank attributes removed
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function removeBlankAttributes(obj){
  return foldl(function(results, val, key){
    if (val !== null && val !== undefined) results[key] = val;
    return results;
  }, {}, obj);
}