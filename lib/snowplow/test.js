
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
  });

});
