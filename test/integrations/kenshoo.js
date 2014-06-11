
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

  beforeEach(function(){
    kenshoo = new Kenshoo.Integration(settings);
    kenshoo.initialize();
  });

  afterEach(function(){
    kenshoo.reset();
  });

  it('should have the right settings', function(){
    test(kenshoo)
      .name('Kenshoo')
      .readyOnLoad()
      .global('k_trackevent')
      .option('cid', '')
      .option('subdomain', '')
      .option('events', []);
  });

  describe('#initialize', function(){
    beforeEach(function(){
      sinon.spy(kenshoo, 'load');
    });

    it('should call #load', function(){
      kenshoo.initialize();
      assert(kenshoo.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.k_trackevent', function(){
      assert( ! kenshoo.loaded());
      window.k_trackevent = {};
      assert( ! kenshoo.loaded());
      window.k_trackevent = function() {};
      assert(kenshoo.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(kenshoo, 'load');
      kenshoo.initialize();
      kenshoo.load.restore();
    });

    it('should change loaded state', function(done){
      assert(!kenshoo.loaded());
      kenshoo.load(function(err){
        if (err) return done(err);
        assert(kenshoo.loaded());
        done();
      });
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      kenshoo.initialize();
      window.k_trackevent = sinon.stub();
    });

    afterEach(function(){
      kenshoo.options.events = [];
    });

    it('should track custom events', function(){
      kenshoo.options.events = [ 'event' ];
      test(kenshoo).track('event', {
        revenue: '42',
        orderId: '84',
        coupon: 'promo',
        currency: 'EUR',
      });

      assert(window.k_trackevent.calledWith([
        'id=' + settings.cid,
        'type=conv',
        'val=42',
        'orderId=84',
        'promoCode=promo',
        'valueCurrency=EUR',
        'GCID=',
        'kw=',
        'product='
      ], settings.subdomain));
    });

    it('should not track undefined events', function(){
      test(kenshoo).track('random', {
        revenue: '42',
        orderId: '84',
        coupon: 'promo',
        currency: 'EUR',
      });
      
      assert(!window.k_trackevent.called);
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      window.k_trackevent = sinon.stub();
    });

    it('should not make any event calls', function(){
      test(kenshoo).page();
      assert(!window.k_trackevent.called);
    });
  });
});