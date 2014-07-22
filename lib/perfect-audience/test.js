
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Perfect Audience', function(){
  var PerfectAudience = plugin;
  var pa;
  var analytics;
  var options = {
    siteId: '4ff6ade4361ed500020000a5'
  };

  beforeEach(function(){
    analytics = new Analytics;
    pa = new PerfectAudience(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(pa);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    pa.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(PerfectAudience, integration('Perfect Audience')
      .assumesPageview()
      .global('_pa')
      .option('siteId', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(pa, 'load');
    });

    describe('#initialize', function(){
      it('should create the window._pa object', function(){
        analytics.assert(!window._pa);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._pa);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(pa.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(pa, done);
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
        analytics.stub(window._pa, 'track');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window._pa.track, 'event', {});
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window._pa.track, 'event', { property: true });
      });
    });
  });
});