
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Facebook Conversion Tracking', function(){
  var Facebook = plugin;
  var facebook;
  var analytics;
  var options = {
    events: {
      signup: 0,
      login: 1,
      play: 2
    }
  };

  beforeEach(function(){
    analytics = new Analytics;
    facebook = new Facebook(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(facebook);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    facebook.reset();
    sandbox();
  });

  it('should have the correct settings', function(){
    analytics.compare(Facebook, integration('Facebook Conversion Tracking')
      .option('currency', 'USD')
      .mapping('events'));
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(facebook, done);
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
        analytics.stub(window._fbq, 'push');
      });

      it('should send custom event even if event is not defined', function(){
        analytics.track('event', { x: 10 });
        analytics.called(window._fbq.push, ['track', 'event', { x: 10 }]);
      });

      it('should send event if found', function(){
        analytics.track('signup', {});
        analytics.called(window._fbq.push, ['track', 0, {
          currency: 'USD',
          value: '0.00'
        }]);
      });

      it('should support array events', function(){
        facebook.options.events = [{ key: 'event', value: 4 }];
        analytics.track('event');
        analytics.called(window._fbq.push, ['track', 4, {
          currency: 'USD',
          value: '0.00'
        }]);
      });

      it('should send revenue', function(){
        analytics.track('login', { revenue: '$50' });
        analytics.called(window._fbq.push, ['track', 1, {
          value: '50.00',
          currency: 'USD'
        }]);
      });
    });
  });
});
