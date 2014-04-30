
var alias = require('alias');
var convertDates = require('convert-dates');
var integration = require('integration');
var each = require('each');
var is = require('is');
var isEmail = require('is-email');
var load = require('load-script');
var defaults = require('defaults');
var empty = require('is-empty');

/**
 * Group ref.
 */

var group;

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Intercom);
  group = analytics.group();
};

/**
 * Expose `Intercom` integration.
 */

var Intercom = exports.Integration = integration('Intercom')
  .assumesPageview()
  .readyOnLoad()
  .global('Intercom')
  .option('activator', '#IntercomDefaultWidget')
  .option('appId', '')
  .option('inbox', false);

/**
 * Initialize.
 *
 * http://docs.intercom.io/
 * http://docs.intercom.io/#IntercomJS
 *
 * @param {Object} page
 */

Intercom.prototype.initialize = function(page){
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Intercom.prototype.loaded = function(){
  return is.fn(window.Intercom);
};

/**
 * Load the Intercom library.
 *
 * @param {Function} callback
 */

Intercom.prototype.load = function(callback){
  load('https://static.intercomcdn.com/intercom.v1.js', callback);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Intercom.prototype.page = function(page){
  window.Intercom('update');
};

/**
 * Identify.
 *
 * http://docs.intercom.io/#IntercomJS
 *
 * @param {Identify} identify
 */

Intercom.prototype.identify = function(identify){
  var traits = identify.traits({ userId: 'user_id' });
  var activator = this.options.activator;
  var opts = identify.options(this.name);
  var companyCreated = identify.companyCreated();
  var created = identify.created();
  var email = identify.email();
  var name = identify.name();
  var id = identify.userId();

  if (!id && !traits.email) return; // one is required

  traits.app_id = this.options.appId;

  // Make sure company traits are carried over (fixes #120).
  if (!empty(group.traits())) {
    traits.company = traits.company || {};
    defaults(traits.company, group.traits());
  }

  // name
  if (name) traits.name = name;

  // handle dates
  if (companyCreated) traits.company.created = companyCreated;
  if (created) traits.created = created;

  // convert dates
  traits = convertDates(traits, formatDate);
  traits = alias(traits, { created: 'created_at' });

  // company
  if (traits.company) {
    traits.company = alias(traits.company, { created: 'created_at' });
  }

  // handle options
  if (opts.increments) traits.increments = opts.increments;
  if (opts.userHash) traits.user_hash = opts.userHash;
  if (opts.user_hash) traits.user_hash = opts.user_hash;

  // Intercom, will force the widget to appear
  // if the selector is #IntercomDefaultWidget
  // so no need to check inbox, just need to check
  // that the selector isn't #IntercomDefaultWidget.
  if ('#IntercomDefaultWidget' != activator) {
    traits.widget = { activator: activator };
  }

  var method = this._id !== id ? 'boot': 'update';
  this._id = id; // cache for next time

  window.Intercom(method, traits);
};

/**
 * Group.
 *
 * @param {Group} group
 */

Intercom.prototype.group = function(group){
  var props = group.properties();
  var id = group.groupId();
  if (id) props.id = id;
  window.Intercom('update', { company: props });
};

/**
 * Track.
 *
 * @param {Track} track
 */

Intercom.prototype.track = function(track){
  window.Intercom('trackEvent', track.event(), track.properties());
};

/**
 * Format a date to Intercom's liking.
 *
 * @param {Date} date
 * @return {Number}
 */

function formatDate(date){
  return Math.floor(date / 1000);
}
