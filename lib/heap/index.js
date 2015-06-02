
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var each = require('each');

/**
 * Expose `Heap` integration.
 */

var Heap = module.exports = integration('Heap')
  .global('heap')
  .option('appId', '')
  .tag('<script src="//cdn.heapanalytics.com/js/heap-{{ appId }}.js">');

/**
 * Initialize.
 *
 * https://heapanalytics.com/docs/installation#web
 *
 * @api public
 */

Heap.prototype.initialize = function() {
  window.heap = window.heap || [];
  window.heap.load = function(appid, config) {
    window.heap.appid = appid;
    window.heap.config = config;

    var methodFactory = function(type) {
      return function() {
        window.heap.push([type].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };

    var heapMethods = ['clearEventProperties', 'identify', 'setEventProperties', 'track', 'unsetEventProperty'];
    each(heapMethods, function(method) {
      window.heap[method] = methodFactory(method);
    });
  };

  window.heap.load(this.options.appId);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Heap.prototype.loaded = function() {
  return !!(window.heap && window.heap.appid);
};

/**
 * Identify.
 *
 * https://heapanalytics.com/docs#identify
 *
 * @api public
 * @param {Identify} identify
 */

Heap.prototype.identify = function(identify) {
  var traits = identify.traits({ email: '_email' });
  var id = identify.userId();
  if (id) traits.handle = id;
  window.heap.identify(traits);
};

/**
 * Track.
 *
 * https://heapanalytics.com/docs#track
 *
 * @api public
 * @param {Track} track
 */

Heap.prototype.track = function(track) {
  window.heap.track(track.event(), track.properties());
};
