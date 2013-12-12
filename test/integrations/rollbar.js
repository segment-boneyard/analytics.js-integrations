
describe('Rollbar', function () {

  var Rollbar = require('integrations/lib/rollbar');
  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var noop = function(){};
  var test = require('integration-tester');
  var sinon = require('sinon');

  var rollbar;
  var settings = {
    accessToken: 'e1674422cbe9419987eb2e7f98adc5ec',
    'server.environment': 'testenvironment'
  };

  beforeEach(function () {
    analytics.use(Rollbar);
    rollbar = new Rollbar.Integration(settings);
    rollbar.initialize(); // noop
  });

  afterEach(function () {
    rollbar.reset();
  });

  it('should store the right settings', function () {
    test(rollbar)
      .name('Rollbar')
      .readyOnInitialize()
      .assumesPageview()
      .global('_rollbar')
      .option('accessToken', '')
      .option('identify', true);
  });

  describe('#initialize', function () {
    var onerror;

    beforeEach(function () {
      sinon.stub(rollbar, 'load');
      // set up custom onerror so mocha won't complain
      onerror = window.onerror;
      window.onerror = function(){};
    });

    afterEach(function () {
      window.onerror = onerror;
    });

    it('should add the error handler', function () {
      rollbar.initialize();
      var err = new Error('a test error');
      window._rollbar.push = sinon.spy();
      window.onerror(err);
      assert(window._rollbar.push.calledWith(err));
    });

    it('should call #load', function () {
      rollbar.initialize();
      assert(rollbar.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._rollbar.push', function () {
      window._rollbar = [];
      assert(!rollbar.loaded());
      window._rollbar.push = function(){};
      assert(rollbar.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(rollbar, 'load');
      onerror = window.onerror;
      window.onerror = noop;
      rollbar.initialize();
      window.onerror = onerror;
      rollbar.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!rollbar.loaded());
      rollbar.load(function (err) {
        if (err) return done(err);
        assert(rollbar.loaded());
        done();
      });
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      rollbar.initialize();
      window._rollbar.extraParams = {};
    });

    it('should add an id to metadata', function () {
      test(rollbar).identify('id');
      assert(equal(window._rollbar.extraParams, { person: { id: 'id' } }));
    });

    it('should add traits to person data', function () {
      test(rollbar).identify(null, { trait: true });
      assert(equal(window._rollbar.extraParams, { person: { trait: true } }));
    });

    it('should add an id and traits to person data', function () {
      test(rollbar).identify('id', { trait: true });
      assert(equal(window._rollbar.extraParams, {
        person: {
          id: 'id',
          trait: true
        }
      }));
    });

    it('should not add to person data when identify option is false', function () {
      rollbar.options.identify = false;
      test(rollbar).identify('id');
      assert(equal(window._rollbar.extraParams, {}));
    });
  });

});

