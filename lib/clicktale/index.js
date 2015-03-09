
/**
 * Module dependencies.
 */

var date = require('load-date');
var domify = require('domify');
var each = require('each');
var integration = require('analytics.js-integration');
var is = require('is');
var useHttps = require('use-https');
var onBody = require('on-body');

/**
 * Expose `ClickTale` integration.
 */

var ClickTale = module.exports = integration('ClickTale')
  .assumesPageview()
  .global('WRInitTime')
  .global('ClickTale')
  .global('ClickTaleSetUID')
  .global('ClickTaleField')
  .global('ClickTaleEvent')
  .option('httpCdnUrl', 'http://s.clicktale.net/WRe0.js')
  .option('httpsCdnUrl', '')
  .option('projectId', '')
  .option('recordingRatio', 0.01)
  .option('partitionId', '')
  .tag('<script src="{{src}}">');

/**
 * Initialize.
 *
 * http://wiki.clicktale.com/Article/JavaScript_API
 *
 * @param {Object} page
 */

ClickTale.prototype.initialize = function(page){
  var self = this;
  window.WRInitTime = date.getTime();

  onBody(function(body){
    body.appendChild(domify('<div id="ClickTaleDiv" style="display: none;">'));
  });

  var http = this.options.httpCdnUrl;
  var https = this.options.httpsCdnUrl;
  if (useHttps() && !https) return this.debug('https option required');
  var src = useHttps() ? https : http;

  this.load({ src: src }, function(){
    window.ClickTale(
      self.options.projectId,
      self.options.recordingRatio,
      self.options.partitionId
    );
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

ClickTale.prototype.loaded = function(){
  return is.fn(window.ClickTale);
};

/**
 * Identify.
 *
 * http://wiki.clicktale.com/Article/ClickTaleTag#ClickTaleSetUID
 * http://wiki.clicktale.com/Article/ClickTaleTag#ClickTaleField
 *
 * @param {Identify} identify
 */

ClickTale.prototype.identify = function(identify){
  var id = identify.userId();
  window.ClickTaleSetUID(id);
  each(identify.traits(), function(key, value){
    window.ClickTaleField(key, value);
  });
};

/**
 * Track.
 *
 * http://wiki.clicktale.com/Article/ClickTaleTag#ClickTaleEvent
 *
 * @param {Track} track
 */

ClickTale.prototype.track = function(track){
  window.ClickTaleEvent(track.event());
};
