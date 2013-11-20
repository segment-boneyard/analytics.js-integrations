
var alias = require('alias');
var each = require('each');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_aaq');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Evergage);
};


/**
 * Expose `Evergage` integration.integration.
 */

var Evergage = exports.Integration = integration('Evergage')
  .assumesPageview()
  .readyOnInitialize()
  .global('_aaq')
  .option('account', '')
  .option('dataset', '');


/**
 * Initialize.
 *
 * @param {Object} page
 */

Evergage.prototype.initialize = function (page) {
  var account = this.options.account;
  var dataset = this.options.dataset;

  window._aaq = window._aaq || [];
  push('setEvergageAccount', account);
  push('setDataset', dataset);
  push('setUseSiteConfig', true);

  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Evergage.prototype.loaded = function () {
  return !! (window._aaq && window._aaq.push !== Array.prototype.push);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Evergage.prototype.load = function (callback) {
  var account = this.options.account;
  var dataset = this.options.dataset;
  var url = '//cdn.evergage.com/beacon/' + account + '/' + dataset + '/scripts/evergage.min.js';
  load(url, callback);
};


/**
 * Page.
 *
 * @param {String} category (optional)
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Evergage.prototype.page = function (category, name, properties, options) {
  each(properties, function(key, value) {
    push('setCustomField', key, value, 'page');
  });
  push('namePage', name);
  window.Evergage.init(true);
};

/**
 * Trait aliases.
 */

var traitAliases = {
  name: 'userName',
  email: 'userEmail'
};


/**
 * Identify.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

Evergage.prototype.identify = function (id, traits, options) {
  if (!id) return;
  push('setUser', id);

  traits = traits || {};
  traits = alias(traits, traitAliases);
  each(traits, function (key, value) {
    push('setUserField', key, value, 'page');
  });
};


/**
 * Group.
 *
 * @param {String} id
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Evergage.prototype.group = function (id, properties, options) {
  if (!id) return;
  push('setCompany', id);
  each(properties, function(key, value) {
    push('setAccountField', key, value, 'page');
  });
};


/**
 * Track.
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Evergage.prototype.track = function (event, properties, options) {
  push('trackAction', event, properties);
};