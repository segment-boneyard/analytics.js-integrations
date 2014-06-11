
describe('Woopra', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var Woopra = require('integrations/lib/woopra');

  var woopra;
  var settings = {
    domain: 'x',
    outgoingTracking: false
  };

  beforeEach(function () {
    analytics.use(Woopra);
    woopra = new Woopra.Integration(settings);
  });

  afterEach(function () {
    woopra.reset();
  });

  it('should have the right settings', function () {
    test(woopra)
      .name('Woopra')
      .readyOnLoad()
      .global('woopra')
      .option('domain', '')
      .option('cookieName', 'wooTracker')
      .option('cookieDomain', null)
      .option('cookiePath', '/')
      .option('ping', true)
      .option('pingInterval', 12000)
      .option('idleTimeout', 300000)
      .option('downloadTracking', true)
      .option('outgoingTracking', true)
      .option('outgoingIgnoreSubdomain', true)
      .option('downloadPause', 200)
      .option('outgoingPause', 400)
      .option('ignoreQueryUrl', true)
      .option('hideCampaign', false);
  });

  describe('#loaded', function () {
    it('should test window.woopra.loaded', function () {
      window.woopra = {};
      assert(!woopra.loaded());
      window.woopra.loaded = true;
      assert(woopra.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(woopra, 'load');
      woopra.initialize();
      woopra.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!woopra.loaded());
      woopra.load(function (err) {
        if (err) return done(err);
        assert(woopra.loaded());
        done();
      });
    });
  });

  describe('#initialize', function () {
    beforeEach(function () {
      woopra.load = sinon.spy();
    });

    it('should create a woopra object', function () {
      assert(!window.woopra);
      woopra.initialize();
      assert(window.woopra);
    });

    it('should configure woopra', function(){
      woopra.initialize();
      assert.deepEqual(window.woopra._e, [
        ['config', 'domain', 'x'],
        ['config', 'outgoing_tracking', false],
        ['config', 'cookie_name', 'wooTracker'],
        ['config', 'cookie_path', '/'],
        ['config', 'ping', true],
        ['config', 'ping_interval', 12000],
        ['config', 'idle_timeout', 300000],
        ['config', 'download_tracking', true],
        ['config', 'outgoing_ignore_subdomain', true],
        ['config', 'download_pause', 200],
        ['config', 'outgoing_pause', 400],
        ['config', 'ignore_query_url', true],
        ['config', 'hide_campaign', false]
      ]);
    })

    it('should not send options if they are null, or empty', function(){
      var opts = woopra.options;
      opts.domain = '';
      opts.cookieName = '';
      opts.cookiePath = null;
      opts.ping = null;
      opts.pingInterval = null;
      opts.idleTimeout = null;
      opts.downloadTracking = null;
      opts.outgoingTracking = null;
      opts.outgoingIgnoreSubdomain = null;
      opts.downloadPause = '';
      opts.outgoingPause = '';
      opts.ignoreQueryUrl = null;
      opts.hideCampaign = null;
      woopra.initialize();
      assert.deepEqual([], window.woopra._e);
    })

    it('should call #load', function () {
      woopra.initialize();
      assert(woopra.load.called);
    });
  });

  describe('#page', function () {
    beforeEach(function () {
      woopra.initialize();
      window.woopra.track = sinon.spy();
    });

    it('should send a page view', function () {
      test(woopra).page();
      assert(window.woopra.track.calledWith('pv', {}));
    });

    it('should send a title', function () {
      test(woopra).page(null, null, { title: 'title' });
      assert(window.woopra.track.calledWith('pv', { title: 'title' }));
    });

    it('should prefer a name', function () {
      test(woopra).page(null, 'name', { title: 'title' });
      assert(window.woopra.track.calledWith('pv', { title: 'name', name: 'name' }));
    });

    it('should prefer a category and name', function () {
      test(woopra).page('category', 'name', { title: 'title' });
      assert(window.woopra.track.calledWith('pv', {
        title: 'category name',
        category: 'category',
        name: 'name'
      }));
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      woopra.initialize();
      // woopra identify has other methods on it
      window.woopra.identify = sinon.spy(window.woopra, 'identify');
    });

    it('should send an id', function () {
      test(woopra).identify('id');
      assert(window.woopra.identify.calledWith({ id: 'id' }));
    });

    it('should send traits', function () {
      test(woopra).identify(null, { trait: true });
      assert(window.woopra.identify.calledWith({ trait: true }));
    });

    it('should send an id and traits', function () {
      test(woopra).identify('id', { trait: true });
      assert(window.woopra.identify.calledWith({ id: 'id', trait: true }));
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      woopra.initialize();
      window.woopra.track = sinon.spy();
    });

    it('should send an event', function () {
      test(woopra).track('event');
      assert(window.woopra.track.calledWith('event'));
    });

    it('should send properties', function () {
      test(woopra).track('event', { property: 'Property' });
      assert(window.woopra.track.calledWith('event', { property: 'Property' }));
    });
  });
});

