
describe('trak.io', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var each = require('each');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var Trakio = require('integrations/lib/trakio');
  var tick = require('next-tick');
  var when = require('when');

  var trakio;
  var settings = {
    token: '740d36a79fb593bbc034a3ac934bc04f5a591c0c'
  };

  beforeEach(function () {
    analytics.use(Trakio);
    trakio = new Trakio.Integration(settings);
    trakio.initialize(); // noop
  });

  afterEach(function () {
    trakio.reset();
  });

  it('should store the right settings', function () {
    test(trakio)
      .name('trak.io')
      .assumesPageview()
      .readyOnInitialize()
      .global('trak')
      .option('token', '')
      .option('trackNamedPages', true);
  });

  describe('#initialize', function () {
    beforeEach(function () {
      trakio.load = sinon.spy();
    });

    it('should set up the window.trak.io variables', function () {
      trakio.initialize();
      assert(window.trak.io);
      assert(window.trak.io.identify);
      assert(window.trak.io.track);
      assert(window.trak.io.alias);
    });

    it('should call #load', function () {
      trakio.initialize();
      assert(trakio.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window.trak.loaded', function () {
      window.trak = {};
      assert(!trakio.loaded());
      window.trak.loaded = true;
      assert(trakio.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(trakio, 'load');
      trakio.initialize();
      trakio.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!trakio.loaded());
      trakio.load(function (err) {
        if (err) return done(err);
        // doesn't load immediately
        when(function () {
          return trakio.loaded();
        }, done);
      });
    });
  });

  describe('#page', function () {
    beforeEach(function (done) {
      trakio.initialize();
      trakio.once('load', function () {
        sinon.stub(window.trak.io, 'page_view');
        sinon.stub(window.trak.io, 'track');
        done();
      });
    });

    it('should call page_view', function () {
      test(trakio).page();
      assert(window.trak.io.page_view.called);
    });

    it('should send a path and title', function () {
      test(trakio).page(null, null, { path: '/path', title: 'title' });
      assert(window.trak.io.page_view.calledWith('/path', 'title'));
    });

    it('should prefer a name', function () {
      test(trakio).page(null, 'name', { title: 'title' });
      assert(window.trak.io.page_view.calledWith(undefined, 'name'));
    });

    it('should prefer a category and name', function () {
      test(trakio).page('category', 'name', { title: 'title' });
      assert(window.trak.io.page_view.calledWith(undefined, 'category name'));
    });

    it('should track named pages by default', function () {
      test(trakio).page(null, 'Name');
      assert(window.trak.io.track.calledWith('Viewed Name Page'));
    });

    it('should track named pages with categories', function () {
      test(trakio).page('Category', 'Name');
      assert(window.trak.io.track.calledWith('Viewed Category Name Page'));
    });

    it('should track categorized pages by default', function () {
      test(trakio).page('Category', 'Name');
      assert(window.trak.io.track.calledWith('Viewed Category Page'));
    });

    it('should not track named or categorized pages if the option is off', function () {
      trakio.options.trackNamedPages = false;
      trakio.options.trackCategorizedPages = false;
      test(trakio).page(null, 'Name');
      test(trakio).page('Category', 'Name');
      assert(!window.trak.io.track.called);
    });
  });

  describe('#identify', function () {
    beforeEach(function (done) {
      trakio.initialize();
      trakio.once('load', function () {
        window.trak.io.identify = sinon.spy();
        done();
      });
    });

    it('should send id', function () {
      test(trakio)
        .identify('id')
        .called(window.trak.io.identify)
        .with('id', { id: 'id' });
    });

    it('should send traits', function () {
      test(trakio).identify(null, { trait: true });
      assert(window.trak.io.identify.calledWith({ trait: true }));
    });

    it('should send an id and traits', function () {
      test(trakio)
        .identify('id', { trait: true })
        .called(window.trak.io.identify)
        .with('id', { trait: true, id: 'id' });
    });

    it('should alias traits', function () {
      test(trakio).identify(null, {
        avatar: 'avatar',
        firstName: 'first',
        lastName: 'last'
      });
      assert(window.trak.io.identify.calledWith({
        avatar_url: 'avatar',
        first_name: 'first',
        last_name: 'last'
      }));
    });
  });

  describe('#track', function () {
    beforeEach(function (done) {
      trakio.initialize();
      trakio.once('load', function () {
        window.trak.io.track = sinon.spy();
        done();
      });
    });

    it('should send an event', function () {
      test(trakio).track('event');
      assert(window.trak.io.track.calledWith('event'));
    });

    it('should send an event and properties', function () {
      test(trakio).track('event', { property: true });
      assert(window.trak.io.track.calledWith('event', { property: true }));
    });
  });

  describe('#alias', function () {
    beforeEach(function (done) {
      trakio.initialize();
      trakio.once('load', function () {
        tick(function () {
          window.trak.io.distinct_id = sinon.stub();
          window.trak.io.alias = sinon.spy();
          done();
        });
      });
    });

    it('should send a new id', function () {
      test(trakio).alias('new');
      assert(window.trak.io.alias.calledWith('new'));
    });

    it('should send a new id and an original id', function () {
      test(trakio).alias('another', 'original');
      assert(window.trak.io.alias.calledWith('original', 'another'));
    });
  });
});
