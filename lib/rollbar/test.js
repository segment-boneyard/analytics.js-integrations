describe('Rollbar', function() {

  var analytics = require('analytics');
  var assert = require('assert');
  var Rollbar = require('integrations/lib/rollbar');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var rollbar;
  var settings = {
    accessToken: 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    environment: 'testenvironment',
  };

  var prevOnError;

  beforeEach(function() {
    prevOnError = window.onerror;
    analytics.use(Rollbar);
    rollbar = new Rollbar.Integration(settings);
    //rollbar.initialize();
  });

  afterEach(function() {
    rollbar.reset();
    analytics.user().reset();
    window.onerror = prevOnError;
  });

  it('should have the right settings', function() {
    test(rollbar)
      .name('Rollbar')
      .readyOnInitialize()
      .global('Rollbar')
      .option('accessToken', '')
      .option('identify', true);
  });

  describe('#initialize', function() {
    beforeEach(function() {
      prevOnError = window.onerror;
      sinon.stub(rollbar, 'load');
      rollbar.reset();
    });

    afterEach(function() {
      window.onerror = prevOnError;
    });

    it('should create the window.Rollbar object', function() {
      assert(!window.Rollbar);
      rollbar.initialize();
      assert(window.Rollbar);
    });

    it('should have all of the correct methods', function() {
      rollbar.initialize();
      assert(window.Rollbar);
      assert(window.Rollbar.debug);
      assert(window.Rollbar.info);
      assert(window.Rollbar.warning);
      assert(window.Rollbar.error);
      assert(window.Rollbar.critical);
      assert(window.Rollbar.configure);
      assert(window.Rollbar.scope);
    });

    it('should set window.onerror', function() {
      var onerr = window.onerror;
      rollbar.initialize();
      assert(window.onerror !== onerr);
      assert(typeof window.onerror === 'function');
    });

    it('should call #load', function() {
      rollbar.initialize();
      assert(rollbar.load.called);
    });
  });

  describe('#loaded', function() {
    it('should test window.Rollbar and .shimId for loaded', function() {
      window.Rollbar = null;
      assert(!rollbar.loaded());
      window.Rollbar = {};
      window.Rollbar.shimId = 1;
      assert(!rollbar.loaded());
      delete window.Rollbar.shimId;
      assert(rollbar.loaded());
    });
  });

  describe('#load', function() {
    beforeEach(function() {
      sinon.stub(rollbar, 'load');
      rollbar.initialize();
      rollbar.load.restore();
    });

    it('should change loaded state', function(done) {
      var shim = window.Rollbar;
      assert(!rollbar.loaded());
      rollbar.load(function(err) {
        if (err) return done(err);
        assert(rollbar.loaded());
        assert(window.Rollbar !== shim);
        assert(typeof window.Rollbar.error === 'function');
        done();
      });
    });
  });

  describe('#identify', function() {
    var configure;
    beforeEach(function() {
      rollbar.initialize();
      configure = sinon.stub(window.Rollbar, 'configure');
      rollbar.initialize();
    });

    afterEach(function() {
      rollbar.reset();
      configure.restore();
    });

    it('should send an id', function() {
      test(rollbar).identify('id', {});
      assert(configure.calledWith({payload: {person: {id: 'id'}}}));
    });

    it('should not send only traits', function() {
      test(rollbar).identify(null, { trait: true });
      assert(!configure.called);
    });

    it('should send an id and traits', function() {
      test(rollbar).identify('id', { trait: true });
      assert(configure.calledWith({payload: {person: {id: 'id', trait: true }}}));
    });

  });

  describe('window.onerror', function() {
    var prev;
    beforeEach(function() {
      // neuter the original window.onerror so we don't call it after the rollbar
      // onerror handler fires.
      prev = sinon.stub(window, 'onerror');
    });

    afterEach(function() {
      // Put the original window.onerror function back
      prev.restore();
    });

    it("should call window.Rollbar.uncaughtError", function(done) {
      rollbar.initialize();
      rollbar.load(function() {
        var onerr = window.onerror;
        var spy = sinon.spy(window.Rollbar, 'uncaughtError');
        onerr('test message', 'http://foo.com', 33, 21, new Error('testing'));

        assert(spy.called);

        var call = spy.getCall(0);
        var args = call.args;

        assert(args.length == 5);
        assert(args[0] == 'test message');
        assert(args[1] == 'http://foo.com');
        assert(args[2] == 33);
        assert(args[3] == 21);
        done();
      });
    });
  });

});
