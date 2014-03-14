
describe('SailThru Horizon', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var tick = require('next-tick');
  var Sailthru = require('integrations/lib/sailthru');

  var sailthru;
  var settings = {
    domain: 'horizon.example.com'
  };

  beforeEach(function () {
    analytics.use(Sailthru);
    sailthru = new Sailthru.Integration(settings);
    sailthru.initialize(); // noop
  });

  afterEach(function () {
    sailthru.reset();
  });

  it('should have the right settings', function () {
    test(sailthru)
      .name('Sailthru Horizon')
      .assumesPageview()
      .readyOnInitialize()
      .global('Sailthru')
      .option('domain', null);
    });

  describe('#initialize', function () {
    beforeEach(function () {
      sailthru.load = sinon.spy();
    });

    it('should add metatags', function () {
      sailthru.initialize();
    });

    it('should call #load', function () {
      sailthru.initialize();
      assert(sailthru.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window.Sailthru', function () {
      window.Sailthru = {};
      assert(!sailthru.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(sailthru, 'load');
      sailthru.initialize();
      sailthru.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!sailthru.loaded());
      sailthru.load(function (err) {
        if (err) return done(err);
        assert(sailthru.loaded());
        return done();
      });
    });
  });
});