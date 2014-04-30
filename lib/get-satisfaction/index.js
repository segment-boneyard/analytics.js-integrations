
var integration = require('integration');
var load = require('load-script');
var onBody = require('on-body');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(GetSatisfaction);
};

/**
 * Expose `GetSatisfaction` integration.
 */

var GetSatisfaction = exports.Integration = integration('Get Satisfaction')
  .assumesPageview()
  .readyOnLoad()
  .global('GSFN')
  .option('widgetId', '');

/**
 * Initialize.
 *
 * https://console.getsatisfaction.com/start/101022?signup=true#engage
 *
 * @param {Object} page
 */

GetSatisfaction.prototype.initialize = function(page){
  var widget = this.options.widgetId;
  var div = document.createElement('div');
  var id = div.id = 'getsat-widget-' + widget;
  onBody(function(body){ body.appendChild(div); });

  // usually the snippet is sync, so wait for it before initializing the tab
  this.load(function(){
    window.GSFN.loadWidget(widget, { containerId: id });
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

GetSatisfaction.prototype.loaded = function(){
  return !! window.GSFN;
};

/**
 * Load the Get Satisfaction library.
 *
 * @param {Function} callback
 */

GetSatisfaction.prototype.load = function(callback){
  load('https://loader.engage.gsfn.us/loader.js', callback);
};