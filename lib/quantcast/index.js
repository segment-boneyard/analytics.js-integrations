
/**
 * Module dependencies.
 */

var push = require('global-queue')('_qevents', { wrap: false });
var integration = require('analytics.js-integration');
var useHttps = require('use-https');
var is = require('is');
var reduce = require('reduce');

/**
 * Expose `Quantcast` integration.
 */

var Quantcast = module.exports = integration('Quantcast')
  .assumesPageview()
  .global('_qevents')
  .global('__qc')
  .option('pCode', null)
  .option('advertise', false)
  .tag('http', '<script src="http://edge.quantserve.com/quant.js">')
  .tag('https', '<script src="https://secure.quantserve.com/quant.js">');

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
  var user = this.analytics.user();
  if (user.id()) settings.uid = user.id();

  if (page) {
    settings.labels = this._labels('page', page.category(), page.name());
  }

  push(settings);

  var name = useHttps() ? 'https' : 'http';
  this.load(name, this.ready);
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
 * Page.
 *
 * https://cloudup.com/cBRRFAfq6mf
 *
 * @param {Page} page
 */

Quantcast.prototype.page = function(page){
  var category = page.category();
  var name = page.name();
  var customLabels = page.proxy('properties.label')
  var labels = this._labels('page', category, name, customLabels);

  var settings = {
    event: 'refresh',
    labels: labels,
    qacct: this.options.pCode,
  };
  var user = this.analytics.user();
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
  // TODO: could be done in a cleaner way
  var id = identify.userId();
  if (id) {
    window._qevents[0] = window._qevents[0] || {};
    window._qevents[0].uid = id;
  }
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
  var orderId = track.orderId();
  var customLabels = track.proxy('properties.label');
  var labels = this._labels('event', name, customLabels);

  var settings = {
    event: 'click',
    labels: labels,
    qacct: this.options.pCode
  };

  var user = this.analytics.user();
  if (null != revenue) settings.revenue = (revenue+''); // convert to string
  if (orderId) settings.orderid = orderId;
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
  var customLabels = track.proxy('properties.label')
  var labels = this._labels('event', name, customLabels);
  var category = track.category();
  var repeat = track.proxy('properties.repeat');

  if (this.options.advertise && category) {
    labels += ',' + this._labels('pcat', category);
  }

  if ('boolean' == typeof repeat) {
    labels += ',_fp.customer.' + (repeat ? 'repeat' : 'new');
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
 * Generate quantcast labels.
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
 * @param {String} type
 * @param {String} ...
 * @return {String}
 * @api private
 */

Quantcast.prototype._labels = function(type){
  var args = Array.prototype.slice.call(arguments, 1);
  var advertise = this.options.advertise;

  if (advertise && 'page' == type) type = 'event';
  if (advertise) type = '_fp.' + type;

  var separator = advertise ? ' ' : '.';
  var ret = reduce(args, function(ret, arg){
    if (arg != null) {
      ret.push(String(arg).replace(/, /g, ','));
    }
    return ret;
  }, []).join(separator);

  return [type, ret].join('.');
};
