
describe('Customer.io', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Customerio = require('integrations/lib/customerio');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var customerio;
  var settings = {
    siteId: 'x'
  };

  beforeEach(function () {
    analytics.use(Customerio);
    customerio = new Customerio.Integration(settings);
    customerio.initialize(); // noop
  });

  afterEach(function () {
    customerio.reset();
    analytics.user().reset();
  });

  it('should have the right settings', function () {
    test(customerio)
      .name('Customer.io')
      .assumesPageview()
      .readyOnInitialize()
      .global('_cio')
      .option('siteId', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      sinon.stub(customerio, 'load');
    });

    it('should create the window._cio object', function () {
      assert(!window._cio);
      customerio.initialize();
      assert(window._cio);
    });

    it('should call #load', function () {
      customerio.initialize();
      assert(customerio.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._cio.pageHasLoaded', function () {
      assert(!customerio.loaded());
      window._cio = [];
      window._cio.push = function(){};
      assert(customerio.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(customerio, 'load');
      customerio.initialize();
      customerio.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!customerio.loaded());
      customerio.load(function (err) {
        if (err) return done(err);
        assert(customerio.loaded());
        done();
      });
    });
  });

  describe('#identify', function () {
    beforeEach(function (done) {
      customerio.initialize();
      customerio.once('load', function () {
        window._cio.identify = sinon.spy();
        setTimeout(done, 50);
      });
    });

    it('should send an id', function () {
      test(customerio).identify('id', {});
      assert(window._cio.identify.calledWith({ id: 'id' }));
    });

    it('should not send only traits', function () {
      test(customerio).identify(null, { trait: true });
      assert(!window._cio.identify.called);
    });

    it('should send an id and traits', function () {
      test(customerio).identify('id', { trait: true });
      assert(window._cio.identify.calledWith({ id: 'id', trait: true }));
    });

    it('should convert dates', function () {
      var date = new Date();
      test(customerio).identify('id', { date: date });
      assert(window._cio.identify.calledWith({
        id: 'id',
        date: Math.floor(date / 1000)
      }));
    });

    it('should alias created to created_at', function () {
      var date = new Date();
      test(customerio).identify('id', { created: date });
      assert(window._cio.identify.calledWith({
        id: 'id',
        created_at: Math.floor(date / 1000)
      }));
    });
  });

  describe('#group', function () {
    beforeEach(function (done) {
      analytics.user().identify('id');
      customerio.initialize();
      customerio.once('load', function () {
        window._cio.identify = sinon.spy();
        setTimeout(done, 50);
      });
    });

    it('should send an id', function () {
      test(customerio).group('id', {});
      assert(window._cio.identify.calledWith({ id: 'id', 'Group id': 'id' }));
    });

    it('should send traits', function () {
      test(customerio).group(null, { trait: true });
      assert(window._cio.identify.calledWith({ id: 'id', 'Group trait': true }));
    });

    it('should send an id and traits', function () {
      test(customerio).group('id', { trait: true });
      assert(window._cio.identify.calledWith({
        id: 'id',
        'Group id': 'id',
        'Group trait': true
      }));
    });

    it('should convert dates', function () {
      var date = new Date();
      test(customerio).group(null, { date: date });
      assert(window._cio.identify.calledWith({
        id: 'id',
        'Group date': Math.floor(date / 1000)
      }));
    });
  });

  describe('#track', function () {
    beforeEach(function (done) {
      customerio.initialize();
      customerio.once('load', function () {
        window._cio.track = sinon.spy();
        setTimeout(done, 50);
      });
    });

    it('should send an event', function () {
      test(customerio).track('event', {});
      assert(window._cio.track.calledWith('event'));
    });

    it('should send an event and properties', function () {
      test(customerio).track('event', { property: true });
      assert(window._cio.track.calledWith('event', { property: true }));
    });

    it('should convert dates', function () {
      var date = new Date();
      test(customerio).track('event', { date: date });
      assert(window._cio.track.calledWith('event', {
        date: Math.floor(date / 1000)
      }));
    });
  });

});
