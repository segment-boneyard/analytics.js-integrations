
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var convertDates = require('convert-dates');
var defaults = require('defaults');
var del = require('obj-case').del;
var isEmail = require('is-email');
var load = require('load-script');
var hash = require('string-hash');
var empty = require('is-empty');
var alias = require('alias');
var each = require('each');
var when = require('when');
var dot = require('obj-case');
var is = require('is');

/**
 * Expose `Intercom` integration.
 */

var Intercom = module.exports = integration('Intercom')
  .assumesPageview()
  .global('Intercom')
  .option('activator', '#IntercomDefaultWidget')
  .option('appId', '')
  .option('inbox', false)
  .tag('<script src="https://static.intercomcdn.com/intercom.v1.js">');

/**
 * Initialize.
 *
 * http://docs.intercom.io/
 * http://docs.intercom.io/#IntercomJS
 *
 * @param {Object} page
 */

Intercom.prototype.initialize = function(page){
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

Intercom.prototype.loaded = function(){
  return is.fn(window.Intercom);
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
  var email = identify.email();
  var name = identify.name();
  var id = identify.userId();
  var group = this.analytics.group();

  if (!id && !traits.email) return; // one is required

  traits.app_id = this.options.appId;

  // name
  if (name) traits.name = name;

  // handle dates
  if (identify.created()) {
    del(traits, 'created');
    del(traits, 'createdAt');
    traits.signed_up_at = identify.created();
  }
  if (identify.companyCreated()) {
    del(traits.company, 'created');
    del(traits.company, 'createdAt');
    traits.company.created_at = identify.companyCreated();
  }

  // convert dates
  traits = convertDates(traits, formatDate);

  var companies = dot(traits, 'companies');
  var company = dot(traits, 'company');

  if (is.object(company) || is.string(company)) traits.companies = formatCompany(company);

  del(traits, 'company');

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
  props = alias(props, { createdAt: 'created' });
  props = alias(props, { created: 'created_at' });
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

function formatDate(date) {
  return Math.floor(date / 1000);
};

/**
 * Formats a company for use with intercom
 *
 * http://docs.intercom.io/#Companies
 *
 * TODO: add .companies()
 *
 * @param {Object} company
 * @return {Object}
 * @api private
 */

function formatCompany(company){
  if (is.string(company)) return [{ name: company }];

  var ret = {};
  ret.name = company.name;
  del(company, 'name');

  if (company.id) {
    ret.company_id = company.id;
    del(company, 'id');
  }

  var created = dot(company, 'created_at');
  if (created) ret.remote_created_at = created;
  del(company, 'created');
  del(company, 'created_at');

  if (!is.empty(company)) ret.custom_attributes = company;

  return [ret];
};
