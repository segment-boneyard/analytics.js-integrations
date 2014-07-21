
/**
 * Module dependencies.
 */

var integration = require('segmentio/analytics.js-integration');
var Track = require('facade').Track;
var push = require('global-queue')('_snaq');

var Snowplow = module.exports = integration('Snowplow')
  .readyOnLoad()
  .global('_snaq')
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

Snowplow.prototype.track = function(track){
  var props = track.properties();
  if (props.category && track.event()) {
    push('trackStructEvent', props.category, track.event(), props.label, props.value, props.property);
  }
};   

Snowplow.prototype.completedOrder = function(track){
  var orderId = track.orderId();
  var total = track.total(); // Could use track.revenue() as backup;
  var products = track.products();
  if (!orderId || !total) return;

  push('addTrans', orderId, track.properties.affiliation, total, track.tax(), track.shipping(), track.city(), track.state(), track.country(), track.currency());

  for (var i = 0; i < products.length; i++) {
    var product = new Track({properties: products[i]});
    push('addItem', orderId, product.sku(), product.name(), product.category(), product.price(), product.quantity(), track.currency());
  }
  push('trackTrans');
}
