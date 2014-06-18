
var tester = require('analytics.js-integration-tester');
var analytics = require('analytics.js');
var AdRoll = require('./');

describe('AdRoll', function(){
  var adroll;
  var test;
  var settings = {
    advId: 'LYFRCUIPPZCCTOBGRH7G32',
    pixId: 'V7TLXL5WWBA5NOU5MOJQW4'
  };

  beforeEach(function(){
    analytics.use(AdRoll);
    adroll = new AdRoll.Integration(settings);
    test = tester(adroll).spy(adroll, 'load');
  });

  afterEach(function(){
    test.reset();
    analytics.user().reset();
  });

  it('should have the right settings', function(){
    test
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
    it('should initialize the adroll variables', function(){
      test
        .initialize()
        .equal(window.adroll_adv_id, settings.advId)
        .equal(window.adroll_pix_id, settings.pixId);
    });

    it('should not set a user id', function(){
      analytics.user().identify('id');
      test
        .initialize()
        .equal(window.adroll_custom_data, null);
    });

    it('should set window.__adroll_loaded', function(){
      test
        .initialize()
        .strictEqual(window.__adroll_loaded, true);
    });

    it('should call #load', function(){
      test
        .initialize()
        .called(adroll.load);
    });
  });

  describe('#loaded', function(){
    after(function(){
      window.__adroll = undefined;
    });

    it('should test window.__adroll', function(){
      assert(!test.loaded());
      window.__adroll = {};
      assert(test.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      test.initialize();
      adroll.load.restore();
    });

    it('should change loaded state', function(done){
      test.loads(done);
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      test
        .initialize()
        .spy(window.__adroll, 'record_user');
    });

    it('should track page view with fullName', function(){
      test
        .page('Category', 'Name')
        .called(window.__adroll.record_user, {
          adroll_segments: 'viewed_category_name_page'
        });
    });

    it('should track unnamed/categorized page', function(){
      test
        .page()
        .called(window.__adroll.record_user, {
          adroll_segments: 'loaded_a_page'
        });
    });

    it('should track unnamed page', function(){
      test
        .page('Category')
        .called(window.__adroll.record_user, {
          adroll_segments: 'loaded_a_page'
        });
    });

    it('should track uncategorized page', function(){
      test
        .page(null, 'Name')
        .called(window.__adroll.record_user, {
          adroll_segments: 'viewed_name_page'
        });
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      test
        .initialize()
        .spy(window.__adroll, 'record_user');
    });

    it('should snake case event name', function(){
      test
        .track('Event A')
        .called(window.__adroll.record_user, {
          adroll_segments: 'event_a'
        });
    });

    describe('event not in events', function(){
      it('should send events with only adroll_segments', function(){
        test
          .track('event', {})
          .called(window.__adroll.record_user, {
            adroll_segments: 'event'
          });
      });

      it('should send events without revenue and order id', function(){
        test
          .track('event', { revenue: 3.99 })
          .called(window.__adroll.record_user, {
            adroll_segments: 'event'
          });
      });

      it('should pass user id in', function(){
        analytics.user().identify('id');
        test
          .track('event', { revenue: 3.99 })
          .called(window.__adroll.record_user, {
            adroll_segments: 'event',
            user_id: 'id'
          });
      });
    });

    describe('event in events', function(){
      beforeEach(function(){
        adroll.options.events = { event: 'segment' };
      });

      it('should pass in revenue and order id', function(){
        test
          .track('event', { total: 1.99, orderId: 1 })
          .called(window.__adroll.record_user, {
            adroll_segments: 'segment',
            adroll_conversion_value_in_dollars: 1.99,
            order_id: 1
          });
      });

      it('should pass .revenue as conversion value', function(){
        test
          .track('event', { revenue: 2.99 })
          .called(window.__adroll.record_user, {
            adroll_segments: 'segment',
            adroll_conversion_value_in_dollars: 2.99,
            order_id: 0
          });
      });

      it('should include the user_id when available', function(){
        analytics.user().identify('id');
        test
          .track('event', { revenue: 3.99 })
          .called(window.__adroll.record_user, {
            adroll_segments: 'segment',
            adroll_conversion_value_in_dollars: 3.99,
            order_id: 0,
            user_id: 'id'
          });
      });
    });
  });
});