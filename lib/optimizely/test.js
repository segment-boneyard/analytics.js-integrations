
var Analytics = require('analytics.js').constructor;
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var tick = require('next-tick');
var Optimizely = require('./');

describe('Optimizely', function() {
  var analytics;
  var optimizely;
  var options = { listen: false };

  beforeEach(function() {
    analytics = new Analytics();
    optimizely = new Optimizely(options);
    analytics.use(Optimizely);
    analytics.use(tester);
    analytics.add(optimizely);

    window.optimizely.data = {
      experiments: { 0: { name: 'Test' } },
      state: {
        activeExperiments: [0],
        variationNamesMap: { 0: 'Variation1' },
        variationIdsMap: { 0: [123] }
      }
    };
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    optimizely.reset();
    sandbox();
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(optimizely, 'load');
      analytics.stub(optimizely, 'replay');
      analytics.stub(optimizely, 'roots');
    });

    describe('#initialize defaults', function() {
      beforeEach(function(done) {
        analytics.once('ready', done);
        analytics.initialize();
        analytics.page();
      });

      it('should call #replay by default', function(done) {
        tick(function() {
          analytics.called(optimizely.replay);
          done();
        });
      });

      it('should not call #roots by default', function(done) {
        tick(function() {
          analytics.didNotCall(optimizely.roots);
          done();
        });
      });
    });

    describe('#initialize on settings change', function() {
      it('should not call #replay if variations are disabled', function(done) {
         optimizely.options.variations = false;
         analytics.initialize();
         analytics.page();
         analytics.on('ready', tick(function() {
            analytics.didNotCall(optimizely.replay);
            done();
          })
         );
       });

      it('should call #roots if listen is enabled', function(done) {
        optimizely.options.listen = true;
        analytics.initialize();
        analytics.page();
        analytics.on('ready', tick(function() {
           analytics.called(optimizely.roots);
           done();
         })
        );
      });
    });
  });

  describe('#replay', function() {
    beforeEach(function() {
      analytics.stub(analytics, 'identify');
    });

    it('should replay variation traits', function(done) {
      optimizely.options.variations = true;
      analytics.initialize();
      analytics.page();
      tick(function() {
        analytics.called(analytics.identify, {
          'Experiment: Test': 'Variation1'
        });
        done();
      });
    });
  });

  describe('#roots', function() {
    beforeEach(function(done) {
      analytics.stub(analytics, 'track');
      optimizely.options.listen = true;
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    it('should send active experiments', function(done) {
      tick(function() {
        analytics.called(analytics.track, 'Experiment Viewed', {
          experimentId: 0,
          experimentName: 'Test',
          variationId: 123,
          variationName: 'Variation1' },
          { context: { integration: { name: 'optimizely', version: '1.0.0' }}
        });
        done();
      });
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window.optimizely, 'push');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called(window.optimizely.push, ['trackEvent', 'event', {}]);
      });

      it('should send an event and properties', function() {
        analytics.track('event', { property: true });
        analytics.called(window.optimizely.push, ['trackEvent', 'event', {
          property: true
        }]);
      });

      it('should change revenue to cents', function() {
        analytics.track('event', { revenue: 9.99 });
        analytics.called(window.optimizely.push, ['trackEvent', 'event', {
          revenue: 999
        }]);
      });
    });

    describe('#page', function() {
      beforeEach(function() {
        analytics.stub(window.optimizely, 'push');
      });

      it('should send an event for a named page', function() {
        analytics.page('Home');
        analytics.called(window.optimizely.push, ['trackEvent', 'Viewed Home Page', {
          name: 'Home',
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname + window.location.search
        }]);
      });

      it('should send an event for a named and categorized page', function() {
        analytics.page('Blog', 'New Integration');
        analytics.called(window.optimizely.push, ['trackEvent', 'Viewed Blog New Integration Page', {
          category: 'Blog',
          name: 'New Integration',
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname + window.location.search
        }]);
      });
    });
  });
});
