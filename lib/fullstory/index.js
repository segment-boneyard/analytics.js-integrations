
/**
 * Module dependencies.
 */

var integration = require('segmentio/analytics.js-integration');

/**
 * Expose `FullStory` integration.
 *
 * https://www.fullstory.com/docs/developer
 */

var FullStory = module.exports = integration('FullStory')
  .assumesPageview()
  .option('fs_org', '');

/**
 * Initialize.
 *
 * @param {Object} page
 */

FullStory.prototype.initialize = function(page){
  window._fs_debug = false;
  window._fs_org = this.options.fs_org;
  (function(m,n,e,t,l,o,g,y){g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[];o=n.createElement(t);o.async=1;o.src='https://www.fullstory.com/s/fs.js';y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){FS(l,v)};g.setSessionVars=function(v){FS('session',v)};g.setPageVars=function(v){FS('page',v)};})(window,document,'FS','script','user');
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

FullStory.prototype.loaded = function(){
  return !! window.FS;
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

FullStory.prototype.identify = function(identify){
  var id = identify.userId();
  var traits = identify.traits();
  window.FS.identify(id, traits);
};