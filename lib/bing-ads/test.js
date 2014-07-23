
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Bing Ads', function(){
  var Bing = plugin;
  var bing;
  var analytics;
  var options = {
    siteId: 'fd080b41-0f80-421d-9f12-d6ba437e206d',
    domainId: '2823204',
    events: {
      signup: 1,
      login: 2,
      play: 3
    }
  };

  beforeEach(function(){
    analytics = new Analytics;
    bing = new Bing(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(bing);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    bing.reset();
    sandbox();
  });

  it('should have the correct settings', function(){
    analytics.compare(Bing, integration('Bing Ads')
      .option('siteId', '')
      .option('domainId', '')
      .mapping('events'));
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(bing, done);
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
        analytics.stub(window.mstag, 'loadTag');
      });

      it('should not send if goal is not defined', function(){
        analytics.track('toString', {});
        analytics.didNotCall(window.mstag.loadTag);
      });

      it('should send correctly', function(){
        analytics.track('play', { revenue: 90 });
        analytics.called(window.mstag.loadTag, 'analytics', {
          domainId: options.domainId,
          revenue: 90,
          dedup: '1',
          type: '1',
          actionid: options.events.play
        });
      });

      it('should support array events', function(){
        bing.options.events = [{ key: 'event', value: 4 }];
        analytics.track('event', { revenue: 99 });
        analytics.called(window.mstag.loadTag, 'analytics', {
          actionid: bing.options.events[0].value,
          domainId: options.domainId,
          revenue: 99,
          dedup: '1',
          type: '1'
        });
      });
    });
  });
});
