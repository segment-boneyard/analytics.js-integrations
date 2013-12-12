
var alias = require('alias');
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Heap);
};


/**
 * Expose `Heap` integration.
 */

var Heap = exports.Integration = integration('Heap')
  .assumesPageview()
  .readyOnInitialize()
  .global('heap')
  .global('_heapid')
  .option('apiKey', '');


/**
 * Initialize.
 *
 * https://heapanalytics.com/docs#installWeb
 *
 * @param {Object} page
 */

Heap.prototype.initialize = function (page) {
  window.heap=window.heap||[];window.heap.load=function(a){window._heapid=a;var d=function(a){return function(){window.heap.push([a].concat(Array.prototype.slice.call(arguments,0)));};},e=["identify","track"];for(var f=0;f<e.length;f++)window.heap[e[f]]=d(e[f]);};
  window.heap.load(this.options.apiKey);
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Heap.prototype.loaded = function () {
  return (window.heap && window.heap.appid);
};


/**
 * Load the Heap library.
 *
 * @param {Function} callback
 */

Heap.prototype.load = function (callback) {
  load('//d36lvucg9kzous.cloudfront.net', callback);
};


/**
 * Identify.
 *
 * https://heapanalytics.com/docs#identify
 *
 * @param {Identify} identify
 */

Heap.prototype.identify = function (identify) {
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

Heap.prototype.track = function (track) {
  window.heap.track(track.event(), track.properties());
};
