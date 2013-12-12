
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
      .global('GoSquared')
      .option('siteToken', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      gosquared.load = sinon.spy();
    });

    it('should initialize the gosquared globals', function () {
      assert(!window.GoSquared);
      gosquared.initialize();
      assert(equal(window.GoSquared, {
        acct: settings.siteToken,
        q: [],
        Visitor: {}
      }));
    });

    it('should store the load time', function () {
      assert(!window._gstc_lt);
      gosquared.initialize();
      assert('number' === typeof window._gstc_lt);
    });

    it('should call #load', function () {
      gosquared.initialize();
      assert(gosquared.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._gs', function () {
      assert(!gosquared.loaded());
      window._gs = {};
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
        window.GoSquared.q.push = sinon.spy();
        done();
      });
    });

    it('should send a path and title', function () {
      test(gosquared).page(null, null, { path: '/path', title: 'title' });
      assert(window.GoSquared.q.push.calledWith(['TrackView', '/path', 'title']));
    });

    it('should prefer a name', function () {
      test(gosquared).page(null, 'name', { path: '/path', title: 'title' });
      assert(window.GoSquared.q.push.calledWith(['TrackView', '/path', 'name']));
    });

    it('should prefer a name and category', function () {
      test(gosquared).page('category', 'name', { path: '/path', title: 'title' });
      assert(window.GoSquared.q.push.calledWith(['TrackView', '/path', 'category name']));
    });
  });

  describe('#identify', function () {
    beforeEach(function (done) {
      gosquared.initialize();
      gosquared.once('load', done);
    });

    it('should set an id', function () {
      test(gosquared).identify('id');
      assert(window.GoSquared.UserName == 'id');
      assert(window.GoSquared.VisitorName == 'id');
    });

    it('should set traits', function () {
      test(gosquared).identify(null, { trait: true });
      assert(equal(window.GoSquared.Visitor, { trait: true }));
    });

    it('should set an id and traits', function () {
      test(gosquared).identify('id', { trait: true });
      assert(window.GoSquared.UserName == 'id');
      assert(window.GoSquared.VisitorName == 'id');
      assert(equal(window.GoSquared.Visitor, { userID: 'id', trait: true, id: 'id' }));
    });

    it('should prefer an email for visitor name', function () {
      test(gosquared).identify('id', {
        email: 'email@example.com',
        username: 'username'
      });
      assert(window.GoSquared.VisitorName == 'email@example.com');
    });

    it('should also prefer a username for visitor name', function () {
      test(gosquared).identify('id', { username: 'username' });
      assert(window.GoSquared.VisitorName == 'username');
    });
  });

  describe('#track', function () {
    beforeEach(function (done) {
      gosquared.initialize();
      gosquared.once('load', function () {
        window.GoSquared.q.push = sinon.spy();
        done();
      });
    });

    it('should send an event', function () {
      test(gosquared).track('event');
      assert(window.GoSquared.q.push.calledWith(['TrackEvent', 'event', {}]));
    });

    it('should send an event and properties', function () {
      test(gosquared).track('event', { property: true });
      assert(window.GoSquared.q.push.calledWith(['TrackEvent', 'event', { property: true }]));
    });
  });

});
