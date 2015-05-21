
var integration = require('analytics.js-integration');
var push = require('global-queue')('_tlq');
var is = require('is');

/**
 * Expose `Taplytics` integration.
 */

var Taplytics = module.exports = integration('Taplytics')
  .global('_tlq')
  .global('Taplytics')
  .option('token', '')
  .option('options', {})
  .tag('<script id="taplytics" src="https://s3.amazonaws.com/cdn.taplytics.com/taplytics.min.js">')
  .assumesPageview();

/**
 * Initialize Taplytics.
 *
 * @param {Facade} page
 */

Taplytics.prototype.initialize = function(page){
  var options = this.options.options;
  var token   = this.options.token;

  window._tlq = window._tlq || [];

  push('init', token, options);

  this.load(this.ready);
};

/**
 * Has the Taplytics library been loaded yet?
 *
 * @return {Boolean}
 */

Taplytics.prototype.loaded = function(){
  return window.Taplytics && is.object(window.Taplytics._in);
};

/**
 * Identify a user.
 *
 * @param {Facade} identify
 */

Taplytics.prototype.identify = function(identify){
  var userId = identify.userId();
  var traits = identify.traits();

  var attrs = traits || {};

  if (userId)
    attrs.id = userId;

  if (Object.keys(attrs).length) {
    push('identify', attrs);
  }
};

/**
 * Track an event.
 *
 * @param {Facade} track
 */

Taplytics.prototype.track = function(track){
  var eventName = track.event();
  var total = track.revenue() || track.total() || 0;
  var properties = track.properties() || {};

  push('track', eventName, total, properties);
};

/**
* Track a page view.
* @param {Facade} page
*/

Taplytics.prototype.page = function(page){
  var category = page.category() || undefined;
  var name = page.fullName() || undefined;
  var properties = page.properties() || {};

  push('page', category, name, properties);
};

/**
* Resets a user and logs them out.
*/

Taplytics.prototype.reset = function(){
  push('reset');
};
