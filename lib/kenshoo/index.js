
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var indexof = require('indexof');
var is = require('is');

/**
 * Expose `Kenshoo` integration.
 */

var Kenshoo = module.exports = integration('Kenshoo')
  .global('k_trackevent')
  .option('cid', '')
  .option('subdomain', '')
  .option('events', [])
  .tag('<script src="//{{ subdomain }}.xg4ken.com/media/getpx.php?cid={{ cid }}">');

/**
 * Initialize.
 *
 * See https://gist.github.com/justinboyle/7875832
 *
 * @param {Object} page
 */

Kenshoo.prototype.initialize = function(page){
  this.load(this.ready);
};

/**
 * Loaded? (checks if the tracking function is set)
 *
 * @return {Boolean}
 */

Kenshoo.prototype.loaded = function(){
  return is.fn(window.k_trackevent);
};

/**
 * Track.
 *
 * Only tracks events if they are listed in the events array option.
 * We've asked for docs a few times but no go :/
 *
 * https://github.com/jorgegorka/the_tracker/blob/master/lib/the_tracker/trackers/kenshoo.rb
 *
 * @param {Track} event
 */

Kenshoo.prototype.track = function(track){
  var events = this.options.events;
  var traits = track.traits();
  var event = track.event();
  var revenue = track.revenue() || 0;
  if (!~indexof(events, event)) return;

  var params = [
    'id=' + this.options.cid,
    'type=conv',
    'val=' + revenue,
    'orderId=' + track.orderId(),
    'promoCode=' + track.coupon(),
    'valueCurrency=' + track.currency(),

    // Live tracking fields. Ignored for now (until we get documentation).
    'GCID=',
    'kw=',
    'product='
  ];

  window.k_trackevent(params, this.options.subdomain);
};
