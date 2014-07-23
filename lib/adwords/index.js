
/**
 * Module dependencies.
 */

var integration = require('segmentio/analytics.js-integration');
var onbody = require('on-body');
var domify = require('domify');
var Queue = require('queue');
var each = require('each');

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Script loader queue.
 */

var q = new Queue({ concurrency: 1, timeout: 2000 });

/**
 * Expose `AdWords`.
 */

var AdWords = module.exports = integration('AdWords')
  .option('conversionId', '')
  .option('remarketing', false)
  .tag('conversion', '<script src="//www.googleadservices.com/pagead/conversion.js">')
  .mapping('events');

/**
 * Load.
 *
 * @param {Function} fn
 * @api public
 */

AdWords.prototype.initialize = function(){
  onbody(this.ready);
};

/**
 * Loaded.
 *
 * @return {Boolean}
 * @api public
 */

AdWords.prototype.loaded = function(){
  return !! document.body;
};

/**
 * Page.
 *
 * https://support.google.com/adwords/answer/3111920#standard_parameters
 *
 * @param {Page} page
 */

AdWords.prototype.page = function(page){
  var remarketing = this.options.remarketing;
  var id = this.options.conversionId;
  if (remarketing) this.remarketing(id);
};

/**
 * Track.
 *
 * @param {Track}
 * @api public
 */

AdWords.prototype.track = function(track){
  var id = this.options.conversionId;
  var events = this.events(track.event());
  var revenue = track.revenue() || 0;
  var self = this;
  each(events, function(label){
    self.conversion({
      conversionId: id,
      value: revenue,
      label: label,
    });
  });
};

/**
 * Report AdWords conversion.
 *
 * @param {Object} obj
 * @param {Function} [fn]
 * @api private
 */

AdWords.prototype.conversion = function(obj, fn){
  this.enqueue({
    google_conversion_id: obj.conversionId,
    google_conversion_language: 'en',
    google_conversion_format: '3',
    google_conversion_color: 'ffffff',
    google_conversion_label: obj.label,
    google_conversion_value: obj.value,
    google_remarketing_only: false
  }, fn);
};

/**
 * Add remarketing.
 *
 * @param {String} id Conversion ID
 * @api private
 */

AdWords.prototype.remarketing = function(id){
  this.enqueue({
    google_conversion_id: id,
    google_remarketing_only: true
  });
};

/**
 * Queue external call.
 *
 * @param {Object} obj
 * @param {Function} [fn]
 */

AdWords.prototype.enqueue = function(obj, fn){
  this.debug('sending %o', obj);
  var self = this;

  q.push(function(next){
    self.globalize(obj);
    self.shim();

    self.load('conversion', function(){
      if (fn) fn();
      next();
    });
  });
};

/**
 * Set global variables.
 *
 * @param {Object} obj
 */

AdWords.prototype.globalize = function(obj){
  for (var name in obj) {
    if (obj.hasOwnProperty(name)) {
      window[name] = obj[name];
    }
  }
};

/**
 * Shim for `document.write`.
 *
 * @api private
 */

AdWords.prototype.shim = function(){
  var self = this;
  var write = document.write;
  document.write = append;

  function append(str){
    var el = domify(str);
    if (!el.src) return write(str);
    if (!/googleadservices/.test(el.src)) return write(str);
    self.debug('append %o', el);
    document.body.appendChild(el);
    document.write = write;
  }
}
