
describe('AdRoll', function(){

  var test = require('analytics.js-integration-tester');
  var analytics = require('analytics.js');
  var assert = require('assert');
  var equal = require('equals');
  var sinon = require('sinon');
  var AdRoll = require('./');

  var adroll;
  var settings = {
    advId: 'LYFRCUIPPZCCTOBGRH7G32',
    pixId: 'V7TLXL5WWBA5NOU5MOJQW4'
  };

  beforeEach(function(){
    analytics.use(AdRoll);
    adroll = new AdRoll.Integration(settings);
    adroll.initialize(); // noop
  });

  afterEach(function(){
    adroll.reset();
    analytics.user().reset();
  });

  it('should have the right settings', function(){
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

  describe('#initialize', function(){
    beforeEach(function(){
      adroll.load = sinon.spy();
    });

    it('should delete adroll_conversion_value_in_dollars', function(){
      window.adroll_conversion_value_in_dollars = 49.95;
      adroll.initialize();
      assert(!window.adroll_conversion_value_in_dollars);
    });

    it('should initialize the adroll variables', function(){
      adroll.initialize();
      assert(window.adroll_adv_id === settings.advId);
      assert(window.adroll_pix_id === settings.pixId);
    });

    it('should not set a user id', function(){
      analytics.user().identify('id');
      adroll.initialize();
      assert(window.adroll_custom_data == null);
    });

    it('should set window.__adroll_loaded', function(){
      adroll.initialize();
      assert(window.__adroll_loaded === true);
    });

    it('should call #load', function(){
      adroll.initialize();
      assert(adroll.load.called);
    });
  });

  describe('#loaded', function(){
    after(function(){
      window.__adroll = undefined;
    });

    it('should test window.__adroll', function(){
      assert(!adroll.loaded());
      window.__adroll = {};
      assert(adroll.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(adroll, 'load');
      adroll.initialize();
      adroll.load.restore();
    });

    it('should change loaded state', function(done){
      assert(!adroll.loaded());
      adroll.load(function(err){
        if (err) return done(err);
        setTimeout(function(){
          assert(adroll.loaded());
          done();
        }, 1000);
      });
    });
  });

  describe('#page', function(){
    beforeEach(function(done){
      adroll.on('ready', done);
      adroll.initialize();
      window.__adroll.record_user = sinon.spy();
    });

    it('should track page view with fullName', function(){
      test(adroll).page('Category', 'Name');
      assert(window.__adroll.record_user.calledWith({
        adroll_segments: 'Viewed Category Name Page'
      }));
    });

    it('should track unnamed/categorized page', function(){
      test(adroll).page();
      assert(window.__adroll.record_user.calledWith({
        adroll_segments: 'Loaded a Page'
      }));
    });

    it('should track unnamed page', function(){
      test(adroll).page('Category');
      assert(window.__adroll.record_user.calledWith({
        adroll_segments: 'Loaded a Page'
      }));
    });

    it('should track uncategorized page', function(){
      test(adroll).page(null, 'Name');
      assert(window.__adroll.record_user.calledWith({
        adroll_segments: 'Viewed Name Page'
      }));
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      window.__adroll.record_user = sinon.spy();
    });

    describe('event not in events', function(){
      it('should send events with only adroll_segments', function(){
        test(adroll).track('event', {});
        assert(window.__adroll.record_user.calledWith({
          adroll_segments: 'event'
        }));
      });

      it('should send events without revenue and order id', function(){
        test(adroll).track('event', { revenue: 3.99 });
        assert(window.__adroll.record_user.calledWith({
          adroll_segments: 'event'
        }));
      });

      it('should pass user id in', function(){
        analytics.user().identify('id');
        test(adroll).track('event', { revenue: 3.99 });
        assert(window.__adroll.record_user.calledWith({
          adroll_segments: 'event',
          user_id: 'id'
        }));
      });
    });

    describe('event in events', function(){
      beforeEach(function(){
        adroll.options.events = { event: 'segment' };
      });

      it('should pass in revenue and order id', function(){
        test(adroll).track('event', { total: 1.99, orderId: 1 });
        assert(window.__adroll.record_user.calledWith({
          adroll_segments: 'segment',
          adroll_conversion_value_in_dollars: 1.99,
          order_id: 1
        }));
      });

      it('should pass .revenue as conversion value', function(){
        test(adroll).track('event', { revenue: 2.99 });
        assert(window.__adroll.record_user.calledWith({
          adroll_segments: 'segment',
          adroll_conversion_value_in_dollars: 2.99,
          order_id: 0
        }));
      });

      it('should include the user_id when available', function(){
        analytics.user().identify('id');
        test(adroll).track('event', { revenue: 3.99 });
        assert(window.__adroll.record_user.calledWith({
          adroll_segments: 'segment',
          adroll_conversion_value_in_dollars: 3.99,
          order_id: 0,
          user_id: 'id'
        }));
      });
    });
  });
});
