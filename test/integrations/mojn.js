
describe('Mojn', function(){

  var Mojn      = require('integrations/lib/mojn');
  var test      = require('integration-tester');
  var analytics = require('analytics');
  var assert    = require('assert');
  var sinon     = require('sinon');
  var mojn;

  var settings = {
    customerCode: 'EWBCK'
  };

  beforeEach(function(){
    analytics.use(Mojn);
    mojn = new Mojn.Integration(settings);
    mojn.initialize();
  });

  afterEach(function () {
    mojn.reset();
  });

  it('should have the correct default settings', function(){
    test(mojn)
      .name('Mojn')
      .readyOnInitialize()
      .global('_mojnTrack')
      .option('customerCode', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      mojn.load = sinon.spy();
    });

    it('should call #load', function () {
      mojn.initialize();
      assert(mojn.load.called);
    });

    it('should pass customerCode to tracker script', function() {
      window._mojnTrack = { push: sinon.spy() };
      mojn.initialize();
      assert(window._mojnTrack.push.calledWith({ cid: settings.customerCode }));
    });
  });

  describe('#loaded', function() {
    it('tests array-ness of _mojnTrack', function() {
      delete window._mojnTrack;
      assert(!mojn.loaded());
      window._mojnTrack = [];
      assert(!mojn.loaded());
      window._mojnTrack = {};
      assert(mojn.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(mojn, 'load');
      mojn.load.restore();
    });

    it('should change loaded state', function(done){
      delete window._mojnTrack;
      test(mojn).loads(done);
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      sinon.spy(mojn, 'track');
      window._mojnTrack = { push: sinon.spy() };
    });

    afterEach(function(){
      mojn.track.reset();
    });

    it('should ignore if revenue is not set', function(){
      test(mojn).track('some sale', {});
      assert(!window._mojnTrack.push.called);
    });

    it('should track if revenue is set (no currency)', function(){
      test(mojn).track('some sale', { revenue: 42 });
      assert(window._mojnTrack.push.calledWith({ conv: '42' }));
    });

    it('should track if revenue is set (with currency)', function(){
      test(mojn).track('some sale', { revenue: 42, currency: 'DKK' });
      assert(window._mojnTrack.push.calledWith({ conv: 'DKK42' }));
    });
  });

  describe('#identify', function() {
    beforeEach(function() {
      sinon.spy(mojn, 'identify');
    });

    afterEach(function() {
      mojn.identify.reset();
    });

    it('should ignore if missing email', function() {
      test(mojn).identify(null, { anything: 'but an email' });
      var img = mojn.identify.returnValues[0];
      assert(null == img);
    });

    it('should track if email is set', function() {
      var email = 'test@test.mojn.com';
      test(mojn).identify(null, { email: email });
      var img = mojn.identify.returnValues[0];
      var expect = window.location.protocol + '//matcher.idtargeting.com/analytics.gif?cid=' + settings.customerCode + '&_mjnctid=' + email;
      assert(expect == img.src);
    });
  });
});
