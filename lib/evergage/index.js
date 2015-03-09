
/**
 * Module dependencies.
 */

var each = require('each');
var integration = require('analytics.js-integration');
var push = require('global-queue')('_aaq');

/**
 * Expose `Evergage` integration.integration.
 */

var Evergage = module.exports = integration('Evergage')
  .assumesPageview()
  .global('_aaq')
  .option('account', '')
  .option('dataset', '')
  .tag('<script src="//cdn.evergage.com/beacon/{{ account }}/{{ dataset }}/scripts/evergage.min.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Evergage.prototype.initialize = function(page){
  var account = this.options.account;
  var dataset = this.options.dataset;

  window._aaq = window._aaq || [];
  push('setEvergageAccount', account);
  push('setDataset', dataset);
  push('setUseSiteConfig', true);

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Evergage.prototype.loaded = function(){
  return !! (window._aaq && window._aaq.push !== Array.prototype.push);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Evergage.prototype.page = function(page){
  var props = page.properties();
  var name = page.name();
  if (name) push('namePage', name);

  each(props, function(key, value){
    push('setCustomField', key, value, 'page');
  });

  window.Evergage.init(true);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Evergage.prototype.identify = function(identify){
  var id = identify.userId();
  if (!id) return;

  push('setUser', id);

  var traits = identify.traits({
    email: 'userEmail',
    name: 'userName'
  });

  each(traits, function(key, value){
    push('setUserField', key, value, 'page');
  });
};

/**
 * Group.
 *
 * @param {Group} group
 */

Evergage.prototype.group = function(group){
  var props = group.traits();
  var id = group.groupId();
  if (!id) return;

  push('setCompany', id);
  each(props, function(key, value){
    push('setAccountField', key, value, 'page');
  });
};

/**
 * Track.
 *
 * @param {Track} track
 */

Evergage.prototype.track = function(track){
  push('trackAction', track.event(), track.properties());
};
