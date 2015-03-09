
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var alias = require('alias');

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
 * @param {Object} page
 */

Heap.prototype.initialize = function(page){
  window.heap = window.heap || [];
  window.heap.load = function(appid, config){
    window.heap.appid = appid;
    window.heap.config = config;

    var methodFactory = function(type){
      return function(){
        heap.push([type].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };

    var methods = ['clearEventProperties', 'identify', 'setEventProperties', 'track', 'unsetEventProperty'];
    for (var i = 0; i < methods.length; i++) {
      heap[methods[i]] = methodFactory(methods[i]);
    }
  };

  window.heap.load(this.options.appId);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Heap.prototype.loaded = function(){
  return (window.heap && window.heap.appid);
};

/**
 * Identify.
 *
 * https://heapanalytics.com/docs#identify
 *
 * @param {Identify} identify
 */

Heap.prototype.identify = function(identify){
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
 * @param {Track} track
 */

Heap.prototype.track = function(track){
  window.heap.track(track.event(), track.properties());
};
