
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var convertDates = require('convert-dates');
var defaults = require('defaults');
var load = require('load-script');
var alias = require('alias');
var callback = require('callback');
var when = require('when');

/**
 * Expose `Retained` integration.
 */

var Retained = module.exports = integration('Retained')
  .assumesPageview()
  .readyOnLoad()
  .global('Retained')
  .option('appKey', '')
  .tag('<script id="cio-tracker" src="https://dou1p8vq0ghfr.cloudfront.net/retained.js">');;

/**
 * Initialize.
 *
 * http://getretained.com/docs/api/javascipt.html
 *
 * @param {Object} page
 */

Retained.prototype.initialize = function(page){
  var self = this;
  this.load(function(){
    when(function(){ return self.loaded(); }, self.ready);
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Retained.prototype.loaded = function(){
  return !! (window.Retained && window.Retained.pageHasLoaded);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Retained.prototype.identify = function(identify){
  var traits = identify.traits({ userId: 'user_id' });
  var specific = identify.options(this.name);
  var created = identify.created();
  var email = identify.email();

  if (!traits.email) return this.debug('user id required'); // An email address is required

  traits.app_ckey = this.options.appKey;

  // Person Hash
  if (specific.userHash) traits.person_hash = specific.userHash;
  if (specific.user_hash) traits.person_hash = specific.user_hash;
  if (specific.personHash) traits.person_hash = specific.personHash;
  if (specific.person_hash) traits.person_hash = specific.person_hash;

  // Created At
  if (created) traits.created = created;

  // Date Conversion
  traits = convertDates(traits, formatDate);
  traits = alias(traits, { created: 'created_at'});

  // Plan
  if (specific.plan) traits.plan_id = specific.plan
  if (specific.plan_id) traits.plan_id = specific.plan_id

  // Handle Custom Fields
  if (specific.custom_fields) traits.custom_fields = specific.custom_fields;
  if (specific.customFields) traits.custom_fields = specific.customFields;
  
  window.Retained.identify(traits);
};

/**
 * Track.
 *
 * @param {Track} track
 */

// TODO: Expand Retained Event Tracking
// Retained.prototype.track = function(track){
//   window.Retained.track(track.event(), track.properties());
// };

/**
 * Formatting for Retained date support.
 *
 * @param {Date} date
 * @return {Number}
 */

function formatDate(date) {
  return Math.floor(date / 1000);
}
