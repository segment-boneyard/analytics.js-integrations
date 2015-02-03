
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var convertDates = require('convert-dates');
var push = require('global-queue')('_preactq');
var alias = require('alias');

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
 * @param {Object} page
 */

Preact.prototype.initialize = function(page){
  window._preactq = window._preactq || [];
  window._lnq = window._lnq || [];
  push('_setCode', this.options.projectCode);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Preact.prototype.loaded = function(){
  return !! (window._preactq && window._preactq.push !== Array.prototype.push);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Preact.prototype.identify = function(identify){
  if (!identify.userId()) return;
  var traits = identify.traits({ createdAt: 'created_at' });
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
 * @param {String} id
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Preact.prototype.group = function(group){
  if (!group.groupId()) return;
  push('_setAccount', group.traits());
};

/**
 * Track.
 *
 * @param {Track} track
 */

Preact.prototype.track = function(track){
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
 * @return {Number}
 */

function convertDate(date){
  return Math.floor(date / 1000);
}
