
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var slug = require('slug');
var push = require('global-queue')('_tsq');

/**
 * Expose `Tapstream` integration.
 */

var Tapstream = module.exports = integration('Tapstream')
  .assumesPageview()
  .global('_tsq')
  .option('accountName', '')
  .option('trackAllPages', true)
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true)
  .tag('<script src="//cdn.tapstream.com/static/js/tapstream.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Tapstream.prototype.initialize = function(page){
  window._tsq = window._tsq || [];
  push('setAccountName', this.options.accountName);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Tapstream.prototype.loaded = function(){
  return !! (window._tsq && window._tsq.push !== Array.prototype.push);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Tapstream.prototype.page = function(page){
  var category = page.category();
  var opts = this.options;
  var name = page.fullName();

  // all pages
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // named pages
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }

  // categorized pages
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }
};

/**
 * Track.
 *
 * @param {Track} track
 */

Tapstream.prototype.track = function(track){
  var props = track.properties();
  push('fireHit', slug(track.event()), [props.url]); // needs events as slugs
};
