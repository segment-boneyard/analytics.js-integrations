
describe('awe.sm', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Awesm = require('integrations/lib/awesm');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var awesm;
  var settings = {
    apiKey: '5c8b1a212434c2153c2f2c2f2c765a36140add243bf6eae876345f8fd11045d9',
    events: { Test: 'goal_1' }
  };

  beforeEach(function () {
    analytics.use(Awesm);
    awesm = new Awesm.Integration(settings);
    awesm.initialize(); // noop
    // turn off the data capturing to prevent jsonp from breaking other tests
    window.AWESMEXTRA = { capture_data: false };
  });

  afterEach(function () {
    awesm.reset();
  });

  it('should have the right settings', function () {
    test(awesm)
      .name('awe.sm')
      .assumesPageview()
      .readyOnLoad()
      .global('AWESM')
      .option('apiKey', '')
      .option('events', {});
  });

  describe('#initialize', function () {
    beforeEach(function () {
      awesm.load = sinon.spy();
    });

    it('should pass options to awe.sm', function () {
      awesm.initialize();
      assert(window.AWESM.api_key == settings.apiKey);
    });

    it('should call #load', function () {
      awesm.initialize();
      assert(awesm.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window.AWESM._exists', function () {
      window.AWESM = {};
      assert(!awesm.loaded());
      window.AWESM._exists = true;
      assert(awesm.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(awesm, 'load');
      awesm.initialize();
      awesm.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!awesm.loaded());
      awesm.load(function (err) {
        if (err) return done(err);
        assert(awesm.loaded());
        done();
      });
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      window.AWESM = { convert: sinon.spy() };
    });

    it('should convert an event to a goal', function () {
      test(awesm)
      .track('Test', {})
      .called(window.AWESM.convert)
      .with('goal_1', 0);
    });

    it('should not convert an unknown event', function () {
      test(awesm).track('Unknown', {});
      assert(!window.AWESM.convert.called);
    });

    it('should accept a value property', function () {
      test(awesm)
      .track('Test', { value: 1 })
      .called(window.AWESM.convert)
      .with('goal_1', 1);
    });

    it('should prefer a revenue property', function () {
      test(awesm)
      .track('Test', { value: 1, revenue: '$42.99' })
      .called(window.AWESM.convert)
      .with('goal_1', 4299);
    });
  });

});
