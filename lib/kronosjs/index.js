/**
 * Module dependencies.
 */
var integration = require('analytics.js-integration');
var clone = require('clone');
var extend = require('extend');

/**
 * Kronos.js source
 */
var src = '//cdnjs.cloudflare.com/ajax/libs/kronos.js/0.7.0/kronos.min.js';

/**
 * UMD ?
 */
var umd = 'function' == typeof define && define.amd;

/**
 * Expose `KronosJs` integration.
 */
var KronosJs = module.exports = integration('KronosJs')
  .global('kronosClient')
  .option('url')
  .option('namespace')
  .option('pageStream', null)
  .tag('<script src="' + src + '">')

/**
 * Initialize.
 *
 * Documentation: https://github.com/Locu/chronology/tree/master/kronos.js
 *
 * @param {Object} page
 */
KronosJs.prototype.initialize = function(page){
  var self = this;

  var configureKronos = function(kronos){
    window.kronosClient = new kronos.KronosClient({
      url: self.options.url,
      namespace: self.options.namespace
    });
    self.ready();
  };

  if (umd) {
    window.require([src], function(kronos){
      configureKronos(kronos);
    });
    return;
  }

  this.load(function(){
    configureKronos(kronos);
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */
KronosJs.prototype.loaded = function(){
  return !! window.kronosClient
};

/**
 * Identify.
 *
 * Kronos has no notion of identities, so we just stick all traits on
 * tracked events.
 *
 * @param {Identify} identify
 */
KronosJs.prototype.identify = function(identify){
  var traits = identify.traits();
  if (identify.userId()) {
    traits.userId = identify.userId();
    delete traits.id;
  }
  this.traits = traits;
};

/**
 * Track an event, adding any traits learned from identify calls.
 *
 * @param {Track} track
 */
KronosJs.prototype.track = function(track){
  var properties = track.properties();
  if (this.traits) {
    properties = clone(properties);
    properties = extend(properties, this.traits);
  }

  window.kronosClient.put(track.event(), properties);
};

/**
 * Page.
 *
 * If initialized with a `pageStream` property, track `page` load events.
 *
 * @param {Page} page
 */
KronosJs.prototype.page = function(page){
  if (! (!! this.options.pageStream)) {
    return;
  }
  var trackData = page.track();
  trackData.obj.event = this.options.pageStream;
  trackData.obj.properties = { pageProperties: trackData.obj.properties };
  this.track(trackData);
};
