/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var convertDates = require('convert-dates');
var defaults = require('defaults');
var del = require('obj-case').del;
var isEmail = require('is-email');
var load = require('load-script');
var empty = require('is-empty');
var alias = require('alias');
var each = require('each');
var is = require('is');

/**
 * Expose `Intercom` integration.
 */

var Intercom = module.exports = integration('Intercom')
  .global('Intercom')
  .option('activator', '#IntercomDefaultWidget')
  .option('appId', '')
  .tag('<script src="https://widget.intercom.io/widget/{{ appId }}">');

/**
 * Initialize.
 *
 * http://docs.intercom.io/
 * http://docs.intercom.io/#IntercomJS
 *
 * @param {Object} page
 */

Intercom.prototype.initialize = function(page){
  initialize();
  this.load(this.ready);
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
 * Page.
 *
 * @param {Page} page
 */

Intercom.prototype.page = function(){
  this.bootOrUpdate();
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
  var opts = identify.options(this.name);
  var companyCreated = identify.companyCreated();
  var created = identify.created();
  var email = identify.email();
  var name = identify.name();
  var id = identify.userId();
  var group = this.analytics.group();

  // handle user_hash
  if (opts.userHash) traits.user_hash = opts.userHash;
  if (opts.user_hash) traits.user_hash = opts.user_hash;

  if ((!id && !traits.email) || !traits.user_hash) {
    return;
  }

  // intercom requires `company` to be an object. default it with group traits
  // so that we guarantee an `id` is there, since they require it
  if (traits.company !== null && !is.object(traits.company)) {
    delete traits.company;
  }

  if (traits.company) {
    defaults(traits.company, group.traits());
  }

  // name
  if (name) traits.name = name;

  // handle dates
  if (created) {
    del(traits, 'created');
    del(traits, 'createdAt');
    traits.created_at = created;
  }

  if (companyCreated) {
    del(traits.company, 'created');
    del(traits.company, 'createdAt');
    traits.company.created_at = companyCreated;
  }

  // convert dates
  traits = convertDates(traits, formatDate);

  // handle options
  if (opts.increments) traits.increments = opts.increments;

  this.bootOrUpdate(traits);
};

/**
 * Group.
 *
 * @param {Group} group
 */

Intercom.prototype.group = function(group){
  var props = group.properties();
  props = alias(props, { createdAt: 'created' });
  props = alias(props, { created: 'created_at' });
  var id = group.groupId();
  if (id) props.id = id;
  api('update', { company: props });
};

/**
 * Track.
 *
 * @param {Track} track
 */

Intercom.prototype.track = function(track){
  api('trackEvent', track.event(), track.properties());
};

/**
 * Boots or updates, as appropriate.
 *
 * @param {Object} options
 */

Intercom.prototype.bootOrUpdate = function(options){
  options = options || {};
  var method = this.booted === true ? 'update' : 'boot';
  var activator = this.options.activator;
  options.app_id = this.options.appId;

  // Intercom, will force the widget to appear
  // if the selector is #IntercomDefaultWidget
  // so no need to check inbox, just need to check
  // that the selector isn't #IntercomDefaultWidget.
  if (activator !== '#IntercomDefaultWidget') {
    options.widget = { activator: activator };
  }

  api(method, options);
  this.booted = true;
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

/**
 * Initialize the Intercom call queue.
 */

function initialize(){
  window.Intercom = function(){
    window.Intercom.q.push(arguments);
  };
  window.Intercom.q = [];
}

/**
 * Push a call onto the queue.
 */

function api(){
  window.Intercom.apply(window.Intercom, arguments);
}
