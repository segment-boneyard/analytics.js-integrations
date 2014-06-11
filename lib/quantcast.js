
/**
 * Module dependencies.
 */

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

module.exports = exports = function(analytics){
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
  .option('advertise', false)
  .option('pageLabels', true)
  .option('eventLabels', true)
  .option('globalLabels', []);


/**
 * Initialize.
 *
 * https://www.quantcast.com/learning-center/guides/using-the-quantcast-asynchronous-tag/
 * https://www.quantcast.com/help/cross-platform-audience-measurement-guide/
 *
 * @param {Page} page
 */

Quantcast.prototype.initialize = function(page){
  window._qevents = window._qevents || [];

  var opts = this.options;
  var settings = { qacct: opts.pCode };
  if (user.id()) settings.uid = user.id();

  if (page) {
    settings.labels = this.labels('page', page.category(), page.name());
  }
  else if (opts.globalLabels.length) {
    settings.labels = opts.globalLabels.join(',');
  }

  push(settings);
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Quantcast.prototype.loaded = function(){
  return !! window.__qc;
};

/**
 * Load.
 *
 * @param {Function} fn
 */

Quantcast.prototype.load = function(fn){
  load({
    http: 'http://edge.quantserve.com/quant.js',
    https: 'https://secure.quantserve.com/quant.js'
  }, fn);
};

/**
 * Page.
 *
 * https://cloudup.com/cBRRFAfq6mf
 *
 * @param {Page} page
 */

Quantcast.prototype.page = function(page){
  var category = page.category();
  var name = page.name();
  var settings = {
    event: 'refresh',
    labels: this.labels('page', category, name),
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

Quantcast.prototype.identify = function(identify){
  // edit the initial quantcast settings
  var id = identify.userId();
  if (id && !!window._qevents[0]) window._qevents[0].uid = id;
};

/**
 * Track.
 *
 * https://cloudup.com/cBRRFAfq6mf
 *
 * @param {Track} track
 */

Quantcast.prototype.track = function(track){
  var name = track.event();
  var revenue = track.revenue();
  var settings = {
    event: 'click',
    labels: this.labels('event', name),
    qacct: this.options.pCode
  };
  if (null != revenue) settings.revenue = (revenue+''); // convert to string
  if (user.id()) settings.uid = user.id();
  push(settings);
};

/**
 * Completed Order.
 *
 * @param {Track} track
 * @api private
 */

Quantcast.prototype.completedOrder = function(track){
  var name = track.event();
  var revenue = track.total();
  var labels = this.labels('event', name);
  var category = track.category();

  if (this.options.advertise && this.options.eventLabels && category) {
    labels += ',' + this.labels('pcat', category);
  }

  var settings = {
    event: 'refresh', // the example Quantcast sent has completed order send refresh not click
    labels: labels,
    revenue: (revenue+''), // convert to string
    orderid: track.orderId(),
    qacct: this.options.pCode
  };
  push(settings);
};

/**
 * Generate quantcast labels. Merges in global labels from options.
 * 
 * Example:
 * 
 *    options.advertise = false;
 *    labels('event', 'my event');
 *    // => "event.my event"
 * 
 *    options.advertise = true;
 *    labels('event', 'my event');
 *    // => "_fp.event.my event"
 *
 *    options.eventLabels = false;
 *    options.globalLabels = 'GlobalLabel';
 *    // => "GlobalLabel"
 * 
 * @param {String} type
 * @param {String} ...
 * @return {String}
 * @api private
 */

Quantcast.prototype.labels = function(type){
  var args = [].slice.call(arguments, 1);
  var advertise = this.options.advertise;
  var labels = [];
  var ret = [];

  // Add global labels to the tag
  if (this.options.globalLabels.length && 'pcat' !== type) labels = this.options.globalLabels.concat();

  // Include the default label if specified
  if (this.options.pageLabels && 'page' === type ||
      this.options.eventLabels && ['event','pcat'].indexOf(type) !== -1) {  
    if (advertise && 'page' == type) type = 'event';
    if (advertise) type = '_fp.' + type;

    for (var i = 0; i < args.length; ++i) {
      if (null == args[i]) continue;
      var value = String(args[i]);
      ret.push(value.replace(/,/g, ';'));
    }

    ret = advertise ? ret.join(' ') : ret.join('.');
    if (ret) labels.push([type, ret].join('.'));
  }
  return labels.join(',');
};
