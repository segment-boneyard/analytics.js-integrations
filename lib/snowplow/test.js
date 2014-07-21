
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');

var sandbox = require('clear-env');

describe('Snowplow', function(){
  var Snowplow = plugin;
  var snowplow;
  var analytics;
  var options = {
    appId: 'cfe3a',
    url: 'https://demo.snowplow.org',
    collectorCf: 'd3rkrsqld9gmqf'
  };

  beforeEach(function(){
    analytics = new Analytics;
    window.analytics = analytics;
    snowplow = new Snowplow(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(snowplow);
    snowplow.initialize()
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    //snowplow.reset();
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
        analytics.called(window._snaq.push, ['trackPageView', undefined]);
      })

      it('should track a pageview with a custom title', function(){
        analytics.page('pageName');
        analytics.called(window._snaq.push, ['trackPageView', 'pageName']);
      })
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._snaq, 'push');
      });

      it('should send a structured event', function(){
        analytics.track('testEvent', {
          category: 'testCategory'
        });
        analytics.called(window._snaq.push, [
          'trackStructEvent', 
          'testCategory', 
          'testEvent', 
          undefined, 
          undefined, 
          undefined
        ]);
      });

      it('should send a structured event with label, value, and property fields', function(){
        analytics.track('testEvent', {
          category: 'testCategory', 
          label: 'testLabel', 
          value: 70, 
          property: 'testProperty'});
        analytics.called(window._snaq.push, [
          'trackStructEvent', 
          'testCategory', 
          'testEvent', 
          'testLabel', 
          70, 
          'testProperty'
        ]);
      });
    });

    describe('#completedOrder', function(){
      beforeEach(function(){
        analytics.stub(window._snaq, 'push');
      });

      it('should send ecommerce transaction and ecommerce transaction item events', function(){
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
          'GBP'
        ]]);
        analytics.deepEqual(window._snaq.push.args[1], [[
          'addItem', 
          '780bc55',
          'p-298',
          'first product',
          undefined,
          24.75,
          1,
          'GBP'
        ]]);
        analytics.deepEqual(window._snaq.push.args[2], [[
          'addItem', 
          '780bc55',
          'p-299',
          'second product',
          undefined,
          37.62,
          2,
          'GBP'
        ]]);        
      });
    });    
  });

});
