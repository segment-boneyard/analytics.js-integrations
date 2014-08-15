
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

  it('should have the right settings', function(){
    analytics.compare(Snowplow, integration('Snowplow')
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
      .tag('<script src="http://d1fc8wv8zag5ca.cloudfront.net/{{version}}/sp.js">'));    
  });

  describe('Version 1', function(){
    var options = {
      version: '1.0.3',
      collectorUrl: 'd3rkrsqld9gmqf.cloudfront.net',
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

        it('should create window._snaq', function(){
          analytics.assert(!window._snaq);
          analytics.initialize();
          analytics.assert(window._snaq);
        });

        it('should push the collector subdomain onto window._snaq', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._snaq[0], ['setCollectorUrl', options.collectorUrl]);
        });

        it('should push enableActivityTracking onto window._snaq', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._snaq[1], ['enableActivityTracking', 10, 10]);
        });      

      });
    });

    describe('loading', function(){
      it('should load', function(done){
        analytics.load(snowplow, done);
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
      collectorUrl: 'd3rkrsqld9gmqf.cloudfront.net',
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

        it('should create window.segmentio_snowplow', function(){
          analytics.initialize();
          analytics.assert(window.segmentio_snowplow);
          analytics.assert(window.segmentio_snowplow.q);
        });

        it('should push the tracker config onto window.segmentio_snowplow.q', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window.segmentio_snowplow.q[0], ['newTracker', 'segmentio-client', 'd3rkrsqld9gmqf.cloudfront.net', {
            encodeBase64: false,
            cookieDomain: null,
            respectDoNotTrack: false
          }]);
        });      

        it('should push enableActivityTracking onto window.segmentio_snowplow.q', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window.segmentio_snowplow.q[1], ['enableActivityTracking', 10, 10]);
        });

        it('should push enableLinkClickTracking onto window.segmentio_snowplow.q', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window.segmentio_snowplow.q[2], ['enableLinkClickTracking', null, true]);
        });  

      });
    });

    describe('loading', function(){
      it('should load', function(done){
        analytics.load(snowplow, done);
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
