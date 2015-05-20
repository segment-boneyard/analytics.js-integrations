
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Klaviyo = require('./');

describe('Klaviyo', function(){
  var analytics;
  var klaviyo;
  var options = {
    apiKey: 'x'
  };

  beforeEach(function(){
    analytics = new Analytics();
    klaviyo = new Klaviyo(options);
    analytics.use(Klaviyo);
    analytics.use(tester);
    analytics.add(klaviyo);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    klaviyo.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Klaviyo, integration('Klaviyo')
      .assumesPageview()
      .global('_learnq')
      .option('apiKey', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(klaviyo, 'load');
    });

    describe('#initialize', function(){
      it('should create window._learnq', function(){
        analytics.assert(!window._learnq);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._learnq instanceof Array);
      });

      it('should push an api key', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._learnq, [['account', options.apiKey]]);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(klaviyo.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(klaviyo, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._learnq, 'push');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window._learnq.push, ['identify', { $id: 'id' }]);
      });

      it('shouldnt send just traits', function(){
        analytics.identify({ trait: true });
        analytics.didNotCall(window._learnq.push);
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window._learnq.push, ['identify', { $id: 'id', trait: true }]);
      });

      it('should alias traits', function(){
        analytics.identify('id', {
          email: 'name@example.com',
          firstName: 'first',
          lastName: 'last',
          phone: 'phone',
          title: 'title'
        });
        analytics.called(window._learnq.push, ['identify', {
          $id: 'id',
          $email: 'name@example.com',
          $first_name: 'first',
          $last_name: 'last',
          $phone_number: 'phone',
          $title: 'title'
        }]);
      });
    });

    describe('#group', function(){
      beforeEach(function(){
        analytics.stub(window._learnq, 'push');
      });

      it('should send a name', function(){
        analytics.group('id', { name: 'name' });
        analytics.called(window._learnq.push, ['identify', { $organization: 'name' }]);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._learnq, 'push');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window._learnq.push, ['track', 'event', {}]);
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window._learnq.push, ['track', 'event', { property: true }]);
      });

      it('should alias revenue to `$value`', function(){
        analytics.track('event', { revenue: 90 });
        analytics.called(window._learnq.push, ['track', 'event', { $value: 90 }]);
      });
    });
  });
});
