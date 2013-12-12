
describe('LuckyOrange', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var LuckyOrange = require('integrations/lib/lucky-orange');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var lucky;
  var settings = {
    siteId: '17181'
  };

  beforeEach(function () {
    analytics.use(LuckyOrange);
    lucky = new LuckyOrange.Integration(settings);
    lucky.initialize(); // noop
  });

  afterEach(function () {
    lucky.reset();
  });

  it('should have the right settings', function () {
    test(lucky)
      .name('Lucky Orange')
      .assumesPageview()
      .readyOnLoad()
      .global('_loq')
      .global('__wtw_lucky_site_id')
      .global('__wtw_lucky_is_segment_io')
      .option('siteId', null);
  });

  describe('#initialize', function () {
    beforeEach(function () {
      lucky.load = sinon.spy();
    });

    it('should create window._loq', function () {
      assert(!window._loq);
      lucky.initialize();
      assert(window._loq instanceof Array);
    });

    it('should initialize the lucky variables', function () {
      lucky.initialize();
      assert(window.__wtw_lucky_site_id === settings.siteId);
    });

    it('should call #load', function () {
      lucky.initialize();
      assert(lucky.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window.__wtw_watcher_added', function () {
      assert(!lucky.loaded());
      window.__wtw_watcher_added = true;
      assert(lucky.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(lucky, 'load');
      lucky.initialize();
      lucky.load.restore();
    });

    it('should change loaded state', function (done) {
      if (lucky.loaded()) return done(new Error('lucky-orange is already loaded'));
      lucky.load(function (err) {
        if (err) return done(err);
        assert(lucky.loaded());
        done();
      });
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      sinon.stub(lucky, 'load');
      lucky.initialize();
      sinon.stub(window._loq, 'push');
    });

    it('should send an id and traits', function () {
      test(lucky).identify('id', { trait: true });
      assert(window._loq.push.calledWith(['identify', 'id']));
      assert(window._loq.push.calledWith(['set', { trait: true, id: 'id' }]));
    });
  });

});
