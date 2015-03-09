
/**
 * Module dependencies.
 */

var push = require('global-queue')('dataLayer', { wrap: false });
var integration = require('analytics.js-integration');

/**
 * Expose `GTM`.
 */

var GTM = module.exports = integration('Google Tag Manager')
  .assumesPageview()
  .global('dataLayer')
  .global('google_tag_manager')
  .option('containerId', '')
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true)
  .tag('<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer">');

/**
 * Initialize.
 *
 * https://developers.google.com/tag-manager
 *
 * @param {Object} page
 */

GTM.prototype.initialize = function(){
  push({ 'gtm.start': +new Date, event: 'gtm.js' });
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

GTM.prototype.loaded = function(){
  return !! (window.dataLayer && [].push != window.dataLayer.push);
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
