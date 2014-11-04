
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var utm = require('utm-params');
var top = require('top-domain');

/**
 * Expose `Amplitude` integration.
 */

var Amplitude = module.exports = integration('Amplitude')
  .global('amplitude')
  .option('apiKey', '')
  .option('trackAllPages', false)
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true)
  .tag('<script src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-1.3-min.js">');

/**
 * Initialize.
 *
 * https://github.com/amplitude/Amplitude-Javascript
 *
 * @param {Object} page
 */

Amplitude.prototype.initialize = function(page){
  (function(h,a){var f=h.amplitude||{};f._q=[];function e(i){f[i]=function(){f._q.push([i].concat(Array.prototype.slice.call(arguments,0)))}}var c=["init","logEvent","setUserId","setUserProperties","setVersionName","setDomain","setGlobalUserProperties"];for(var d=0;d<c.length;d++){e(c[d])}h.amplitude=f})(window,document);

  // set domain name to root domain
  var href = window.location.href;
  var domain = top(href);
  window.amplitude.setDomain(domain);

  // inititialize amplitude library
  window.amplitude.init(this.options.apiKey);

  // set campaign params as global user properties
  var query = window.location.search;
  var campaign = utm(query);
  if (campaign) window.amplitude.setGlobalUserProperties(campaign);

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Amplitude.prototype.loaded = function(){
  return !! (window.amplitude && window.amplitude.options);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Amplitude.prototype.page = function(page){
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

Amplitude.prototype.identify = function(identify){
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

Amplitude.prototype.track = function(track){
  var props = track.properties();
  var event = track.event();
  window.amplitude.logEvent(event, props);
};
