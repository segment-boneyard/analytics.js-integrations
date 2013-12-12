
describe('', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var Userfox = require('integrations/lib/userfox');

  var userfox;
  var settings = {
    clientId: '4v2erxr9c5vzqsy35z9gnk6az'
  };

  beforeEach(function () {
    analytics.use(Userfox);
    userfox = new Userfox.Integration(settings);
    userfox.initialize(); // noop
  });

  afterEach(function () {
    userfox.reset();
  });

  it('should store the right settings', function () {
    test(userfox)
      .name('userfox')
      .assumesPageview()
      .global('_ufq')
      .option('clientId', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      userfox.load = sinon.spy();
    });

    it('should create window._ufq', function () {
      assert(!window._ufq);
      userfox.initialize();
      assert(window._ufq instanceof Array);
    });

    it('should call #load', function () {
      userfox.initialize();
      assert(userfox.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._ufq.push', function () {
      window._ufq = [];
      assert(!userfox.loaded());
      window._ufq.push = function(){};
      assert(userfox.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(userfox, 'load');
      userfox.initialize();
      userfox.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!userfox.loaded());
      userfox.load(function (err) {
        if (err) return done(err);
        assert(userfox.loaded());
        done();
      });
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      userfox.initialize();
      window._ufq.push = sinon.spy();
    });

    it('should initialize the library with an email', function () {
      test(userfox).identify('id', { email: 'name@example.com' });
      assert(window._ufq.push.calledWith(['init', {
        clientId: settings.clientId,
        email: 'name@example.com'
      }]));
    });

    it('should send traits', function () {
      test(userfox).identify(null, { email: 'name@example.com', trait: true });
      assert(window._ufq.push.calledWith(['track', {
        email: 'name@example.com',
        trait: true
      }]));
    });

    it('should convert dates to a format userfox supports', function () {
      var date = new Date();
      test(userfox).identify(null, {
        email: 'name@example.com',
        date: date
      });
      assert(window._ufq.push.calledWith(['track', {
        email: 'name@example.com',
        date: Math.round(date.getTime() / 1000).toString()
      }]));
    });

    it('should alias a created trait to signup_date', function () {
      var date = new Date();
      test(userfox).identify(null, {
        email: 'name@example.com',
        created: date
      });
      assert(window._ufq.push.calledWith(['track', {
        email: 'name@example.com',
        signup_date: Math.round(date.getTime() / 1000).toString()
      }]));
    });
  });
});
