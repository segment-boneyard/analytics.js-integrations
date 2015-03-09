
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_cbq');
var each = require('each');

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Supported events
 */

var supported = {
  activation: true,
  changePlan: true,
  register: true,
  refund: true,
  charge: true,
  cancel: true,
  login: true
};

/**
 * Expose `ChurnBee` integration.
 */

var ChurnBee = module.exports = integration('ChurnBee')
  .global('_cbq')
  .global('ChurnBee')
  .option('apiKey', '')
  .tag('<script src="//api.churnbee.com/cb.js">')
  .mapping('events');

/**
 * Initialize.
 *
 * https://churnbee.com/docs
 *
 * @param {Object} page
 */

ChurnBee.prototype.initialize = function(page){
  push('_setApiKey', this.options.apiKey);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

ChurnBee.prototype.loaded = function(){
  return !! window.ChurnBee;
};

/**
 * Track.
 *
 * @param {Track} event
 */

ChurnBee.prototype.track = function(track){
  var event = track.event();
  var events = this.events(event);
  events.push(event);
  each(events, function(event){
    if (true != supported[event]) return;
    push(event, track.properties({ revenue: 'amount' }));
  });
};
