
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Mojn = require('./');

describe('Mojn', function() {
  var analytics;
  var mojn;
  var options = {
    customerCode: 'EWBCK'
  };

  beforeEach(function() {
    analytics = new Analytics();
    mojn = new Mojn(options);
    analytics.use(Mojn);
    analytics.use(tester);
    analytics.add(mojn);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    mojn.reset();
    sandbox();
  });

  it('should have the correct default settings', function() {
    analytics.compare(Mojn, integration('Mojn')
      .global('_mojnTrack')
      .option('customerCode', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(mojn, 'load');
    });

    describe('#initialize', function() {
      it('should call #load', function() {
        analytics.initialize();
        analytics.page();
        analytics.called(mojn.load);
      });

      it('should pass customerCode to tracker script', function() {
        window._mojnTrack = [];
        analytics.stub(window._mojnTrack, 'push');
        analytics.initialize();
        analytics.page();
        analytics.called(window._mojnTrack.push, { cid: options.customerCode });
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(mojn, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window._mojnTrack, 'push');
      });

      it('should ignore if revenue is not set', function() {
        analytics.track('some sale', {});
        analytics.didNotCall(window._mojnTrack.push);
      });

      it('should track if revenue is set (no currency)', function() {
        analytics.track('some sale', { revenue: 42 });
        analytics.called(window._mojnTrack.push, { conv: '42' });
      });

      it('should track if revenue is set (with currency)', function() {
        analytics.track('some sale', { revenue: 42, currency: 'DKK' });
        analytics.called(window._mojnTrack.push, { conv: 'DKK42' });
      });
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.spy(mojn, 'identify');
      });

      it('should not error', function(done) {
        analytics.identify({ email: 'foo@baz.com' });
        var img = mojn.identify.returns[0];
        img.onload = function() { done(); };
        img.onerror = function() { done(new Error('error loading ' + img.src)); };
      });

      it('should ignore if missing email', function() {
        analytics.identify({ anything: 'but an email' });
        var img = mojn.identify.returns[0];
        analytics.assert(img == null);
      });

      it('should track if email is set', function() {
        var email = 'test@test.mojn.com';
        analytics.identify({ email: email });
        var img = mojn.identify.returns[0];
        var expected = window.location.protocol + '//matcher.idtargeting.com/identify.gif?cid=' + options.customerCode + '&_mjnctid=' + email;
        analytics.assert(img.src === expected);
      });
    });
  });
});
