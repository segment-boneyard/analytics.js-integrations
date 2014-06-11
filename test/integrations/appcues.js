describe('Appcues', function() {

  var analytics = require('analytics');
  var test = require('integration-tester');
  var sinon = require('sinon');
  var assert = require('assert');
  var Appcues = require('integrations/lib/appcues');

  var appcues;
  var settings = {
    appcuesId: 'test',
    userId: 'test',
    userEmail: 'test@testification.com'
  };

  // Disable AMD for these browser tests.
  var _define = window.define;

  beforeEach(function() {
    analytics.use(Appcues);
    appcues = new Appcues.Integration(settings);
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
      .option('appcuesId', '')
      .option('userId', '')
      .option('userEmail', '');
  });


  describe('#initialize', function() {
    beforeEach(function() {
      sinon.spy(appcues, 'load');
    });

    it('should call #load', function() {
      appcues.initialize();
      assert(appcues.load.called);
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
      appcues.initialize();
      appcues.once('load', function () {
        window.Appcues.identify = sinon.spy();
        setTimeout(done, 50);
      });
    });

    it('should proxy traits to Appcues#identify', function() {
      test(appcues).identify('id', {});
      assert(window.Appcues.identify.calledWith({id: 'id'}));
    })

  });
});
