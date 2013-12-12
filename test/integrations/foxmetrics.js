
describe('FoxMetrics', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var FoxMetrics = require('integrations/lib/foxmetrics');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var foxmetrics;
  var settings = {
    appId: '5135085424023236bca9c08c'
  };

  beforeEach(function () {
    analytics.use(FoxMetrics);
    foxmetrics = new FoxMetrics.Integration(settings);
    foxmetrics.initialize(); // noop
  });

  afterEach(function () {
    foxmetrics.reset();
  });

  it('should have the right settings', function () {
    test(foxmetrics)
      .name('FoxMetrics')
      .assumesPageview()
      .readyOnInitialize()
      .global('_fxm')
      .option('appId', '');
  });

  describe('#initialize', function () {
    it('should call #load', function () {
      foxmetrics.load = sinon.spy();
      foxmetrics.initialize();
      assert(foxmetrics.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._fxm.appId', function () {
      window._fxm = [];
      assert(!foxmetrics.loaded());
      window._fxm.appId = settings.appId;
      assert(foxmetrics.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(foxmetrics, 'load');
      foxmetrics.initialize();
      foxmetrics.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!foxmetrics.loaded());
      foxmetrics.load(function (err) {
        if (err) return done(err);
        assert(foxmetrics.loaded());
        done();
      });
    });
  });

  describe('#page', function () {
    beforeEach(function () {
      foxmetrics.initialize();
      window._fxm.push = sinon.spy();
    });


    it('should send a page view', function () {
      test(foxmetrics).page();
      assert(window._fxm.push.calledWith([
        '_fxm.pages.view',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      ]));
    });

    it('should send page properties', function () {
      test(foxmetrics).page('category', 'name', {
        referrer: 'referrer',
        title: 'title',
        url: 'url'
      });

      assert(window._fxm.push.calledWith([
        '_fxm.pages.view',
        'title',
        'name',
        'category',
        'url',
        'referrer'
      ]));
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      foxmetrics.initialize();
      window._fxm.push = sinon.spy();
    });

    it('should send an id', function () {
      test(foxmetrics)
        .identify('id')
        .called(window._fxm.push)
        .with([
          '_fxm.visitor.profile',
          'id',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { id: 'id' }
        ]);
    });

    it('should not only send traits', function () {
      test(foxmetrics).identify(null, { trait: true });
      assert(!window._fxm.push.called);
    });

    it('should send an id and traits', function () {
      test(foxmetrics).identify('id', {
        address: 'address',
        email: 'email@example.com',
        firstName: 'first',
        lastName: 'last',
        trait: true
      });
      assert(window._fxm.push.calledWith([
        '_fxm.visitor.profile',
        'id',
        'first',
        'last',
        'email@example.com',
        'address',
        undefined,
        undefined,
        {
          address: 'address',
          email: 'email@example.com',
          firstName: 'first',
          lastName: 'last',
          trait: true,
          id: 'id'
        }
      ]));
    });

    it('should split a name trait', function () {
      test(foxmetrics).identify('id', { name: 'first last' });
      assert(window._fxm.push.calledWith([
        '_fxm.visitor.profile',
        'id',
        'first',
        'last',
        undefined,
        undefined,
        undefined,
        undefined,
        {
          name: 'first last',
          id: 'id'
        }
      ]));
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      foxmetrics.initialize();
      window._fxm.push = sinon.spy();
    });


    it('should send an event', function () {
      test(foxmetrics).track('event');
      assert(window._fxm.push.calledWith([
        'event',
        undefined,
        {}
      ]));
    });

    it('should send an event and properties', function () {
      test(foxmetrics).track('event', { property: true });
      assert(window._fxm.push.calledWith([
        'event',
        undefined,
        { property: true }
      ]));
    });

    it('should send a category property', function () {
      test(foxmetrics).track('event', { category: 'category' });
      assert(window._fxm.push.calledWith([
        'event',
        'category',
        { category: 'category' }
      ]));
    });

    it('should send a stored category', function () {
      test(foxmetrics).page('category');
      test(foxmetrics).track('event', { category: 'category' });
      assert(window._fxm.push.calledWith([
        '_fxm.pages.view',
        undefined,
        undefined,
        'category',
        undefined,
        undefined
      ]));
    });
  });

});
