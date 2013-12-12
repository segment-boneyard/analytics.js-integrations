
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_qevents', { wrap: false });


/**
 * User reference.
 */

var user;


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Quantcast);
  user = analytics.user(); // store for later
};


/**
 * Expose `Quantcast` integration.
 */

var Quantcast = exports.Integration = integration('Quantcast')
  .assumesPageview()
  .readyOnInitialize()
  .global('_qevents')
  .global('__qc')
  .option('pCode', null)
  .option('labelPages', false);


/**
 * Initialize.
 *
 * https://www.quantcast.com/learning-center/guides/using-the-quantcast-asynchronous-tag/
 * https://www.quantcast.com/help/cross-platform-audience-measurement-guide/
 *
 * @param {Object} page
 */

Quantcast.prototype.initialize = function (page) {
  page = page || {};
  window._qevents = window._qevents || [];

  var opts = this.options;
  var settings = { qacct: opts.pCode };
  if (user.id()) settings.uid = user.id();
  push(settings);

  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Quantcast.prototype.loaded = function () {
  return !! window.__qc;
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Quantcast.prototype.load = function (callback) {
  load({
    http: 'http://edge.quantserve.com/quant.js',
    https: 'https://secure.quantserve.com/quant.js'
  }, callback);
};


/**
 * Page.
 *
 * https://cloudup.com/cBRRFAfq6mf
 *
 * @param {Page} page
 */

Quantcast.prototype.page = function (page) {
  var settings = {
    event: 'refresh',
    qacct: this.options.pCode,
  };
  if (user.id()) settings.uid = user.id();
  push(settings);
};


/**
 * Identify.
 *
 * https://www.quantcast.com/help/cross-platform-audience-measurement-guide/
 *
 * @param {String} id (optional)
 */

Quantcast.prototype.identify = function (identify) {
  // edit the initial quantcast settings
  var id = identify.userId();
  if (id) window._qevents[0].uid = id;
};


/**
 * Track.
 *
 * https://cloudup.com/cBRRFAfq6mf
 *
 * @param {Track} track
 */

Quantcast.prototype.track = function (track) {
  var settings = {
    event: 'click',
    qacct: this.options.pCode
  };
  if (user.id()) settings.uid = user.id();
  push(settings);
};
