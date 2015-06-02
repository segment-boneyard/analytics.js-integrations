
/**
 * Module dependencies.
 */

var convertDates = require('convert-dates');
var integration = require('analytics.js-integration');
var push = require('global-queue')('_preactq');

/**
 * Expose `Preact` integration.
 */

var Preact = module.exports = integration('Preact')
  .assumesPageview()
  .global('_preactq')
  .global('_lnq')
  .option('projectCode', '')
  .tag('<script src="//d2bbvl6dq48fa6.cloudfront.net/js/preact-4.1.min.js">');

/**
 * Initialize.
 *
 * http://www.preact.io/api/javascript
 *
 * @api public
 * @param {Object} page
 */

Preact.prototype.initialize = function() {
  window._preactq = window._preactq || [];
  window._lnq = window._lnq || [];
  push('_setCode', this.options.projectCode);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Preact.prototype.loaded = function() {
  return !!(window._preactq && window._preactq.push !== Array.prototype.push);
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Preact.prototype.identify = function(identify) {
  if (!identify.userId()) return;
  var traits = identify.traits({ created: 'created_at' });
  traits = convertDates(traits, convertDate);
  push('_setPersonData', {
    name: identify.name(),
    email: identify.email(),
    uid: identify.userId(),
    properties: traits
  });
};

/**
 * Group.
 *
 * @api public
 * @param {Group} group
 */

Preact.prototype.group = function(group) {
  if (!group.groupId()) return;
  push('_setAccount', group.traits());
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Preact.prototype.track = function(track) {
  var props = track.properties();
  var revenue = track.revenue();
  var event = track.event();
  var special = { name: event };

  if (revenue) {
    special.revenue = revenue * 100;
    delete props.revenue;
  }

  if (props.note) {
    special.note = props.note;
    delete props.note;
  }

  push('_logEvent', special, props);
};

/**
 * Convert a `date` to a format Preact supports.
 *
 * @param {Date} date
 * @return {number}
 */

function convertDate(date) {
  return Math.floor(date / 1000);
}
