'use strict';

/**
* Module dependencies.
*/

var bind = require('bind');
var domify = require('domify');
var each = require('each');
var extend = require('extend');
var integration = require('analytics.js-integration');
var json = require('json');

/**
* Expose `Extole` integration.
*/

var Extole = module.exports = integration('Extole')
  .global('extole')
  .option('clientId', '')
  .mapping('events')
  .tag('main', '<script src="//tags.extole.com/{{ clientId }}/core.js">');

/**
* Initialize.
*
* @api public
* @param {Object} page
*/

Extole.prototype.initialize = function() {
  if (this.loaded()) return this.ready();
  this.load('main', bind(this, this.ready));
};

/**
* Loaded?
*
* @api private
* @return {boolean}
*/

Extole.prototype.loaded = function() {
  return !!window.extole;
};

/**
* Track.
*
* @api public
* @param {Track} track
*/

Extole.prototype.track = function(track) {
  var user = this.analytics.user();
  var traits = user.traits();
  var userId = user.id();
  var email = traits.email;

  if (!userId && !email) {
    return this.debug('User must be identified before `#track` calls');
  }

  var event = track.event();
  var extoleEvents = this.events(event);

  if (!extoleEvents.length) {
    return this.debug('No events found for %s', event);
  }

  each(extoleEvents, bind(this, function(extoleEvent) {
    this._registerConversion(this._createConversionTag({
      type: extoleEvent,
      params: this._formatConversionParams(event, email, userId, track.properties())
    }));
  }));
};

/**
 * Register a conversion to Extole.
 *
 * @api private
 * @param {HTMLElement} conversionTag An Extole conversion tag.
 */

// FIXME: If I understand Extole's lib correctly, this is sometimes async,
// sometimes sync. Refactor this into more predictable/sane behavior.
Extole.prototype._registerConversion = function(conversionTag) {
  if (window.extole.main && window.extole.main.fireConversion) {
    return window.extole.main.fireConversion(conversionTag);
  }

  if (window.extole.initializeGo) {
    window.extole.initializeGo().andWhenItsReady(function() {
      window.extole.main.fireConversion(conversionTag);
    });
  }
};

/**
 * Formats details from a Segment track event into a data format Extole can
 * accept.
 *
 * @api private
 * @param {string} event
 * @param {string} email
 * @param {string|number} userId
 * @param {Object} properties track.properties().
 * @return {Object}
 */

Extole.prototype._formatConversionParams = function(event, email, userId, properties) {
  var total;

  if (properties.total) {
    total = properties.total;
    delete properties.total;
    properties['tag:cart_value'] = total;
  }

  return extend({
    'tag:segment_event': event,
    e: email,
    partner_conversion_id: userId
  }, properties);
};

/**
 * Create an Extole conversion tag.
 *
 * @param {Object} conversion An Extole conversion object.
 * @return {HTMLElement}
 */

Extole.prototype._createConversionTag = function(conversion) {
  return domify('<script type="extole/conversion">' + json.stringify(conversion) + '</script>');
};
