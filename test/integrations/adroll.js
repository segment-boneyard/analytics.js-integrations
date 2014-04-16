
describe('AdRoll', function () {

  var AdRoll = require('integrations/lib/adroll');
  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var adroll;
  var settings = {
    advId: 'LYFRCUIPPZCCTOBGRH7G32',
    pixId: 'V7TLXL5WWBA5NOU5MOJQW4'
  };

  beforeEach(function () {
    analytics.use(AdRoll);
    adroll = new AdRoll.Integration(settings);
    adroll.initialize(); // noop
  });

  afterEach(function () {
    adroll.reset();
    analytics.user().reset();
  });

  it('should have the right settings', function () {
    test(adroll)
      .name('AdRoll')
      .assumesPageview()
      .readyOnLoad()
      .global('__adroll_loaded')
      .global('adroll_adv_id')
      .global('adroll_pix_id')
      .global('adroll_custom_data')
      .option('advId', '')
      .option('pixId', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      adroll.load = sinon.spy();
    });

    it('should initialize the adroll variables', function () {
      adroll.initialize();
      assert(window.adroll_adv_id === settings.advId);
      assert(window.adroll_pix_id === settings.pixId);
    });

    it('should set a user id', function () {
      analytics.user().identify('id');
      adroll.initialize();
      assert(equal(window.adroll_custom_data, { USER_ID: 'id' }));
    });

    it('should set window.__adroll_loaded', function () {
      adroll.initialize();
      assert(window.__adroll_loaded === true);
    });

    it('should call #load', function () {
      adroll.initialize();
      assert(adroll.load.called);
    });
  });

  describe('#loaded', function () {
    after(function () {
      window.__adroll = undefined;
    });

    it('should test window.__adroll', function () {
      assert(!adroll.loaded());
      window.__adroll = {};
      assert(adroll.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(adroll, 'load');
      adroll.initialize();
      adroll.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!adroll.loaded());
      adroll.load(function (err) {
        if (err) return done(err);
        setTimeout(function () {
          assert(adroll.loaded());
          done();
        }, 1000);
      });
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      window.__adroll.record_user = sinon.spy();
    })

    it('should send events', function(){
      test(adroll).track('event', {});
      assert(window.__adroll.record_user.calledWith({
        adroll_segments: 'event',
        adroll_conversion_value_in_dollars: 0,
        order_id: 0
      }));
    })

    it('should track Completed Order', function(){
      test(adroll).track('Completed Order', { total: 1.99, orderId: 1 });
      assert(window.__adroll.record_user.calledWith({
        adroll_segments: 'Completed Order',
        adroll_conversion_value_in_dollars: 1.99,
        order_id: 1
      }));
    })

    it('should pass .revenue as conversion value', function(){
      test(adroll).track('purchase', { revenue: 2.99 });
      assert(window.__adroll.record_user.calledWith({
        adroll_segments: 'purchase',
        adroll_conversion_value_in_dollars: 2.99,
        order_id: 0
      }));
    })

    it('should respect .events option', function(){
      adroll.options.events = { event: 'segment' };
      test(adroll).track('event', { revenue: 3.99 });
      assert(window.__adroll.record_user.calledWith({
        adroll_segments: 'segment',
        adroll_conversion_value_in_dollars: 3.99,
        order_id: 0
      }));
    })
  })

});
