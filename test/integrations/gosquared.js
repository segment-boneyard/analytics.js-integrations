
describe('GoSquared', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var GoSquared = require('integrations/lib/gosquared');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var gosquared;
  var settings = {
    siteToken: 'x'
  };

  beforeEach(function () {
    analytics.use(GoSquared);
    gosquared = new GoSquared.Integration(settings);
    gosquared.initialize(); // noop
  });

  afterEach(function () {
    gosquared.reset();
    analytics.user().reset();
  });

  it('should have the right settings', function () {
    test(gosquared)
      .name('GoSquared')
      .assumesPageview()
      .readyOnLoad()
      .global('_gs')
      .option('siteToken', '')
      .option('anonymizeIP', false)
      .option('cookieDomain', null)
      .option('useCookies', true)
      .option('trackHash', false)
      .option('trackLocal', false)
      .option('trackParams', true);
  });

  describe('#initialize', function () {
    beforeEach(function () {
      gosquared.load = sinon.spy();
    });

    it('should initialize the _gs global', function () {
      assert(!window._gs);
      gosquared.initialize();
      assert(typeof window._gs === 'function');
    });

    it('should call #load', function () {
      gosquared.initialize();
      assert(gosquared.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._gs.v', function () {
      assert(!gosquared.loaded());
      window._gs = { v: 'version-here' };
      assert(gosquared.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(gosquared, 'load');
      gosquared.initialize();
      gosquared.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!gosquared.loaded());
      gosquared.load(function (err) {
        if (err) return done(err);
        assert(gosquared.loaded());
        done();
      });
    });
  });

  describe('#page', function () {
    beforeEach(function (done) {
      gosquared.initialize();
      gosquared.once('load', function () {
        window._gs = sinon.spy();
        done();
      });
    });

    it('should send a path and title', function () {
      test(gosquared).page(null, null, { path: '/path', title: 'title' });
      assert(window._gs.calledWith('track', '/path', 'title'));
    });

    it('should prefer a name', function () {
      test(gosquared).page(null, 'name', { path: '/path', title: 'title' });
      assert(window._gs.calledWith('track', '/path', 'name'));
    });

    it('should prefer a name and category', function () {
      test(gosquared).page('category', 'name', { path: '/path', title: 'title' });
      assert(window._gs.calledWith('track', '/path', 'category name'));
    });
  });

  describe('#identify', function () {
    beforeEach(function (done) {
      gosquared.initialize();
      gosquared.once('load', done);
    });

    it('should set an id', function () {
      test(gosquared).identify('id');
      assert(window._gs('get', 'visitorID') == 'id');
      assert(window._gs('get', 'visitorName') == 'id');
    });

    it('should set traits', function () {
      test(gosquared).identify(null, { trait: true });
      assert(equal(window._gs('get', 'visitor'), { trait: true }));
    });

    it('should set an id and traits', function () {
      test(gosquared).identify('id', { trait: true });
      assert(window._gs('get', 'visitorID') == 'id');
      assert(window._gs('get', 'visitorName') == 'id');
      assert(equal(window._gs('get', 'visitor'), { userID: 'id', trait: true, id: 'id' }));
    });

    it('should prefer an email for visitor name', function () {
      test(gosquared).identify('id', {
        email: 'email@example.com',
        username: 'username'
      });
      assert(window._gs('get', 'visitorName') == 'email@example.com');
    });

    it('should also prefer a username for visitor name', function () {
      test(gosquared).identify('id', { username: 'username' });
      assert(window._gs('get', 'visitorName') == 'username');
    });
  });

  describe('#track', function () {
    beforeEach(function (done) {
      gosquared.initialize();
      gosquared.once('load', function () {
        window._gs = sinon.spy();
        done();
      });
    });

    it('should send an event', function () {
      test(gosquared).track('event');
      assert(window._gs.calledWith('event', 'event', {}));
    });

    it('should send an event and properties', function () {
      test(gosquared).track('event', { property: true });
      assert(window._gs.calledWith('event', 'event', { property: true }));
    });
  });

});
