
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var tick = require('next-tick');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Optimizely', function(){
  var Optimizely = plugin;
  var optimizely;
  var analytics;
  var options = {};

  beforeEach(function(){
    analytics = new Analytics;
    optimizely = new Optimizely(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(optimizely);

    window.optimizely.data = {
      experiments: { 0: { name: 'Test' } },
      state: { variationNamesMap: { 0: 'Variation' } }
    };
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    optimizely.reset();
    sandbox();
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(optimizely, 'load');
      analytics.stub(optimizely, 'replay');
    });

    describe('#initialize', function(){
      it('should call #replay by default', function(done){
        analytics.initialize();
        analytics.page();
        tick(function(){
          analytics.called(optimizely.replay);
          done();
        });
      });

      it('should not call #replay if variations are disabled', function(done){
        optimizely.options.variations = false;
        analytics.initialize();
        analytics.page();
        tick(function(){
          analytics.didNotCall(optimizely.replay);
          done();
        });
      });
    });
  });

  describe('#replay', function(){
    beforeEach(function(){
      analytics.stub(analytics, 'identify');
    });

    it('should replay variation traits', function(done){
      optimizely.options.variations = true;
      analytics.initialize();
      analytics.page();
      tick(function(){
        analytics.called(analytics.identify, {
          'Experiment: Test': 'Variation'
        });
        done();
      });
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.optimizely, 'push');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.optimizely.push, ['trackEvent', 'event', {}]);
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window.optimizely.push, ['trackEvent', 'event', {
          property: true
        }]);
      });

      it('should change revenue to cents', function(){
        analytics.track('event', { revenue: 9.99 });
        analytics.called(window.optimizely.push, ['trackEvent', 'event', {
          revenue: 999
        }]);
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window.optimizely, 'push');
      });

      it('should send an event for a named page', function(){
        analytics.page('Home');
        analytics.called(window.optimizely.push, ['trackEvent', 'Viewed Home Page', {
          name: 'Home',
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + window.location.pathname + window.location.search
        }]);
      });

      it('should send an event for a named and categorized page', function(){
        analytics.page('Blog', 'New Integration');
        analytics.called(window.optimizely.push, ['trackEvent', 'Viewed Blog New Integration Page', {
          category: 'Blog',
          name: 'New Integration',
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + window.location.pathname + window.location.search
        }]);
      });
    });
  });
});