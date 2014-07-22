
/**
 * Module dependencies.
 */

var integration = require('segmentio/analytics.js-integration');
var Track = require('facade').Track;
var push = require('global-queue')('_snaq');

var Snowplow = module.exports = integration('Snowplow')
  .readyOnInitialize()
  .global('_snaq')
  .option('version', '1.0.3')
  .option('respectDoNotTrack', false)
  .option('encodeBase64', true)
  .option('cookieDomain', '')
  .tag('<script src="http://d1fc8wv8zag5ca.cloudfront.net/{{version}}/sp.js?n=1">');

/**
 * When the major version is "1", use the API for version 1.0.0
 */
Snowplow.on('construct', function(integration){
  if (integration.options.version[0] === '2'){

  } else {
    integration.initialize = integration.initializeV1;
    integration.loaded = integration.loadedV1;
    integration.page = integration.pageV1;
    integration.identify = integration.identifyV1;
    integration.track = integration.trackV1;
    integration.completedOrder = integration.completedOrderV1;
  }
});

Snowplow.prototype.initialize = function(){

  if (!window['segmentio_snowplow']) {

    window.GlobalSnowplowNamespace = window.GlobalSnowplowNamespace || [];

    window.GlobalSnowplowNamespace.push('segmentio_snowplow');

    window['segmentio_snowplow'] = function(){
      (window['segmentio_snowplow'].q = window['segmentio_snowplow'].q || []).push(arguments);
    }

    window['segmentio_snowplow'].q = window['segmentio_snowplow'].q || [];
  }

  window.segmentio_snowplow('newTracker', 'segmentio', this.options.collectorCf + '.cloudfront.net', {
    appId: this.options.appId,
    cookieDomain: this.options.cookieDomain,
    encodeBase64: this.options.encodeBase64,
    respectDoNotTrack: this.options.respectDoNotTrack
  })

  window.segmentio_snowplow('enableActivityTracking', 10, 10);

  this.load(this.ready);
};  

Snowplow.prototype.initializeV1 = function(){
  push('setCollectorCf', this.options.collectorCf);
  push('setAppId', this.options.appId);
  push('enableActivityTracking', 10, 10)
  if (this.options.respectDoNotTrack) {
    push('respectDoNotTrack', true);
  }
  if (this.options.encodeBase64) {
    push('encodeBase64', true);
  }
  if (this.options.cookieDomain) {
    push('setCookieDomain', this.options.cookieDomain);
  }
  this.load(this.ready);
};  

Snowplow.prototype.loaded = function(){
  return !! (window.segmentio_snowplow && window.segmentio.q.push !== [].push);
};

Snowplow.prototype.loadedV1 = function(){
  return !! (window._snaq && window._snaq.push !== [].push);
};

Snowplow.prototype.page = function(page){
  window.segmentio_snowplow('setCustomUrl', page.properties().url);
  window.segmentio_snowplow('setReferrerUrl', page.properties().referrer);
  window.segmentio_snowplow('setDocumentTitle', page.properties().title);
  window.segmentio_snowplow('trackPageView', page.name());
}

Snowplow.prototype.pageV1 = function(page){
  push('setCustomUrl', page.properties().url);
  push('setReferrerUrl', page.properties().referrer);
  push('setDocumentTitle', page.properties().title);
  push('trackPageView', page.name());
}

Snowplow.prototype.identify = function(identify){
  window.segmentio_snowplow('setUserId', identify.userId());
}

Snowplow.prototype.identifyV1 = function(identify){
  push('setUserId', identify.userId());
}

Snowplow.prototype.track = function(track){
  var props = track.properties();
  if (props.category && track.event()) {
    window.segmentio_snowplow('trackStructEvent', props.category, track.event(), props.label, props.value, props.property);
  }
};   

Snowplow.prototype.trackV1 = function(track){
  var props = track.properties();
  if (props.category && track.event()) {
    push('trackStructEvent', props.category, track.event(), props.label, props.value, props.property);
  }
};   

Snowplow.prototype.completedOrder = function(track){
  var orderId = track.orderId();
  var total = track.total();
  var products = track.products();
  if (!orderId || !total) return;

  window.segmentio_snowplow('addTrans', orderId, track.properties.affiliation, total, track.tax(), track.shipping(), track.city(), track.state(), track.country(), track.currency());

  for (var i = 0; i < products.length; i++) {
    var product = new Track({properties: products[i]});
    window.segmentio_snowplow('addItem', orderId, product.sku(), product.name(), product.category(), product.price(), product.quantity(), track.currency());
  }
  push('trackTrans');
}

Snowplow.prototype.completedOrderV1 = function(track){
  var orderId = track.orderId();
  var total = track.total();
  var products = track.products();
  if (!orderId || !total) return;

  push('addTrans', orderId, track.properties.affiliation, total, track.tax(), track.shipping(), track.city(), track.state(), track.country(), track.currency());

  for (var i = 0; i < products.length; i++) {
    var product = new Track({properties: products[i]});
    push('addItem', orderId, product.sku(), product.name(), product.category(), product.price(), product.quantity(), track.currency());
  }
  push('trackTrans');
}
