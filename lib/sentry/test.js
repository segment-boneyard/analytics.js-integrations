
describe('Sentry', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Sentry = require('integrations/lib/sentry');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var sentry;
  var settings = {
    config: 'x'
  };

  beforeEach(function(){
    analytics.use(Sentry);
    sentry = new Sentry.Integration(settings);
  });

  afterEach(function(){
    sentry.reset();
  });

  it('should have the right settings', function(){
    test(sentry)
      .name('Sentry')
      .readyOnLoad()
      .global('Raven')
      .option('config', '');
  });

  describe('#initialize', function(){
    it('should call #load', function(){
      sentry.load = sinon.spy();
      sentry.initialize();
      assert(sentry.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.Raven', function(){
      assert(!sentry.loaded());
      window.Raven = document.createElement('div');
      assert(!sentry.loaded());
      window.Raven = {};
      assert(sentry.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(sentry, 'load');
      sentry.initialize();
      sentry.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!sentry.loaded());
      sentry.load(function (err) {
        if (err) return done(err);
        assert(sentry.loaded());
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function (done) {
      sentry.initialize();
      sentry.once('load', function(){
        window.Raven.setUser = sinon.spy();
        done();
      });
    });

    it('should send an id', function(){
      test(sentry).identify('id');
      assert(window.Raven.setUser.calledWith({ id: 'id' }));
    });

    it('should send traits', function(){
      test(sentry).identify(null, { trait: true });
      assert(window.Raven.setUser.calledWith({ trait: true }));
    });

    it('should send an id and traits', function(){
      test(sentry).identify('id', { trait: true });
      assert(window.Raven.setUser.calledWith({ id: 'id', trait: true }));
    });
  });
});
