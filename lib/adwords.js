
var onbody = require('on-body');
var integration = require('integration');
var load = require('load-script');
var domify = require('domify');

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(AdWords);
};

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `AdWords`
 */

var AdWords = exports.Integration = integration('AdWords')
  .readyOnLoad()
  .option('conversionId', '')
  .option('remarketing', false)
  .option('events', {});

/**
 * Load
 *
 * @param {Function} fn
 * @api public
 */

AdWords.prototype.load = function(fn){
  onbody(fn);
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
 * http://clicky.com/help/customization#/help/custom/manual
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
  var events = this.options.events;
  var event = track.event();
  if (!has.call(events, event)) return;
  return this.conversion({
    value: track.revenue() || 0,
    label: events[event],
    conversionId: id
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
  if (this.reporting) return this.wait(obj);
  this.reporting = true;
  this.debug('sending %o', obj);
  var self = this;
  var write = document.write;
  document.write = append;
  window.google_conversion_id = obj.conversionId;
  window.google_conversion_language = 'en';
  window.google_conversion_format = '3';
  window.google_conversion_color = 'ffffff';
  window.google_conversion_label = obj.label;
  window.google_conversion_value = obj.value;
  window.google_remarketing_only = false;
  load('//www.googleadservices.com/pagead/conversion.js', fn);

  function append(str){
    var el = domify(str);
    if (!el.src) return write(str);
    if (!/googleadservices/.test(el.src)) return write(str);
    self.debug('append %o', el);
    document.body.appendChild(el);
    document.write = write;
    self.reporting = null;
  }
};

/**
 * Add remarketing.
 *
 * @param {String} id Conversion ID
 * @param {Function} [fn]
 * @api private
 */

AdWords.prototype.remarketing = function(id){
  window.google_conversion_id = id;
  // window.google_custom_params = window.google_tag_params;
  window.google_remarketing_only = true;
  load('//www.googleadservices.com/pagead/conversion.js');
};

/**
 * Wait until a conversion is sent with `obj`.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

AdWords.prototype.wait = function(obj){
  var self = this;
  var id = setTimeout(function(){
    clearTimeout(id);
    self.conversion(obj);
  }, 50);
};
