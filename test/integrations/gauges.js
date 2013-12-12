
describe('Gauges', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var Gauges = require('integrations/lib/gauges');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var gauges;
  var settings = {
    siteId: 'x'
  };

  beforeEach(function () {
    analytics.use(Gauges);
    gauges = new Gauges.Integration(settings);
    gauges.initialize(); // noop
  });

  afterEach(function () {
    gauges.reset();
  });

  it('should have the right settings', function () {
    test(gauges)
      .name('Gauges')
      .assumesPageview()
      .readyOnInitialize()
      .global('_gauges')
      .option('siteId', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      gauges.load = sinon.spy();
    });

    it('should create the gauges queue', function () {
      assert(!window._gauges);
      gauges.initialize();
      assert(window._gauges instanceof Array);
    });

    it('should call #load', function () {
      gauges.initialize();
      assert(gauges.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._gauges.push', function () {
      window._gauges = [];
      assert(!gauges.loaded());
      window._gauges.push = function(){};
      assert(gauges.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(gauges, 'load');
      gauges.initialize();
      gauges.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!gauges.loaded());
      gauges.load(function (err) {
        if (err) return done(err);
        assert(gauges.loaded());
        done();
      });
    });
  });

  describe('#page', function () {
    beforeEach(function () {
      gauges.initialize();
      window._gauges.push = sinon.spy();
    });

    it('should send a page view', function () {
      test(gauges)
      .page()
      .called(window._gauges.push);
    });
  });

});
