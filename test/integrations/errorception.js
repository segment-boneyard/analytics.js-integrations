
describe('Errorception', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var Errorception = require('integrations/lib/errorception');
  var noop = function(){};
  var sinon = require('sinon');
  var test = require('integration-tester');

  var errorception;
  var settings = {
    projectId: '537adee22ea64a236a000586'
  };


  beforeEach(function () {
    analytics.use(Errorception);
    errorception = new Errorception.Integration(settings);
    errorception.initialize(); // noop
  });

  afterEach(function () {
    errorception.reset();
  });

  it('should have the right settings', function () {
    test(errorception)
      .name('Errorception')
      .assumesPageview()
      .readyOnInitialize()
      .global('_errs')
      .option('projectId', '')
      .option('meta', true);
  });

  describe('#initialize', function () {
    var onerror;

    beforeEach(function () {
      sinon.stub(errorception, 'load');
      // set up custom onerror so mocha won't complain
      onerror = window.onerror;
      window.onerror = noop;
    });

    afterEach(function () {
      window.onerror = onerror;
    });

    it('should initialize the errorception queue', function () {
      errorception.initialize();
      assert(equal(window._errs, [settings.projectId]));
    });

    it('should add the error handler', function () {
      errorception.initialize();
      var err = new Error('a test error');
      window._errs.push = sinon.spy();
      window.onerror(err);
      assert(window._errs.push.calledWith([err]));
    });

    it('should call #load', function () {
      errorception.initialize();
      assert(errorception.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._errs.push', function () {
      window._errs = [];
      assert(!errorception.loaded());
      window._errs.push = function(){};
      assert(errorception.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(errorception, 'load');
      onerror = window.onerror;
      window.onerror = noop;
      errorception.initialize();
      window.onerror = onerror;
      errorception.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!errorception.loaded());
      errorception.load(function (err) {
        if (err) return done(err);
        console.log(errorception.loaded());
        assert(errorception.loaded());
        done();
      });
    });
  });

  describe('#identify', function () {
    it('should add an id to metadata', function () {
      test(errorception)
      .identify('id')
      .changed(window._errs.meta)
      .to({ id: 'id' });
    });

    it('should add traits to metadata', function () {
      test(errorception)
      .identify(null, { trait: true })
      .changed(window._errs.meta)
      .to({ trait: true });
    });

    it('should add an id and traits to metadata', function () {
      test(errorception)
      .identify('id', { trait: true })
      .changed(window._errs.meta)
      .to({ id: 'id', trait: true });
    });

    it('should not add to metadata when meta option is false', function () {
      errorception.options.meta = false;
      test(errorception).identify('id');
      assert(!window._errs);
    });
  });

});
