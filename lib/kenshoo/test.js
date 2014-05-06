describe('Kenshoo', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Kenshoo = require('integrations/lib/kenshoo');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var kenshoo;
  // Settings taken from https://gist.github.com/justinboyle/7875832
  var settings = {
    cid: 'd590cb3f-ec81-4da7-97d6-3013ec020455',
    subdomain: '1223'
  };

  beforeEach(function() {
    kenshoo = new Kenshoo.Integration(settings);
    kenshoo.initialize();
  });

  afterEach(function() {
    kenshoo.reset();
  });

  it("should have the right settings", function() {
    test(kenshoo)
      .name('Kenshoo')
      .readyOnLoad()
      .global('k_trackevent')
      .option('cid', '')
      .option('subdomain', '')
      .option('trackCategorizedPages', true)
      .option('trackNamedPages', true);
  });

  describe("#initialize", function() {
    beforeEach(function() {
      sinon.spy(kenshoo, 'load');
    });

    it("should call #load", function() {
      kenshoo.initialize();
      assert(kenshoo.load.called);
    });
  });

  describe("#loaded", function() {

    it("should test window.k_trackevent", function() {
      assert( ! kenshoo.loaded());
      window.k_trackevent = {};
      assert( ! kenshoo.loaded());
      window.k_trackevent = function() {};
      assert(kenshoo.loaded());
    });
  });

  describe("#load", function() {
    beforeEach(function(){
      sinon.stub(kenshoo, 'load');
      kenshoo.initialize();
      kenshoo.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!kenshoo.loaded());
      kenshoo.load(function (err) {
        if (err) return done(err);
        assert(kenshoo.loaded());
        done();
      });
    });
  });

  /**
   * Helper fun to return Kenshoo params array.
   */

  function constructParams(params) {
    return [
      "id=" + settings.cid,
      "type=" + params.type,
      "val=" + params.val,
      "orderId=" + params.orderId,
      "promoCode=" + params.promoCode,
      "valueCurrency=" + params.valueCurrency,

      // Live tracking params (currently ignored).
      "GCID=",
      "kw=",
      "product="
    ];
  }

  describe("#completedOrder", function() {
    beforeEach(function(){
      kenshoo.initialize();
      window.k_trackevent = sinon.stub();
    });

    it("should send the correct tracking parameters", function() {
      test(kenshoo).track('completed order', {
        total: "42",
        orderId: "84",
        coupon: "rubberduck",
        currency: "EUR",
      });

      assert(window.k_trackevent.calledWith(
        constructParams({
          type: "completed order",
          val: "42",
          orderId: "84",
          promoCode: "rubberduck",
          valueCurrency: "EUR"
        }), settings.subdomain));
    });

    it("should track `total` and not `revenue` as `val`", function() {
      test(kenshoo).track('completed order', {
        revenue: "1",
        orderId: "84",
        coupon: "rubberduck",
        currency: "EUR",
      });

      assert(window.k_trackevent.calledWith(
        constructParams({
          type: "completed order",
          val: "0.0", // default val
          orderId: "84",
          promoCode: "rubberduck",
          valueCurrency: "EUR"
        }), settings.subdomain));
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      kenshoo.initialize();
      window.k_trackevent = sinon.stub();
    });

    it('should track an unnamed, uncategorized page view', function(){
      test(kenshoo).page();
      kenshoo.options.trackNamedPages = false;
      test(kenshoo).page();
      kenshoo.options.trackCategorizedPages = false;
      test(kenshoo).page();

      assert(window.k_trackevent.alwaysCalledWith(
        constructParams({
          type: "Loaded a Page",
          val: "0.0",
          orderId: "",
          promoCode: "",
          valueCurrency: "USD"
        }), settings.subdomain));
      assert(window.k_trackevent.calledThrice);
    });

    it('should track a named page', function(){
      test(kenshoo).page(null, 'testName');
       assert(window.k_trackevent.calledWith(
        constructParams({
          type: "Viewed testName Page",
          val: "0.0",
          orderId: "",
          promoCode: "",
          valueCurrency: "USD"
        }), settings.subdomain));
    });

    it('should track a name + category page', function(){
      test(kenshoo).page('testCategory', 'testName');
       assert(window.k_trackevent.calledWith(
        constructParams({
          type: "Viewed testCategory testName Page",
          val: "0.0",
          orderId: "",
          promoCode: "",
          valueCurrency: "USD"
        }), settings.subdomain));
    });

    it('should track a categorized page', function(){
      test(kenshoo).page('testCategory');
      assert(window.k_trackevent.calledWith(
        constructParams({
          type: "Viewed testCategory Page",
          val: "0.0",
          orderId: "",
          promoCode: "",
          valueCurrency: "USD"
        }), settings.subdomain));
    });

    it('should not track a named or categorized page when the option is off', function(){
      kenshoo.options.trackNamedPages = false;
      kenshoo.options.trackCategorizedPages = false;
      test(kenshoo).page(null, 'Name');
      test(kenshoo).page('Category', 'Name');
      assert(window.k_trackevent.notCalled);
    });
  });

  describe("#track", function() {
    beforeEach(function(){
      kenshoo.initialize();
      window.k_trackevent = sinon.stub();
    });

    it('should track an event', function(){
      test(kenshoo).track('event');
      var params = constructParams({
         type: "event",
         val: "0.0",
         orderId: "",
         promoCode: "",
         valueCurrency: "USD"
      });
      assert(window.k_trackevent.calledWith(params, settings.subdomain));
    });

    it('should track revenue as `val`', function(){
      test(kenshoo).track('event', {revenue: "10.2"});
      var params = constructParams({
         type: "event",
         val: "10.2",
         orderId: "",
         promoCode: "",
         valueCurrency: "USD"
      });
      assert(window.k_trackevent.calledWith(params, settings.subdomain));
    });

    it("should default `val` to 0.0 if no 'revenue' is set", function() {
      test(kenshoo).track('completed order', {
      });

      assert(window.k_trackevent.calledWith(
        constructParams({
          type: "completed order",
          val: "0.0",
          orderId: "",
          promoCode: "",
          valueCurrency: "USD"
        }), settings.subdomain));
    });
  });
});
