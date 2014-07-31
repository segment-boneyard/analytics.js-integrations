
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
  .option('unstructuredEvents', {})
  .option('userTraits', '')
  .tag('<script src="http://d1fc8wv8zag5ca.cloudfront.net/{{version}}/sp.js?n=1">');

/**
 * When the major version is "1", use the API for version 1.0.0
 */
Snowplow.on('construct', function(integration){
  if (integration.options.version[0] === '1'){
    integration.initialize = integration.initializeV1;
    integration.loaded = integration.loadedV1;
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

  this.push('newTracker', 'segmentio', this.options.collectorUri, {
    appId: this.options.appId,
    cookieDomain: this.options.cookieDomain,
    encodeBase64: this.options.encodeBase64,
    respectDoNotTrack: this.options.respectDoNotTrack
  });

  this.push('enableActivityTracking', 10, 10);

  this.load(this.ready);
};  

Snowplow.prototype.initializeV1 = function(){
  push('setCollectorUri', this.options.collectorUri);
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
  return !! (this.push && window.segmentio.q.push !== [].push);
};

Snowplow.prototype.loadedV1 = function(){
  return !! (window._snaq && window._snaq.push !== [].push);
};

Snowplow.prototype.page = function(page){
  this.push('setCustomUrl', page.properties().url);
  this.push('setReferrerUrl', page.properties().referrer);
  this.push('setDocumentTitle', page.properties().title);
  this.push('trackPageView', page.name(), this.getUserTraitsContext());
}

Snowplow.prototype.identify = function(identify){
  this.push('setUserId', identify.userId());
}

Snowplow.prototype.track = function(track){
  var evt = track.event();
  var props = track.properties();

  if (this.options.version[0] !== '1' && this.options.unstructuredEvents.hasOwnProperty(evt)) {
    this.push('trackUnstructEvent', {
      schema: this.options.unstructuredEvents[evt],
      data: props
    },
    this.getUserTraitsContext());
  }

  else if (props.category && evt) {
    this.push('trackStructEvent', props.category, evt, props.label, props.value, props.property, this.getUserTraitsContext());
  }
};   

Snowplow.prototype.completedOrder = function(track){
  var orderId = track.orderId();
  var total = track.total();
  var products = track.products();
  if (!orderId || !total) return;

  this.push('addTrans', orderId, track.properties.affiliation, total, track.tax(), track.shipping(),
   track.city(), track.state(), track.country(), track.currency(), this.getUserTraitsContext());

  for (var i = 0; i < products.length; i++) {
    var product = new Track({properties: products[i]});
    this.push('addItem', orderId, product.sku(), product.name(), product.category(), product.price(),
     product.quantity(), track.currency(), this.getUserTraitsContext());
  }
  this.push('trackTrans');
}

/**
 * Chooses which queue to push events onto based on tracker version
 */
Snowplow.prototype.push = function(){
  if (this.options.version[0] === '2') {
    window.segmentio_snowplow.apply(null, arguments);
  } else {
    push.apply(null, arguments);
  }
}

/**
 * Builds a user traits context object if:
 * - a user traits schema has been supplied and
 * - the tracker's major version is 2
 * Otherwise returns undefined
 */
Snowplow.prototype.getUserTraitsContext = function(){
  var traits = this.analytics.user().traits();
  var schema = this.options.userTraits;
  if (this.options.version[0] === '2' && schema && !isEmpty(traits)) {
    return [{
      schema: schema,
      data: traits
    }];
  } else {
    return undefined;
  }
}

/**
 * Used to check whether the user traits object has any properties
 */
function isEmpty(obj) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      return false;
    }
  }
  return true;
}
