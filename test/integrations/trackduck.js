
describe('TrackDuck', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var TrackDuck = require('integrations/lib/trackduck');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var trackduck;
  var settings = {
    siteId: ''
  };

  beforeEach(function () {
    analytics.use(TrackDuck);
    trackduck = new TrackDuck.Integration(settings);
    trackduck.initialize(); // noop
  });

  afterEach(function () {
    trackduck.reset();
  });

  it('should have the right settings', function () {
    test(trackduck)
      .name('TrackDuck')
      .assumesPageview()
      .readyOnLoad()
      .global('Quabler')
      .option('siteId', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      trackduck.load = sinon.spy();
    });

    it('should call #load', function () {
      trackduck.initialize();
      assert(trackduck.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window.Quabler', function () {
      assert(!trackduck.loaded());
      window.Quabler = {};
      assert(trackduck.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(trackduck, 'load');
      trackduck.initialize();
      trackduck.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!trackduck.loaded());
      trackduck.load(function (err) {
        if (err) return done(err);
        assert(trackduck.loaded());
        done();
      });
    });
  });

});
