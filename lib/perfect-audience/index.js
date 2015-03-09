
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_pq');

/**
 * Expose `PerfectAudience` integration.
 */

var PerfectAudience = module.exports = integration('Perfect Audience')
  .assumesPageview()
  .global('_pq')
  .option('siteId', '')
  .tag('<script src="//tag.perfectaudience.com/serve/{{ siteId }}.js">');

/**
 * Initialize.
 *
 * http://support.perfectaudience.com/knowledgebase/articles/212490-visitor-tracking-api
 *
 * @param {Object} page
 */

PerfectAudience.prototype.initialize = function(page){
  window._pq = window._pq || [];
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

PerfectAudience.prototype.loaded = function(){
  return !! (window._pq && window._pq.push);
};

/**
 * Track.
 *
 * http://support.perfectaudience.com/knowledgebase/articles/212490-visitor-tracking-api
 *
 * @param {Track} event
 */

PerfectAudience.prototype.track = function(track){
  var total = track.total() || track.revenue();
  var orderId = track.orderId();
  var props = {};
  var sendProps = false;
  if (total) {
    props.revenue = total;
    sendProps = true;
  }
  if (orderId) {
    props.orderId = orderId;
    sendProps = true;
  }

  if (!sendProps) return push('track', track.event());
  return push('track', track.event(), props);
};

/**
 * Viewed Product.
 *
 * http://support.perfectaudience.com/knowledgebase/articles/212490-visitor-tracking-api
 *
 * @param {Track} event
 */

PerfectAudience.prototype.viewedProduct = function(track){
  var product = track.sku();
  push('track', track.event());
  push('trackProduct', product);
};

/**
 * Completed Purchase.
 *
 * http://support.perfectaudience.com/knowledgebase/articles/212490-visitor-tracking-api
 *
 * @param {Track} event
 */

PerfectAudience.prototype.completedOrder = function(track){
  var total = track.total() || track.revenue();
  var orderId = track.orderId();
  var props = {};
  if (total) props.revenue = total;
  if (orderId) props.orderId = orderId;
  push('track', track.event(), props);
};
