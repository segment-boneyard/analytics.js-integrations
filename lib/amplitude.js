
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Amplitude);
};


/**
 * Expose `Amplitude` integration.
 */

var Amplitude = exports.Integration = integration('Amplitude')
  .assumesPageview()
  .readyOnInitialize()
  .global('amplitude')
  .option('apiKey', '')
  .option('trackAllPages', false)
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true);


/**
 * Initialize.
 *
 * https://github.com/amplitude/Amplitude-Javascript
 *
 * @param {Object} page
 */

Amplitude.prototype.initialize = function (page) {
  (function(e,t){var r=e.amplitude||{}; r._q=[];function i(e){r[e]=function(){r._q.push([e].concat(Array.prototype.slice.call(arguments,0)));};} var s=["init","logEvent","setUserId","setGlobalUserProperties","setVersionName"]; for(var c=0;c<s.length;c++){i(s[c]);}e.amplitude=r;})(window,document);
  window.amplitude.init(this.options.apiKey);
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Amplitude.prototype.loaded = function () {
  return !! (window.amplitude && window.amplitude.options);
};


/**
 * Load the Amplitude library.
 *
 * @param {Function} callback
 */

Amplitude.prototype.load = function (callback) {
  load('https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-1.0-min.js', callback);
};


/**
 * Page.
 *
 * @param {Page} page
 */

Amplitude.prototype.page = function (page) {
  var properties = page.properties();
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  // all pages
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // categorized pages
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named pages
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};


/**
 * Identify.
 *
 * @param {Facade} identify
 */

Amplitude.prototype.identify = function (identify) {
  var id = identify.userId();
  var traits = identify.traits();
  if (id) window.amplitude.setUserId(id);
  if (traits) window.amplitude.setGlobalUserProperties(traits);
};


/**
 * Track.
 *
 * @param {Track} event
 */

Amplitude.prototype.track = function (track) {
  var props = track.properties();
  var event = track.event();
  window.amplitude.logEvent(event, props);
};
