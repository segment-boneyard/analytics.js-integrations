
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var is = require('is');

/**
 * Expose `SnapEngage` integration.
 */

var SnapEngage = module.exports = integration('SnapEngage')
  .assumesPageview()
  .global('SnapABug')
  .option('apiKey', '')
  .tag('<script src="//commondatastorage.googleapis.com/code.snapengage.com/js/{{ apiKey }}.js">');

/**
 * Initialize.
 *
 * http://help.snapengage.com/installation-guide-getting-started-in-a-snap/
 *
 * @param {Object} page
 */

SnapEngage.prototype.initialize = function(page){
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

SnapEngage.prototype.loaded = function(){
  return is.object(window.SnapABug);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

SnapEngage.prototype.identify = function(identify){
  var email = identify.email();
  if (!email) return;
  window.SnapABug.setUserEmail(email);
};
