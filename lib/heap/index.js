
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
  .tag('heap', '<script src="//cdn.heapanalytics.com/js/heap.js">');

/**
 * Initialize.
 *
 * https://heapanalytics.com/docs#installWeb
 *
 * @param {Object} page
 */

Heap.prototype.initialize = function(page){
  window.heap = window.heap || [];
  window.heap.appid = this.options.appId;

  var o = function(t){
    return function(){
      window.heap.push([t].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  p = ["identify", "track"];
  for (c = 0; c < p.length; c++) window.heap[p[c]] = o(p[c]);

  this.load('heap', this.ready);
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
  var traits = identify.traits();
  var username = identify.username();
  var id = identify.userId();
  var handle = username || id;
  if (handle) traits.handle = handle;
  delete traits.username;
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
