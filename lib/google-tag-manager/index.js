
var push = require('global-queue')('dataLayer', { wrap: false });
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(GTM);
};

/**
 * Expose `GTM`
 */

var GTM = exports.Integration = integration('Google Tag Manager')
  .assumesPageview()
  .readyOnLoad()
  .global('dataLayer')
  .global('google_tag_manager')
  .option('containerId', '')
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true)

/**
 * Initialize
 *
 * https://developers.google.com/tag-manager
 *
 * @param {Object} page
 */

GTM.prototype.initialize = function(){
  this.load();
};

/**
 * Loaded
 *
 * @return {Boolean}
 */

GTM.prototype.loaded = function(){
  return !! (window.dataLayer && [].push != window.dataLayer.push);
};

/**
 * Load.
 *
 * @param {Function} fn
 */

GTM.prototype.load = function(fn){
  var id = this.options.containerId;
  push({ 'gtm.start': +new Date, event: 'gtm.js' });
  load('//www.googletagmanager.com/gtm.js?id=' + id + '&l=dataLayer', fn);
};

/**
 * Page.
 *
 * @param {Page} page
 * @api public
 */

GTM.prototype.page = function(page){
  var category = page.category();
  var props = page.properties();
  var name = page.fullName();
  var opts = this.options;
  var track;

  // all
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // categorized
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};

/**
 * Track.
 *
 * https://developers.google.com/tag-manager/devguide#events
 *
 * @param {Track} track
 * @api public
 */

GTM.prototype.track = function(track){
  var props = track.properties();
  props.event = track.event();
  push(props);
};
