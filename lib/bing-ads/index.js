
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var onbody = require('on-body');
var domify = require('domify');
var extend = require('extend');
var bind = require('bind');
var when = require('when');
var each = require('each');

/**
 * HOP.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Noop.
 */

var noop = function(){};

/**
 * Expose `Bing`.
 *
 * https://bingads.microsoft.com/campaign/signup
 */

var Bing = module.exports = integration('Bing Ads')
  .global('uetq')
  .option('tagId', '')
  .tag('<script src="//bat.bing.com/bat.js">');

/**
 * Initialize
 *
 * inferred from their snippet
 * https://gist.github.com/sperand-io/8bef4207e9c66e1aa83b
 */

Bing.prototype.initialize = function(){
  window.uetq = window.uetq || [];
  var self = this;

  self.load(function(){
    var setup = {
      ti: self.options.tagId,
      q: window.uetq
    };

    window.uetq = new UET(setup);
    self.ready();
  });
};

/**
 * Loaded?
 *
 * Check for custom `push` method bestowed by UET constructor
 *
 * @return {Boolean}
 */

Bing.prototype.loaded = function(){
  return !! (window.uetq && window.uetq.push !== Array.prototype.push);
};

/**
 * Page
 */

Bing.prototype.page = function(){
  window.uetq.push("pageLoad");
};

/**
 * Track
 *
 * Send all events then set goals based
 * on them retroactively: http://advertise.bingads.microsoft.com/en-us/uahelp-topic?market=en&project=Bing_Ads&querytype=topic&query=HLP_BA_PROC_UET.htm
 *
 * @param {Track} track
 */

Bing.prototype.track = function(track){
  var event = {
    ea: 'track',
    el: track.event()
  };

  if (track.category()) event.ec = track.category();
  if (track.revenue()) event.ev = track.revenue();

  window.uetq.push(event);
};
