
/**
 * Module dependencies.
 */

var bind = require('bind');
var integration = require('analytics.js-integration');
var is = require('is');
var when = require('when');

/**
 * Expose `Mojn`
 */

var Mojn = module.exports = integration('Mojn')
  .global('_mojnTrack')
  .option('customerCode', '')
  .tag('<script src="https://track.idtargeting.com/{{ customerCode }}/track.js">');

/**
 * Initialize.
 *
 * @api public
 * @param {Object} page
 */

Mojn.prototype.initialize = function(){
  window._mojnTrack = window._mojnTrack || [];
  window._mojnTrack.push({ cid: this.options.customerCode });
  var loaded = bind(this, this.loaded);
  var ready = this.ready;
  this.load(function(){
    when(loaded, ready);
  });
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Mojn.prototype.loaded = function(){
  return is.object(window._mojnTrack);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 * @return {Element|undefined}
 */

Mojn.prototype.identify = function(identify){
  var email = identify.email();
  if (!email) return;
  // TODO: Replace with a tag?
  var img = new Image();
  img.src = '//matcher.idtargeting.com/identify.gif?cid=' + this.options.customerCode + '&_mjnctid=' + email;
  img.width = 1;
  img.height = 1;
  // FIXME: Why does this have a return value?
  return img;
};

/**
 * Track.
 *
 * @api public
 * @param {Track} event
 * @return {string}
 */

Mojn.prototype.track = function(track){
  var properties = track.properties();
  var revenue = properties.revenue;
  if (!revenue) return;
  var currency = properties.currency || '';
  var conv = currency + revenue;
  window._mojnTrack.push({ conv: conv });
  // FIXME: Why does this have a return value?
  return conv;
};
