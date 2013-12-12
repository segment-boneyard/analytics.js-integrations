
describe('SnapEngage', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var SnapEngage = require('integrations/lib/snapengage');
  var test = require('integration-tester');

  var snapengage;
  var settings = {
    apiKey: '782b737e-487f-4117-8a2b-2beb32b600e5'
  };

  beforeEach(function () {
    analytics.use(SnapEngage);
    snapengage = new SnapEngage.Integration(settings);
    snapengage.initialize(); // noop
  });

  afterEach(function () {
    snapengage.reset();
  });

  it('should store the right settings', function () {
    test(snapengage)
      .name('SnapEngage')
      .assumesPageview()
      .readyOnLoad()
      .global('SnapABug')
      .option('apiKey', '');
  });

  describe('#loaded', function () {
    it('should test window.SnapABug', function () {
      assert(!snapengage.loaded());
      window.SnapABug = document.createElement('div');
      assert(!snapengage.loaded());
      window.SnapABug = {};
      assert(snapengage.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(snapengage, 'load');
      snapengage.initialize();
      snapengage.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!snapengage.loaded());
      snapengage.load(function (err) {
        if (err) return done(err);
        assert(snapengage.loaded());
        done();
      });
    });
  });

  describe('#initialize', function () {
    it('should call #load', function () {
      snapengage.load = sinon.spy();
      snapengage.initialize();
      assert(snapengage.load.called);
    });
  });

  describe('#identify', function () {
    beforeEach(function (done) {
      snapengage.initialize();
      snapengage.once('load', function () {
        window.SnapABug.setUserEmail = sinon.spy();
        done();
      });
    });

    it('should not send just an id', function () {
      test(snapengage).identify('id');
      assert(!window.SnapABug.setUserEmail.called);
    });

    it('should send an email', function () {
      test(snapengage).identify('id', { email: 'name@example.com' });
      assert(window.SnapABug.setUserEmail.calledWith('name@example.com'));
    });
  });
});
