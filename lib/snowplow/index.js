
/**
 * Module dependencies.
 */

var integration = require('segmentio/analytics.js-integration');
var Track = require('facade').Track;
var push = require('global-queue')('_snaq');

var Snowplow = module.exports = integration('Snowplow')
  .readyOnLoad()
  .global('_snaq')
  .option('version', '2.0.0')
  .option('trackerNamespace', '')
  .option('respectDoNotTrack', false)
  .option('encodeBase64', true)
  .option('cookieDomain', null)
  .option('unstructuredEvents', {})
  .option('userTraits', '')
  .option('pagePings', true)
  .option('trackLinks', true)
  .tag('<script src="http://d1fc8wv8zag5ca.cloudfront.net/{{version}}/sp.js">');

/**
 * When the major version is "1", use the API for version 1.0.0
 */

Snowplow.on('construct', function(integration){
  if (integration.options.version[0] === '1'){
    integration.initialize = integration.initializeV1;
    integration.loaded = integration.loadedV1;
  }
});

/**
 * Initialize (version 2).
 *
 * https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#initialisation
 */

Snowplow.prototype.initialize = function(){

  if (!window['segmentio_snowplow']) {
    window.GlobalSnowplowNamespace = window.GlobalSnowplowNamespace || [];
    window.GlobalSnowplowNamespace.push('segmentio_snowplow');
    window['segmentio_snowplow'] = function(){
      (window['segmentio_snowplow'].q = window['segmentio_snowplow'].q || []).push(arguments);
    }
    window['segmentio_snowplow'].q = window['segmentio_snowplow'].q || [];
  }

  this.push('newTracker', this.options.trackerNamespace || 'segmentio-client', this.options.collectorUrl, {

    // TODO: obtain application ID and add it here using `"appId": appId`
    // The application ID should be a unique identifier for the application.
    // https://github.com/snowplow/snowplow/wiki/SnowPlow-Tracker-Protocol#1-common-parameters-platform-and-event-independent
    
    cookieDomain: this.options.cookieDomain,
    encodeBase64: this.options.encodeBase64,
    respectDoNotTrack: this.options.respectDoNotTrack
  });

  if (this.options.pagePings) {
    this.push('enableActivityTracking', 10, 10);
  }

  if (this.options.trackLinks) {
    this.push('enableLinkClickTracking', null, true);
  }

  this.load(this.ready);
};  

/**
 * Initialize (version 1).
 *
 * https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker-v1
 */

Snowplow.prototype.initializeV1 = function(){
  push('setCollectorUrl', this.options.collectorUrl);

  // TODO: obtain application ID and add it using `push('setAppId', appId);`
  // The application ID should be a unique identifier for the application.
  // https://github.com/snowplow/snowplow/wiki/SnowPlow-Tracker-Protocol#1-common-parameters-platform-and-event-independent  

  if (this.options.pagePings) {
    push('enableActivityTracking', 10, 10);
  }

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

/**
 * Loaded? (version 2)
 *
 * @return {Boolean}
 */

Snowplow.prototype.loaded = function(){
  return !! (window.segmentio_snowplow 
    && window.segmentio_snowplow.q 
    && window.segmentio_snowplow.q.push !== [].push);
};

/**
 * Loaded? (version 1)
 *
 * @return {Boolean}
 */

Snowplow.prototype.loadedV1 = function(){
  return !! (window._snaq && window._snaq.push !== [].push);
};


/**
 * Page.
 *
 * https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#page
 *
 * @param {Page} page
 */

Snowplow.prototype.page = function(page){
  this.push('setCustomUrl', page.properties().url);
  this.push('setReferrerUrl', page.properties().referrer);
  this.push('setDocumentTitle', page.properties().title);
  this.push('trackPageView', page.name(), this.getUserTraitsContext());
}

/**
 * Identify.
 *
 * https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#user-id
 *
 * @param {Identify} identify
 */

Snowplow.prototype.identify = function(identify){
  this.push('setUserId', identify.userId());
}

/**
 * Track.
 *
 * https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#custom-unstructured-events
 * https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#custom-structured-events
 *
 * @param {Track} event
 */

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

/**
 * Completed order.
 *
 * https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#ecommerce
 *
 * @param {Track} track
 */

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
 *
 * @return {Array}
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
 *
 * @return {Boolean}
 */

function isEmpty(obj) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      return false;
    }
  }
  return true;
}
