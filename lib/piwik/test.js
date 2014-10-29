
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Piwik', function(){
  var Piwik = plugin;
  var piwik;
  var analytics;
  var options = {
    siteId: 42,
    url: 'https://demo.piwik.org'
  };

  beforeEach(function(){
    analytics = new Analytics;
    piwik = new Piwik(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(piwik);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    piwik.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Piwik, integration('Piwik')
      .global('_paq')
      .option('siteId', '')
      .option('url', null)
      .mapping('goals'));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(piwik, 'load');
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(piwik.load);
      });

      it('should push the id onto window._paq', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._paq[0], ['setSiteId', options.siteId]);
      });

      it('should push the url onto window._paq', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._paq[1], ['setTrackerUrl', options.url + "/piwik.php"]);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(piwik, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function(){
      it('should send a page view', function(){
        analytics.page();
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._paq, 'push');
      });

      it('should send an event with category of All', function(){
        analytics.track('event');
        analytics.called(window._paq.push, ['trackEvent', 'All', 'event', undefined, undefined]);
      });

      it('should send an event with custom category, label, and value', function(){
        analytics.track('event', {category: 'category', label: 'label', value: 5});
        analytics.called(window._paq.push, ['trackEvent', 'category', 'event', 'label', 5]);
      });

      it('should send an event with .revenue() as the value', function(){
        analytics.track('event', {revenue: 5});
        analytics.called(window._paq.push, ['trackEvent', 'All', 'event', undefined, 5]);
      });

      it('should track goals', function(){
        piwik.options.goals = [{ key: 'goal', value: 1 }];
        analytics.track('goal');
        analytics.called(window._paq.push, ['trackGoal', 1, undefined]);
      });

      it('should send .revenue()', function(){
        piwik.options.goals = [{ key: 'goal', value: 2 }];
        analytics.track('goal', { revenue: 10 });
        analytics.called(window._paq.push, ['trackGoal', 2, 10]);
      });

      it('should send .total()', function(){
        piwik.options.goals = [{ key: 'completed order', value: 10 }];
        analytics.track('Completed Order', { total: 20 });
        analytics.called(window._paq.push, ['trackGoal', 10, 20]);
      });
    });
  });
});