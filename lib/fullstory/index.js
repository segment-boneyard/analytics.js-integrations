
/**
 * Module dependencies.
 */

var camel = require('to-camel-case');
var foldl = require('foldl');
var integration = require('analytics.js-integration');
var is = require('is');

/**
 * Expose `FullStory` integration.
 *
 * https://www.fullstory.com/docs/developer
 */

var FullStory = module.exports = integration('FullStory')
  .option('org', '')
  .option('debug', false)
  .tag('<script src="https://www.fullstory.com/s/fs.js"></script>');

/**
 * Initialize.
 */

FullStory.prototype.initialize = function(){
  var self = this;
  window._fs_debug = this.options.debug;
  window._fs_host = 'www.fullstory.com';
  window._fs_org = this.options.org;

  /* eslint-disable */
  (function(m,n,e,t,l,o,g,y){
    g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[];
    g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){FS(l,v)};
    g.setSessionVars=function(v){FS('session',v)};g.setPageVars=function(v){FS('page',v)};
    self.ready();
    self.load();
  })(window,document,'FS','script','user');
  /* eslint-enable */
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

FullStory.prototype.loaded = function(){
  return !!window.FS;
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

FullStory.prototype.identify = function(identify){
  var id = identify.userId() || identify.anonymousId();
  var traits = identify.traits({ name: 'displayName' });

  var newTraits = foldl(function(results, value, key){
    if (key !== 'id') results[key === 'displayName' || key === 'email' ? key : convert(key, value)] = value;
    return results;
  }, {}, traits);

  window.FS.identify(String(id), newTraits);
};

/**
* Convert to FullStory format.
*
* @param {string} trait
* @param {*} value
*/

function convert(key, value){
  key = camel(key);
  if (is.string(value)) return key + '_str';
  if (isInt(value)) return key + '_int';
  if (isFloat(value)) return key + '_real';
  if (is.date(value)) return key + '_date';
  if (is.boolean(value)) return key + '_bool';
}

/**
 * Check if n is a float.
 */

function isFloat(n) {
  return n === +n && n !== (n | 0);
}

/**
 * Check if n is an integer.
 */

function isInt(n) {
  return n === +n && n === (n | 0);
}
