
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var extend = require('extend');
var is = require('is');

/**
 * Expose `Rollbar` integration.
 */

var RollbarIntegration = module.exports = integration('Rollbar')
  .global('Rollbar')
  .option('identify', true)
  .option('accessToken', '')
  .option('environment', 'unknown')
  .option('captureUncaught', true);

/**
 * Initialize.
 *
 * @param {Object} page
 */

RollbarIntegration.prototype.initialize = function(page){
  var _rollbarConfig = this.config = {
    accessToken: this.options.accessToken,
    captureUncaught: this.options.captureUncaught,
    payload: {
      environment: this.options.environment
    }
  };

  (function(a){function b(b){this.shimId=++g,this.notifier=null,this.parentShim=b,this.logger=function(){},a.console&&void 0 === a.console.shimId&&(this.logger=a.console.log)}function c(b,c,d){!d[4]&&a._rollbarWrappedError&&(d[4]=a._rollbarWrappedError,a._rollbarWrappedError=null),b.uncaughtError.apply(b,d),c&&c.apply(a,d)}function d(c){var d=b;return f(function(){if (this.notifier)return this.notifier[c].apply(this.notifier,arguments);var b=this,e="scope"===c;e&&(b=new d(this));var f=Array.prototype.slice.call(arguments,0),g={ shim:b, method:c, args:f, ts:new Date };return a._rollbarShimQueue.push(g),e?b:void 0})}function e(a,b){if (b.hasOwnProperty&&b.hasOwnProperty("addEventListener")){var c=b.addEventListener;b.addEventListener=function(b,d,e){c.call(this,b,a.wrap(d),e)};var d=b.removeEventListener;b.removeEventListener=function(a,b,c){d.call(this,a,b._wrapped||b,c)}}}function f(a,b){return b=b||this.logger,function(){try {return a.apply(this,arguments)} catch (c) {b("Rollbar internal error:",c)}}}var g=0;b.init=function(a,d){var g=d.globalAlias||"Rollbar";if ("object"==typeof a[g])return a[g];a._rollbarShimQueue=[],a._rollbarWrappedError=null,d=d||{};var h=new b;return f(function(){if (h.configure(d),d.captureUncaught){var b=a.onerror;a.onerror=function(){var a=Array.prototype.slice.call(arguments,0);c(h,b,a)};var f,i,j=["EventTarget","Window","Node","ApplicationCache","AudioTrackList","ChannelMergerNode","CryptoOperation","EventSource","FileReader","HTMLUnknownElement","IDBDatabase","IDBRequest","IDBTransaction","KeyOperation","MediaController","MessagePort","ModalWindow","Notification","SVGElementInstance","Screen","TextTrack","TextTrackCue","TextTrackList","WebSocket","WebSocketWorker","Worker","XMLHttpRequest","XMLHttpRequestEventTarget","XMLHttpRequestUpload"];for (f=0;f<j.length;++f)i=j[f],a[i]&&a[i].prototype&&e(h,a[i].prototype)}return a[g]=h,h},h.logger)()},b.prototype.loadFull=function(a,b,c,d,e){var g=f(function(){var a=b.createElement("script"),e=b.getElementsByTagName("script")[0];a.src=d.rollbarJsUrl,a.async=!c,a.onload=h,e.parentNode.insertBefore(a,e)},this.logger),h=f(function(){var b;if (void 0===a._rollbarPayloadQueue){var c,d,f,g;for (b=new Error("rollbar.js did not load");c=a._rollbarShimQueue.shift();)for (f=c.args,g=0;g<f.length;++g)if (d=f[g],"function"==typeof d){d(b);break}}e&&e(b)},this.logger);f(function(){c?g():a.addEventListener?a.addEventListener("load",g,!1):a.attachEvent("onload",g)},this.logger)()},b.prototype.wrap=function(b){if ("function"!=typeof b)return b;if (b._isWrap)return b;if (!b._wrapped){b._wrapped=function(){try {return b.apply(this,arguments)} catch (c) {throw a._rollbarWrappedError=c,c}},b._wrapped._isWrap=!0;for (var c in b)b.hasOwnProperty(c)&&(b._wrapped[c]=b[c])}return b._wrapped};for (var h="log,debug,info,warn,warning,error,critical,global,configure,scope,uncaughtError".split(","),i=0;i<h.length;++i)b.prototype[h[i]]=d(h[i]);var j="//d37gvrvc0wt4s1.cloudfront.net/js/v1.0/rollbar.min.js";_rollbarConfig.rollbarJsUrl=_rollbarConfig.rollbarJsUrl||j,b.init(a,_rollbarConfig)})(window,document);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

RollbarIntegration.prototype.loaded = function(){
  return is.object(window.Rollbar) && null == window.Rollbar.shimId;
};

/**
 * Load.
 *
 * @param {Function} callback
 */

RollbarIntegration.prototype.load = function(callback){
  window.Rollbar.loadFull(window, document, true, this.config, callback);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */
RollbarIntegration.prototype.identify = function(identify){
  // do stuff with `id` or `traits`
  if (!this.options.identify) return;

  // Don't allow identify without a user id
  var uid = identify.userId();
  if (uid === null || uid === undefined) return;

  var rollbar = window.Rollbar;
  var person = { id: uid };
  extend(person, identify.traits());
  rollbar.configure({ payload: { person: person }});
};
