
/**
 * Module dependencies.
 */
 
var push = require('global-queue')('MouseStats_Commands');
var integration = require('analytics.js-integration');
var useHttps = require('use-https');
var each = require('each');
var is = require('is');

/**
 * Expose `MouseStats` integration.
 */

var MouseStats = module.exports = integration('MouseStats')
  .assumesPageview()
  .global('MouseStats_Commands')
  .global('MouseStatsSharedControl')
  .option('accountNumber', '')
  .tag('http', '<script src="http://www2.mousestats.com/js/{{ path }}.js?{{ cache }}">')
  .tag('https', '<script src="https://ssl.mousestats.com/js/{{ path }}.js?{{ cache }}">');

/**
 * Initialize.
 *
 * http://www.mousestats.com/docs/pages/allpages
 *
 * @param {Object} page
 */

MouseStats.prototype.initialize = function(page){
  var number = this.options.accountNumber;
  var path = number.slice(0,1) + '/' + number.slice(1,2) + '/' + number;
  var cache = Math.floor(new Date().getTime() / 60000);
  var name = useHttps() ? 'https' : 'http';
  this.load(name, { path: path, cache: cache }, this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

MouseStats.prototype.loaded = function(){
  return !! (window.MouseStatsSharedControl);
};

/**
 * Identify.
 *
 * http://www.mousestats.com/docs/wiki/20/tag-data-playback-heatmaps-form-analytics
 *
 * @param {Identify} identify
 */

MouseStats.prototype.identify = function(identify){
   set(identify.traits());
};

/**
 * Track.
 *
 * http://www.mousestats.com/docs/wiki/20/tag-data-playback-heatmaps-form-analytics
 *
 * @param {Track} track
 */

MouseStats.prototype.track = function(track){
  var props = track.properties();
  props.event = track.event();
  set(props);
};


/**
 * Push each key and value in the given `obj` onto the queue.
 *
 * @param {Object} obj
 */

function set(obj){
  each(obj, function(key, value){
    push('tag', key, value);
  });
}
