
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_veroq');
var cookie = require('component/cookie');
var objCase = require('obj-case');

/**
 * Expose `Vero` integration.
 */

var Vero = module.exports = integration('Vero')
  .global('_veroq')
  .option('apiKey', '')
  .tag('<script src="//d3qxef4rp70elm.cloudfront.net/m.js">');

/**
 * Initialize.
 *
 * https://github.com/getvero/vero-api/blob/master/sections/js.md
 *
 * @param {Object} page
 */

Vero.prototype.initialize = function(page){
  // clear default cookie so vero parses correctly.
  // this is for the tests.
  // basically, they have window.addEventListener('unload')
  // which then saves their "command_store", which is an array.
  // so we just want to create that initially so we can reload the tests.
  if (!cookie('__veroc4')) cookie('__veroc4', '[]');
  push('init', { api_key: this.options.apiKey });
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Vero.prototype.loaded = function(){
  return !! (window._veroq && window._veroq.push !== Array.prototype.push);
};

/**
 * Page.
 *
 * https://www.getvero.com/knowledge-base#/questions/71768-Does-Vero-track-pageviews
 *
 * @param {Page} page
 */

Vero.prototype.page = function(page){
  push('trackPageview');
};

/**
 * Identify.
 *
 * https://github.com/getvero/vero-api/blob/master/sections/js.md#user-identification
 *
 * @param {Identify} identify
 */

Vero.prototype.identify = function(identify){
  var traits = identify.traits();
  var email = identify.email();
  var id = identify.userId();
  if (!id || !email) return; // both required
  push('user', traits);
};

/**
 * Track.
 *
 * https://github.com/getvero/vero-api/blob/master/sections/js.md#tracking-events
 *
 * @param {Track} track
 */

Vero.prototype.track = function(track){
  var regex = /[uU]nsubscribe/;

  if (track.event().match(regex)) {
    push('unsubscribe', { id: track.properties().id });
  } else {
    push('track', track.event(), track.properties());
  }
};

Vero.prototype.alias = function(alias){
  var to = alias.to();

  if (alias.from()) {
    push('reidentify', to, alias.from());
  } else {
    push('reidentify', to);
  }
};
