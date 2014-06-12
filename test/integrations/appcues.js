describe('Appcues', function() {

  var analytics = require('analytics');
  var test = require('integration-tester');
  var sinon = require('sinon');
  var assert = require('assert');
  var Appcues = require('integrations/lib/appcues');

  var appcues;
  var settings = {
    appcuesId: 'test'
  };

  // Disable AMD for these browser tests.
  var _define = window.define;

  beforeEach(function() {
    analytics.use(Appcues);
    appcues = new Appcues.Integration(settings);
    analytics.user().reset();
    appcues.initialize();
    window.define = undefined;
  });

  afterEach(function() {
    appcues.reset();
    window.define = _define;
  });

  it('should have the right settings', function() {
    test(appcues)
      .name('Appcues')
      .assumesPageview()
      .readyOnLoad()
      .global('Appcues')
      .global('AppcuesIdentity')
      .option('appcuesId', '');
  });


  describe('#initialize', function() {
    beforeEach(function() {
      sinon.spy(appcues, 'load');
    });

    it('should call #load if user is known', function() {
      analytics.user().id('test');
      analytics.user().traits({
        email: 'test@segment.io'
      });
      appcues.initialize();
      assert(appcues.load.called);
    });

    it('should not call #load if user is unknown', function() {
      analytics.user().traits({});
      appcues.initialize();
      assert(!appcues.load.called);
    });
  });

  describe('#loaded', function() {
    it('should test window.Appcues', function() {
      window.Appcues = undefined;
      assert(!appcues.loaded());
      window.Appcues = function() {};
      assert(!appcues.loaded());
      window.Appcues = {};
      assert(appcues.loaded());
    });
  });

  describe('#load', function() {
    beforeEach(function() {
      sinon.stub(appcues, 'load');
      appcues.initialize();
      appcues.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!appcues.loaded());
      appcues.load(function (err) {
        if (err) return done(err);
        assert(appcues.loaded());
        done();
      });
    });
  });

  describe('#identify', function () {
    beforeEach(function (done) {
      // Load the Appcues embed script once.
      appcues.load();
      sinon.stub(appcues, 'load', function(callback) { callback() });
      sinon.stub(appcues, 'loaded', function() { return false });
      appcues.once('load', function() {
        window.Appcues.init = sinon.spy();
        window.Appcues.identify = sinon.spy();
        done();
      });
    });

    it('should first try to load the JS if it doesn\'t yet exist', function() {
      test(appcues).identify('id', {});
      assert(!appcues.identify.called);
      assert(appcues.load.called);
    });

    it('should call Appcues#init and #identify after loading the JS', function() {
      test(appcues).identify('id', {});
      assert(window.Appcues.init.called);
      assert(window.Appcues.identify.calledWith({id: 'id'}));
    });

    it('should proxy traits to Appcues#identify', function() {
      appcues.loaded.restore()
      sinon.stub(appcues, 'loaded', function() { return true });
      test(appcues).identify('id', {});
      assert(window.Appcues.identify.calledWith({id: 'id'}));
    });

  });
});
