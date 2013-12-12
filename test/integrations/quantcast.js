
describe('Quantcast', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Quantcast = require('integrations/lib/quantcast');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var quantcast;
  var settings = {
    pCode: 'x'
  };

  beforeEach(function () {
    analytics.use(Quantcast);
    quantcast = new Quantcast.Integration(settings);
    quantcast.initialize(); // noop
  });

  afterEach(function () {
    quantcast.reset();
    analytics.user().reset();
  });

  it('should have the right settings', function () {
    test(quantcast)
      .name('Quantcast')
      .assumesPageview()
      .readyOnInitialize()
      .global('_qevents')
      .global('__qc')
      .option('pCode', null);
  });

  describe('#initialize', function () {
    beforeEach(function () {
      sinon.stub(quantcast, 'load');
    });

    it('should push the pCode', function () {
      quantcast.initialize();
      assert(window._qevents[0].qacct === settings.pCode);
    });

    it('should push the user id', function () {
      analytics.user().identify('id');
      quantcast.initialize();
      assert(window._qevents[0].uid === 'id');
    });

    it('should call #load', function () {
      quantcast.initialize();
      assert(quantcast.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window.__qc', function () {
      assert(!quantcast.loaded());
      window.__qc = {};
      assert(quantcast.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(quantcast, 'load');
      quantcast.initialize();
      quantcast.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!quantcast.loaded());
      quantcast.load(function (err) {
        if (err) return done(err);
        assert(quantcast.loaded());
        done();
      });
    });
  });

  describe('#page', function () {
    beforeEach(function () {
      quantcast.initialize();
    });

    it('should push a refresh event', function () {
      test(quantcast).page();
      var item = window._qevents[1];
      assert(item.event === 'refresh');
    });

    it('should push the pCode', function () {
      test(quantcast).page();
      var item = window._qevents[1];
      assert(item.qacct === settings.pCode);
    });

    it('should push the user id', function () {
      analytics.user().identify('id');
      test(quantcast).page();
      var item = window._qevents[1];
      assert(item.uid === 'id');
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      quantcast.initialize();
    });

    it('should update the user id', function () {
      test(quantcast).identify('id');
      assert(window._qevents[0].uid === 'id');
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      quantcast.initialize();
    });

    it('should push a click event', function () {
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.event === 'click');
    });

    it('should push the pCode', function () {
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.qacct === settings.pCode);
    });

    it('should push the user id', function () {
      analytics.user().identify('id');
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.uid === 'id');
    });
  });

});
