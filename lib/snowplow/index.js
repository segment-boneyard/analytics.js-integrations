
/**
 * Module dependencies.
 */

var integration = require('segmentio/analytics.js-integration');

var push = require('global-queue')('_snaq');

var Snowplow = module.exports = integration('Snowplow')
  .readyOnLoad()
  .tag('<script src="http://d1fc8wv8zag5ca.cloudfront.net/1.0.3/sp.js">');



Snowplow.prototype.initialize = function(){
  push('setCollectorCf', this.options.collectorCf);
  push('setAppId', this.options.appId);
  push('enableActivityTracking', 10, 10);
  
  this.load(this.ready);
};  

Snowplow.prototype.loaded = function(){
  return !! (window._snaq && window._snaq.push !== [].push);
};

Snowplow.prototype.page = function(page){
  push('trackPageView', page.name());
}

Snowplow.prototype.track = function(track) {
  var props = track.properties();
  if (props.category && track.event()) {
    push('trackStructEvent', props.category, track.event(), props.label, props.value, props.property);
  }
};   

