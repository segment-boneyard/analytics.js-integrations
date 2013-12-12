
describe('Klaviyo', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var Klaviyo = require('integrations/lib/klaviyo');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var tick = require('next-tick');

  var klaviyo;
  var settings = {
    apiKey: 'x'
  };

  beforeEach(function () {
    analytics.use(Klaviyo);
    klaviyo = new Klaviyo.Integration(settings);
    klaviyo.initialize(); // noop
  });

  afterEach(function () {
    klaviyo.reset();
  });

  it('should have the right settings', function () {
    test(klaviyo)
      .name('Klaviyo')
      .assumesPageview()
      .readyOnInitialize()
      .global('_learnq')
      .option('apiKey', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      klaviyo.load = sinon.spy();
    });

    it('should create window._learnq', function () {
      assert(!window._learnq);
      klaviyo.initialize();
      assert(window._learnq instanceof Array);
    });

    it('should push an api key', function () {
      klaviyo.initialize();
      assert(equal(window._learnq, [['account', settings.apiKey]]));
    });

    it('should call #load', function () {
      klaviyo.initialize();
      assert(klaviyo.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._learnq.push', function () {
      window._learnq = [];
      assert(!klaviyo.loaded());
      window._learnq.push = function(){};
      assert(klaviyo.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(klaviyo, 'load');
      klaviyo.initialize();
      klaviyo.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!klaviyo.loaded());
      klaviyo.load(function (err) {
        if (err) return done(err);
        tick(function () {
          assert(klaviyo.loaded());
          done();
        });
      });
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      klaviyo.initialize();
      window._learnq.push = sinon.spy();
    });

    it('should send an id', function () {
      test(klaviyo)
        .identify('id')
        .called(window._learnq.push)
        .with(['identify', { $id: 'id' }]);
    });

    it('shouldnt send just traits', function () {
      test(klaviyo).identify(null, { trait: true });
      assert(!window._learnq.push.called);
    });

    it('should send an id and traits', function () {
      test(klaviyo)
        .identify('id', { trait: true })
        .called(window._learnq.push)
        .with(['identify', { $id: 'id', trait: true }]);
    });

    it('should alias traits', function () {
      test(klaviyo).identify('id', {
        email: 'name@example.com',
        firstName: 'first',
        lastName: 'last',
        phone: 'phone',
        title: 'title'
      });
      assert(window._learnq.push.calledWith(['identify', {
        $id: 'id',
        $email: 'name@example.com',
        $first_name: 'first',
        $last_name: 'last',
        $phone_number: 'phone',
        $title: 'title'
      }]));
    });
  });

  describe('#group', function () {
    beforeEach(function () {
      klaviyo.initialize();
      window._learnq.push = sinon.spy();
    });

    it('should send a name', function () {
      test(klaviyo).group('id', { name: 'name' });
      assert(window._learnq.push.calledWith(['identify', { $organization: 'name' }]));
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      klaviyo.initialize();
      window._learnq.push = sinon.spy();
    });

    it('should send an event', function () {
      test(klaviyo).track('event');
      assert(window._learnq.push.calledWith(['track', 'event', {}]));
    });

    it('should send an event and properties', function () {
      test(klaviyo).track('event', { property: true });
      assert(window._learnq.push.calledWith(['track', 'event', { property: true }]));
    });
  });

});
