
/**
 * Module dependencies.
 */

var alias = require('alias');
var convertDates = require('convert-dates');
var Identify = require('facade').Identify;
var integration = require('analytics.js-integration');

/**
 * Expose `Customerio` integration.
 */

var Customerio = module.exports = integration('Customer.io')
  .global('_cio')
  .option('siteId', '')
  .tag('<script id="cio-tracker" src="https://assets.customer.io/assets/track.js" data-site-id="{{ siteId }}">');

/**
 * Initialize.
 *
 * http://customer.io/docs/api/javascript.html
 *
 * @param {Object} page
 */

Customerio.prototype.initialize = function(page){
  window._cio = window._cio || [];
  (function(){var a,b,c; a = function(f){return function(){window._cio.push([f].concat(Array.prototype.slice.call(arguments,0))); }; }; b = ['identify', 'track']; for (c = 0; c < b.length; c++) {window._cio[b[c]] = a(b[c]); } })();
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Customerio.prototype.loaded = function(){
  return (!! window._cio) && (window._cio.push !== Array.prototype.push);
};

/**
 * Identify.
 *
 * http://customer.io/docs/api/javascript.html#section-Identify_customers
 *
 * @param {Identify} identify
 */

Customerio.prototype.identify = function(identify){
  if (!identify.userId()) return this.debug('user id required');
  var traits = identify.traits({ createdAt: 'created' });
  traits = alias(traits, { created: 'created_at' });
  traits = convertDates(traits, convertDate);
  window._cio.identify(traits);
};

/**
 * Group.
 *
 * @param {Group} group
 */

Customerio.prototype.group = function(group){
  var traits = group.traits();
  var user = this.analytics.user();

  traits = alias(traits, function(trait){
    return 'Group ' + trait;
  });

  this.identify(new Identify({
    userId: user.id(),
    traits: traits
  }));
};

/**
 * Track.
 *
 * http://customer.io/docs/api/javascript.html#section-Track_a_custom_event
 *
 * @param {Track} track
 */

Customerio.prototype.track = function(track){
  var properties = track.properties();
  properties = convertDates(properties, convertDate);
  window._cio.track(track.event(), properties);
};

/**
 * Convert a date to the format Customer.io supports.
 *
 * @param {Date} date
 * @return {Number}
 */

function convertDate(date){
  return Math.floor(date.getTime() / 1000);
}
