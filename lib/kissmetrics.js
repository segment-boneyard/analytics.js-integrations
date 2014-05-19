
var alias = require('alias');
var Batch = require('batch');
var callback = require('callback');
var integration = require('integration');
var is = require('is');
var load = require('load-script');
var push = require('global-queue')('_kmq');
var Track = require('facade').Track;
var each = require('each');

/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(KISSmetrics);
};


/**
 * Expose `KISSmetrics` integration.
 */

var KISSmetrics = exports.Integration = integration('KISSmetrics')
  .assumesPageview()
  .readyOnInitialize()
  .global('_kmq')
  .global('KM')
  .global('_kmil')
  .option('apiKey', '')
  .option('trackPages', true)
  .option('prefixEventProperties', true);


/**
 * Initialize.
 *
 * http://support.kissmetrics.com/apis/javascript
 *
 * @param {Object} page
 */

KISSmetrics.prototype.initialize = function (page) {
  window._kmq = [];
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

KISSmetrics.prototype.loaded = function () {
  return is.object(window.KM);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

KISSmetrics.prototype.load = function (callback) {
  var key = this.options.apiKey;
  var useless = '//i.kissmetrics.com/i.js';
  var library = '//doug1izaerwt3.cloudfront.net/' + key + '.1.js';

  new Batch()
    .push(function (done) { load(useless, done); }) // :)
    .push(function (done) { load(library, done); })
    .end(callback);
};


/**
 * Page.
 *
 * @param {String} category (optional)
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

KISSmetrics.prototype.page = function (page) {
  var name = page.category() || page.name();
  var opts = this.options;

  // named pages
  if (name && opts.trackPages) {
    var track = page.track(name);
    this.track(track);
  }
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

KISSmetrics.prototype.identify = function (identify) {
  var traits = identify.traits();
  var id = identify.userId();
  if (id) push('identify', id);
  if (traits) push('set', traits);
};


/**
 * Track.
 *
 * @param {Track} track
 */

KISSmetrics.prototype.track = function (track) {
  var mapping = { revenue: 'Billing Amount' };
  if (this.options.prefixEventProperties)
    push('record', track.event(), prefix(track, mapping));
  else
    push('record', track.event(), track.properties(mapping));
};


/**
 * Alias.
 *
 * @param {Alias} to
 */

KISSmetrics.prototype.alias = function (alias) {
  push('alias', alias.to(), alias.from());
};

/**
 * Completed order.
 *
 * @param {Track} track
 * @api private
 */

KISSmetrics.prototype.completedOrder = function(track){
  var products = track.products();

  // transaction
  push('record', track.event(), prefix(track));

  // items
  window._kmq.push(function(){
    var km = window.KM;
    each(products, function(product, i){
      var temp = new Track({ event : track.event(), properties: product });
      var item = prefix(temp);
      item._t = km.ts() + i;
      item._d = 1;
      km.set(item);
    });
  });
};

/**
 * Prefix properties with the event name.
 *
 * @param {Track} track
 * @param {Object} mapping
 * @api private
 */

function prefix(track, mapping){
  var event = track.event();
  var properties = mapping ? track.properties(mapping) : track.properties();
  var props = {};
  each(properties, function(key, val){
    if (key === 'Billing Amount') props[key] = val;
    else props[event + ' - ' + key] = val;
  });
  return props;
}
