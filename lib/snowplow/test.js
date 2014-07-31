
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');

var sandbox = require('clear-env');

describe('Snowplow', function(){
  var Snowplow = plugin;
  var snowplow;
  var analytics;

  beforeEach(function(){
    analytics = new Analytics;
    analytics.use(plugin);
    analytics.use(tester);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    sandbox();
  });

  /* TODO: fill this in once the settings are finalized
  it('should have the right settings', function(){
    analytics.compare(Snowplow, integration('Snowplow')
    .readyOnLoad()
    //.global('_snaq')
    .option('subdomain', null)
    .option('appId', '')
    .mapping('goals')
    .tag('<script src="http://d1fc8wv8zag5ca.cloudfront.net/1.0.3/sp.js">'));
    window._snaq = window._snaq || [];
  });*/

  describe('Version 1', function(){
    var options = {
      version: '1.0.3',
      appId: 'cfe3a',
      collectorCf: 'd3rkrsqld9gmqf',
      encodeBase64: false
    };

    beforeEach(function(){
      snowplow = new Snowplow(options);
      analytics.add(snowplow);
    });

    afterEach(function(){
      snowplow.reset();
    });

    describe('before loading', function(){
      beforeEach(function(){
        analytics.stub(snowplow, 'load');
      });

      describe('#initialize', function(){
        it('should call #load', function(){
          analytics.initialize();
          analytics.page();
          analytics.called(snowplow.load);
        });

        it('should push the collector subdomain onto window._snaq', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._snaq[0], ['setCollectorCf', options.collectorCf]);
        });

        it('should push the app ID onto window._snaq', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._snaq[1], ['setAppId', options.appId]);
        });

        it('should push enableActivityTracking onto window._snaq', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._snaq[2], ['enableActivityTracking', 10, 10]);
        });      

      });
    });

    describe('after loading', function(){
      beforeEach(function(done){
        analytics.once('ready', done);
        analytics.initialize();
      });

      describe('#page', function(){
        beforeEach(function(){
          analytics.stub(window._snaq, 'push');
        });

        it('should track a pageview without a custom title', function(){
          analytics.page();
          analytics.called(window._snaq.push, ['trackPageView', undefined, undefined]);
        });

        it('should track a pageview with a custom title', function(){
          analytics.page('pageName');
          analytics.called(window._snaq.push, ['trackPageView', 'pageName', undefined]);
        });

        it('should track a pageview with custom URL, referer, and title', function(){
          analytics.page('pageName', {url: 'customUrl', referrer: 'customReferrer', title: 'customTitle'});

          analytics.deepEqual(window._snaq.push.args[0], [['setCustomUrl', 'customUrl']]);
          analytics.deepEqual(window._snaq.push.args[1], [['setReferrerUrl', 'customReferrer']]);
          analytics.deepEqual(window._snaq.push.args[2], [['setDocumentTitle', 'customTitle']]);
          analytics.deepEqual(window._snaq.push.args[3], [['trackPageView', 'pageName', undefined]]);
        });

      });

      describe('#identify', function(){
        beforeEach(function(){
          analytics.stub(window._snaq, 'push');
        });

        it('should assign a user ID', function(){
          analytics.identify('user999');
          analytics.called(window._snaq.push, ['setUserId', 'user999']);
        });
      });

      describe('#track', function(){
        beforeEach(function(){
          analytics.stub(window._snaq, 'push');
        });

        it('should track a structured event', function(){
          analytics.track('testEvent', {
            category: 'testCategory'
          });
          analytics.called(window._snaq.push, [
            'trackStructEvent', 
            'testCategory', 
            'testEvent', 
            undefined, 
            undefined, 
            undefined,
            undefined
          ]);
        });

        it('should track a structured event with label, value, and property fields', function(){
          analytics.track('testEvent', {
            category: 'testCategory', 
            label: 'testLabel', 
            value: 70, 
            property: 'testProperty'
          });
          analytics.called(window._snaq.push, [
            'trackStructEvent', 
            'testCategory', 
            'testEvent', 
            'testLabel', 
            70, 
            'testProperty',
            undefined
          ]);
        });

      });

      describe('#completedOrder', function(){
        beforeEach(function(){
          analytics.stub(window._snaq, 'push');
        });

        it('should track ecommerce transaction and ecommerce transaction item events', function(){
          analytics.track('completed order', {
            orderId: '780bc55',
            total: 99.99,
            shipping: 13.99,
            tax: 20.99,
            currency: 'GBP',
            products: [{
              quantity: 1,
              price: 24.75,
              name: 'first product',
              sku: 'p-298'
            }, {
              quantity: 2,
              price: 37.62,
              name: 'second product',
              sku: 'p-299'
            }]
          });
          analytics.deepEqual(window._snaq.push.args[0], [[
            'addTrans', 
            '780bc55',
            undefined,
            99.99,
            20.99,
            13.99,
            undefined,
            undefined,
            undefined,
            'GBP',
            undefined
          ]]);
          analytics.deepEqual(window._snaq.push.args[1], [[
            'addItem', 
            '780bc55',
            'p-298',
            'first product',
            undefined,
            24.75,
            1,
            'GBP',
            undefined
          ]]);
          analytics.deepEqual(window._snaq.push.args[2], [[
            'addItem', 
            '780bc55',
            'p-299',
            'second product',
            undefined,
            37.62,
            2,
            'GBP',
            undefined
          ]]);        
        });
      });    
    });
  });

  describe('Version 2', function(){

    var options = {
      version: '2.0.0',
      appId: 'cfe3a',
      collectorCf: 'd3rkrsqld9gmqf',
      encodeBase64: false,
      unstructuredEvents: {
        'custom event': 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0'
      },
      userTraits: 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0'
    };

    beforeEach(function(){
      snowplow = new Snowplow(options);
      analytics.add(snowplow);
    });

    afterEach(function(){
      snowplow.reset();
    });

    describe('before loading', function(){
      beforeEach(function(){
        analytics.stub(snowplow, 'load');
      });

      describe('#initialize', function(){
        it('should call #load', function(){
          analytics.initialize();
          analytics.page();
          analytics.called(snowplow.load);
        });

        it('should push the tracker config onto window.segmentio_snowplow.q', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window.segmentio_snowplow.q[0], ['newTracker', 'segmentio', 'd3rkrsqld9gmqf.cloudfront.net', {
            appId: 'cfe3a',
            encodeBase64: false,
            cookieDomain: '',
            respectDoNotTrack: false
          }]);
        });      

        it('should push enableActivityTracking onto window.segmentio_snowplow.q', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window.segmentio_snowplow.q[1], ['enableActivityTracking', 10, 10]);
        });      

      });
    });

    describe('after loading', function(){
      beforeEach(function(done){
        analytics.once('ready', done);
        analytics.initialize();
      });

      describe('#page', function(){
        beforeEach(function(){
          analytics.stub(window, 'segmentio_snowplow');
        });

        it('should track a pageview with custom URL, referer, and title', function(){
          analytics.page('pageName', {url: 'customUrl', referrer: 'customReferrer', title: 'customTitle'});

          analytics.deepEqual(window.segmentio_snowplow.args[0], ['setCustomUrl', 'customUrl']);
          analytics.deepEqual(window.segmentio_snowplow.args[1], ['setReferrerUrl', 'customReferrer']);
          analytics.deepEqual(window.segmentio_snowplow.args[2], ['setDocumentTitle', 'customTitle']);
          analytics.deepEqual(window.segmentio_snowplow.args[3], ['trackPageView', 'pageName', undefined]);
        });

        it('should track a pageview with a user traits context', function(){
          analytics.user().traits({email: 'joebloggs@hotmail.com'});
          analytics.page();
          analytics.called(window.segmentio_snowplow, 'trackPageView', undefined, [{
            schema: 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0',
            data: {
              email: 'joebloggs@hotmail.com'
            }
          }]);
        });

      });

      describe('#identify', function(){
        beforeEach(function(){
          analytics.stub(window, 'segmentio_snowplow');
        });

        it('should assign a user ID', function(){
          analytics.identify('user999');
          analytics.called(window.segmentio_snowplow, 'setUserId', 'user999');
        });
      });

      describe('#track', function(){
        beforeEach(function(){
          analytics.stub(window, 'segmentio_snowplow');
        });

        it('should track a structured event', function(){
          analytics.track('testEvent', {
            category: 'testCategory'
          });
          analytics.called(window.segmentio_snowplow, 
            'trackStructEvent', 
            'testCategory', 
            'testEvent', 
            undefined, 
            undefined, 
            undefined,
            undefined
          );
        });

        it('should track a structured event with label, value, and property fields', function(){
          analytics.track('testEvent', {
            category: 'testCategory', 
            label: 'testLabel', 
            value: 70, 
            property: 'testProperty'});
          analytics.called(window.segmentio_snowplow, 
            'trackStructEvent', 
            'testCategory', 
            'testEvent', 
            'testLabel', 
            70, 
            'testProperty',
            undefined
          );
        });

        it('should track a structured event with a user traits context', function(){
          analytics.user().traits({email: 'joebloggs@hotmail.com'});
          analytics.track('testEvent', {
            category: 'testCategory'
          });
          analytics.called(window.segmentio_snowplow, 
            'trackStructEvent', 
            'testCategory', 
            'testEvent', 
            undefined, 
            undefined, 
            undefined,
            [{
              schema: 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0',
              data: {
                email: 'joebloggs@hotmail.com'
              }
            }]
          );
        });

        it('should track a unstructured event for which a schema has been provided', function(){
          analytics.track('custom event', {
            stringProperty: 'value', 
            numericProperty: 2
          });
          analytics.called(window.segmentio_snowplow, 
            'trackUnstructEvent', {
              schema: 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0',
              data: {
                stringProperty: 'value',
                numericProperty: 2
              }
            },
            undefined
          );
        });

        it('should track a unstructured event with a user traits context', function(){
          analytics.user().traits({email: 'joebloggs@hotmail.com'});      
          analytics.track('custom event', {
            stringProperty: 'value', 
            numericProperty: 2
          });
          analytics.called(window.segmentio_snowplow, 
            'trackUnstructEvent', {
              schema: 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0',
              data: {
                stringProperty: 'value',
                numericProperty: 2
              }
            },
            [{
              schema: 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0',
              data: {
                email: 'joebloggs@hotmail.com'
              }
            }]
          );
        });

        it('should not send a unstructured event for which no schema has been provided', function(){
          analytics.track('unknown event', {
            stringProperty: 'value', 
            numericProperty: 2
          });
          analytics.didNotCall(window.segmentio_snowplow);
        });

      });

      describe('#completedOrder', function(){
        beforeEach(function(){
          analytics.stub(window, 'segmentio_snowplow');
        });

        it('should track ecommerce transaction and ecommerce transaction item events', function(){
          analytics.track('completed order', {
            orderId: '780bc55',
            total: 99.99,
            shipping: 13.99,
            tax: 20.99,
            currency: 'GBP',
            products: [{
              quantity: 1,
              price: 24.75,
              name: 'first product',
              sku: 'p-298'
            }, {
              quantity: 2,
              price: 37.62,
              name: 'second product',
              sku: 'p-299'
            }]
          });
          analytics.deepEqual(window.segmentio_snowplow.args[0], [
            'addTrans', 
            '780bc55',
            undefined,
            99.99,
            20.99,
            13.99,
            undefined,
            undefined,
            undefined,
            'GBP',
            undefined
          ]);
          analytics.deepEqual(window.segmentio_snowplow.args[1], [
            'addItem', 
            '780bc55',
            'p-298',
            'first product',
            undefined,
            24.75,
            1,
            'GBP',
            undefined
          ]);
          analytics.deepEqual(window.segmentio_snowplow.args[2], [
            'addItem', 
            '780bc55',
            'p-299',
            'second product',
            undefined,
            37.62,
            2,
            'GBP',
            undefined
          ]);        
        });

        it('should attach a user traits context to ecommerce events', function(){
          analytics.user().traits({email: 'joebloggs@hotmail.com'});
          analytics.track('completed order', {
            orderId: '780bc55',
            total: 99.99,
            shipping: 13.99,
            tax: 20.99,
            currency: 'GBP',
            products: [{
              quantity: 1,
              price: 24.75,
              name: 'first product',
              sku: 'p-298'
            }, {
              quantity: 2,
              price: 37.62,
              name: 'second product',
              sku: 'p-299'
            }]
          });
          analytics.deepEqual(window.segmentio_snowplow.args[0], [
            'addTrans', 
            '780bc55',
            undefined,
            99.99,
            20.99,
            13.99,
            undefined,
            undefined,
            undefined,
            'GBP',
            [{
              schema: 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0',
              data: {
                email: 'joebloggs@hotmail.com'
              }
            }]
          ]);
          analytics.deepEqual(window.segmentio_snowplow.args[1], [
            'addItem', 
            '780bc55',
            'p-298',
            'first product',
            undefined,
            24.75,
            1,
            'GBP',
            [{
              schema: 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0',
              data: {
                email: 'joebloggs@hotmail.com'
              }
            }]
          ]);
          analytics.deepEqual(window.segmentio_snowplow.args[2], [
            'addItem', 
            '780bc55',
            'p-299',
            'second product',
            undefined,
            37.62,
            2,
            'GBP',
            [{
              schema: 'iglu:com.snowplowanalytics.snowplow/viewed_product/jsonschema/1-0-0',
              data: {
                email: 'joebloggs@hotmail.com'
              }
            }]
          ]);        
        });

      });    
    });
  });

});
