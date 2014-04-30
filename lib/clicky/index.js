
var Identify = require('facade').Identify;
var extend = require('extend');
var integration = require('integration');
var is = require('is');
var load = require('load-script');

/**
 * User reference.
 */

var user;

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Clicky);
  user = analytics.user(); // store for later
};

/**
 * Expose `Clicky` integration.
 */

var Clicky = exports.Integration = integration('Clicky')
  .assumesPageview()
  .readyOnLoad()
  .global('clicky')
  .global('clicky_site_ids')
  .global('clicky_custom')
  .option('siteId', null);

/**
 * Initialize.
 *
 * http://clicky.com/help/customization
 *
 * @param {Object} page
 */

Clicky.prototype.initialize = function(page){
  window.clicky_site_ids = window.clicky_site_ids || [this.options.siteId];
  this.identify(new Identify({
    userId: user.id(),
    traits: user.traits()
  }));
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Clicky.prototype.loaded = function(){
  return is.object(window.clicky);
};

/**
 * Load the Clicky library.
 *
 * @param {Function} callback
 */

Clicky.prototype.load = function(callback){
  load('//static.getclicky.com/js', callback);
};

/**
 * Page.
 *
 * http://clicky.com/help/customization#/help/custom/manual
 *
 * @param {Page} page
 */

Clicky.prototype.page = function(page){
  var properties = page.properties();
  var category = page.category();
  var name = page.fullName();
  window.clicky.log(properties.path, name || properties.title);
};

/**
 * Identify.
 *
 * @param {Identify} id (optional)
 */

Clicky.prototype.identify = function(identify){
  window.clicky_custom = window.clicky_custom || {};
  window.clicky_custom.session = window.clicky_custom.session || {};
  extend(window.clicky_custom.session, identify.traits());
};

/**
 * Track.
 *
 * http://clicky.com/help/customization#/help/custom/manual
 *
 * @param {Track} event
 */

Clicky.prototype.track = function(track){
  window.clicky.goal(track.event(), track.revenue());
};
