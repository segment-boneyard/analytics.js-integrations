
/**
 * Module dependencies.
 */

var each = require('each');
var integration = require('analytics.js-integration');

/**
 * Expose `AdWords`.
 */

var AdWords = module.exports = integration('AdWords')
  .option('conversionId', '')
  .option('remarketing', false)
  .tag('<script src="//www.googleadservices.com/pagead/conversion_async.js">')
  .mapping('events');

/**
 * Initialize.
 *
 * @api public
 */

AdWords.prototype.initialize = function() {
  this.load(this.ready);
};

/**
 * Loaded.
 *
 * @api private
 * @return {boolean}
 */

AdWords.prototype.loaded = function() {
  return !!document.body;
};

/**
 * Page.
 *
 * https://support.google.com/adwords/answer/3111920#standard_parameters
 * https://support.google.com/adwords/answer/3103357
 * https://developers.google.com/adwords-remarketing-tag/asynchronous/
 * https://developers.google.com/adwords-remarketing-tag/parameters
 *
 * @api public
 * @param {Page} page
 */

AdWords.prototype.page = function() {
  var remarketing = !!this.options.remarketing;
  var id = this.options.conversionId;
  var props = {};
  window.google_trackConversion({
    google_conversion_id: id,
    google_custom_params: props,
    google_remarketing_only: remarketing
  });
};

/**
 * Track.
 *
 * @api public
 * @param {Track}
 */

AdWords.prototype.track = function(track) {
  var id = this.options.conversionId;
  var events = this.events(track.event());
  var revenue = track.revenue() || 0;
  each(events, function(label) {
    var props = track.properties();
    delete props.revenue;
    window.google_trackConversion({
      google_conversion_id: id,
      google_custom_params: props,
      google_conversion_language: 'en',
      google_conversion_format: '3',
      google_conversion_color: 'ffffff',
      google_conversion_label: label,
      google_conversion_value: revenue,
      google_remarketing_only: false
    });
  });
};
