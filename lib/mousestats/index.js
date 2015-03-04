
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var useHttps = require('use-https');
var push = require('global-queue')('MouseStats_Commands');
var each = require('each');

/**
 * Expose `MouseStats` integration.
 */

var MouseStats = module.exports = integration('MouseStats')
  .assumesPageview()
  .global('MouseStatsSharedControl')
  .global('MouseStats_Commands')
  .option('accountNumber', '')
  .tag('http', '<script src="http://www2.mousestats.com/js/{{ path }}.js?{{ cache }}">')
  .tag('https', '<script src="https://ssl.mousestats.com/js/{{ path }}.js?{{ cache }}">');

/**
 * Initialize.
 *
 * http://www.mousestats.com/docs/wiki/30/tracking-script-modification
 *
 * @param {Object} page
 */

MouseStats.prototype.initialize = function(page){
  var number = this.options.accountNumber;
  var path = number.slice(0,1) + '/' + number.slice(1,2) + '/' + number;
  var cache = Math.floor(new Date().getTime() / 180000);
  var name = useHttps() ? 'https' : 'http';
  this.load(name, { path: path, cache: cache }, this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

MouseStats.prototype.loaded = function(){
  return !! (window.MouseStatsSharedControl && window.MouseStats_Commands);
};


/**
 * Identify.
 *
 * http://www.mousestats.com/docs/wiki/27/identify-a-user
 *
 * @param {Identify} identify
 */

MouseStats.prototype.identify = function(identify){
  var id = identify.userId() || identify.anonymousId();

  if (typeof id !== 'string') id = '' + id;

  push(["identify", id]);
  pushAll(identify.traits());
};


/**
 * Track.
 *
 * http://www.mousestats.com/docs/wiki/20/tag-data-playback-heatmaps-form-analytics
 *
 * @param {Track} track
 */

MouseStats.prototype.track = function(track){
  pushAll(track.event());
};


/**
* Push an Object as key value pairs.
*
* @param {Object} jsonObject
*/

function pushAll (jsonObject) {
  each(jsonObject, function(key, value) {
    if (typeof key !== 'string') key = '' + key;
    if (typeof value !== 'string') value = '' + value;
    push(["tag", key, value]);
  });
}