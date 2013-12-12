
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_fxm');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(FoxMetrics);
};


/**
 * Expose `FoxMetrics` integration.
 */

var FoxMetrics = exports.Integration = integration('FoxMetrics')
  .assumesPageview()
  .readyOnInitialize()
  .global('_fxm')
  .option('appId', '');


/**
 * Initialize.
 *
 * http://foxmetrics.com/documentation/apijavascript
 *
 * @param {Object} page
 */

FoxMetrics.prototype.initialize = function (page) {
  window._fxm = window._fxm || [];
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

FoxMetrics.prototype.loaded = function () {
  return !! (window._fxm && window._fxm.appId);
};


/**
 * Load the FoxMetrics library.
 *
 * @param {Function} callback
 */

FoxMetrics.prototype.load = function (callback) {
  var id = this.options.appId;
  load('//d35tca7vmefkrc.cloudfront.net/scripts/' + id + '.js', callback);
};


/**
 * Page.
 *
 * @param {Page} page
 */

FoxMetrics.prototype.page = function (page) {
  var properties = page.proxy('properties');
  var category = page.category();
  var name = page.name();
  this._category = category; // store for later

  push(
    '_fxm.pages.view',
    properties.title,   // title
    name,               // name
    category,           // category
    properties.url,     // url
    properties.referrer // referrer
  );
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

FoxMetrics.prototype.identify = function (identify) {
  var id = identify.userId();

  if (!id) return;

  push(
    '_fxm.visitor.profile',
    id,                    // user id
    identify.firstName(), // first name
    identify.lastName(),  // last name
    identify.email(),     // email
    identify.address(),   // address
    undefined,            // social
    undefined,            // partners
    identify.traits()     // attributes
  );
};


/**
 * Track.
 *
 * @param {Track} track
 */

FoxMetrics.prototype.track = function (track) {
  var props = track.properties();
  var category = this._category || props.category;
  push(track.event(), category, props);
};
