
/**
 * Module dependencies.
 */

var push = require('global-queue')('_qevents', { wrap: false });
var integration = require('analytics.js-integration');
var useHttps = require('use-https');
var is = require('is');
var reduce = require('reduce');
var del = require('obj-case').del;

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
    settings.labels = createLabels('page', [page.category(), page.name()]);
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

  var prefix = 'page';
  if (this.options.advertise) prefix = joinLabels(['_fp', 'event'], '.');

  var options = page.options('Quantcast');
  var customLabels = options.labels;
  if (!is.array(customLabels) && is.string(customLabels)) {
    customLabels = [customLabels];
  }

  var pageMeta = [];

  if (category) pageMeta.push(category);
  if (name) pageMeta.push(name);

  var labels = createLabels(prefix, pageMeta, customLabels);

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

  var options = track.options('Quantcast');
  var customLabels = options.labels;
  if (!is.array(customLabels) && is.string(customLabels)) {
    customLabels = [customLabels];
  }

  var prefix = 'event';
  if (this.options.advertise) prefix = joinLabels(['_fp', prefix], '.');

  var pageMeta = name ? [name] : null;

  var labels = createLabels(prefix, pageMeta, customLabels);

  var settings = {
    event: 'click',
    labels: labels,
    qacct: this.options.pCode
  };

  var user = this.analytics.user();
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

  var category = track.category();

  var options = track.options('Quantcast');
  var customLabels = options.labels;
  if (!is.array(customLabels) && is.string(customLabels)) {
    customLabels = [customLabels];
  }

  var prefix = 'event';
  if (this.options.advertise) prefix = joinLabels(['_fp', prefix], '.');

  var pageMeta = name ? [name] : null;
  var labels = createLabels(prefix, pageMeta, customLabels);

  if (this.options.advertise && category) {
    var extraPcatLabel = createLabels('_fp.pcat', [category]);
    labels = joinLabels([labels, extraPcatLabel], ',');
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
 * Helper method to generate quantcast labels.
 *
 * @param {String} prefix
 * @param {Array} pageMeta
 * @param {Array} ...
 * @return {String}
 * @api private
 */

function createLabels(prefix, pageMeta){
  var pageMeta = joinLabels(pageMeta, '.');
  var labels = joinLabels([prefix, pageMeta], '.');
  var customLabels = arguments[2];

  if (customLabels) {
    customLabels = joinLabels(customLabels, ',');
    labels = joinLabels([labels, customLabels], ',');
  }

  return labels.replace(/, /g, ',');
};

/**
 * Helper method to join labels together.
 *
 * @param {Array} lables
 * @param {String} separator
 * @return {String}
 * @api private
 */

function joinLabels(labels, separator){
  return labels.join(separator);
};
