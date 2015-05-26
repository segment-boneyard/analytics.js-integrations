
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('AdRoll', function(){
  var AdRoll = plugin;
  var adroll;
  var analytics;
  var options = {
    advId: 'FSQJWMMZ2NEAZH6XWKVCNO',
    pixId: 'N6HGWT4ALRDRXCAO5PLTB6',
    legacy: false
  };

  beforeEach(function(){
    analytics = new Analytics;
    adroll = new AdRoll(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(adroll);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    adroll.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(AdRoll, integration('AdRoll')
      .assumesPageview()
      .global('__adroll_loaded')
      .global('adroll_adv_id')
      .global('adroll_pix_id')
      .global('adroll_email')
      .option('advId', '')
      .option('pixId', '')
      .option('legacy', false)
      .mapping('events'));
});

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(adroll, 'load');
    });

    afterEach(function(){
      adroll.reset();
    });

    describe('#initialize', function(){
      it('should initialize the adroll variables', function(){
        analytics.initialize();
        analytics.page();
        analytics.equal(window.adroll_adv_id, options.advId);
        analytics.equal(window.adroll_pix_id, options.pixId);
      });

      it('should set window.__adroll_loaded', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(window.__adroll_loaded);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(adroll.load);
      });

      describe('with user', function(){
        beforeEach(function(){
          analytics.user().identify('id');
        });

        it('should not set a user id', function(){
          analytics.initialize();
          analytics.page();
      });
    });
  });
});

describe('loading', function(){
    it('should load', function(done){
      analytics.load(adroll, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function(){
      it('should pass email', function(){
        analytics.identify('id', { email: 'test@email.com' });
        analytics.equal('test@email.com', window.adroll_email);
      });

      it('should not pass empty email', function(){
        analytics.identify('id', {});
        analytics.assert(!window.adroll_email);
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window.__adroll, 'record_user');
      });

      describe('legacy: segment names', function(){
        beforeEach(function(){
          adroll.options.legacy = true;
        });

        it('should track page view with fullName', function(){
          analytics.page('Category', 'Name', { url: 'http://localhost:34448/test/' });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'viewed_category_name_page',
            path: '/test/',
            referrer: '',
            title: 'integrations tests',
            search: '',
            name: 'Name',
            category: 'Category',
            url: 'http://localhost:34448/test/'
          });
        });

        it('should track unnamed/categorized page', function(){
          analytics.page({ url: 'http://localhost:34448/test/' });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'loaded_a_page',
            path: '/test/',
            referrer: '',
            title: 'integrations tests',
            search: '',
            url: 'http://localhost:34448/test/'
          });
        });

        it('should track unnamed page', function(){
          analytics.page('Name', { url: 'http://localhost:34448/test/' });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'viewed_name_page',
            path: '/test/',
            referrer: '',
            title: 'integrations tests',
            search: '',
            name: 'Name',
            url: 'http://localhost:34448/test/'
          });
        });

        it('should track uncategorized page', function(){
          analytics.page('Name', { url: 'http://localhost:34448/test/' });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'viewed_name_page',
            path: '/test/',
            referrer: '',
            title: 'integrations tests',
            search: '',
            name: 'Name',
            url: 'http://localhost:34448/test/'
          });
        });
      });

      describe('v2: segment ids', function(){
        beforeEach(function(){
          adroll.options.events = { 'Viewed Category Name Page': '123' };
          adroll.options.legacy = false;
        });

        it('should track mapped page views', function(){
          analytics.page('Category', 'Name', { url: 'http://localhost:34448/test/' });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: '123',
            path: '/test/',
            referrer: '',
            title: 'integrations tests',
            search: '',
            name: 'Name',
            category: 'Category',
            url: 'http://localhost:34448/test/'
          });
        });

        it('should not track unmapped page calls', function(){
          analytics.page({ url: 'http://localhost:34448/test/' });
          analytics.didNotCall(window.__adroll.record_user);
        });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.__adroll, 'record_user');
      });

      it('legacy: should snake case unmapped event name', function(){
        adroll.options.legacy = true;
        analytics.track('Event A');
        analytics.called(window.__adroll.record_user, {
          adroll_segments: 'event_a'
        });
      });

      it('V2: should omit unmapped events', function(){
        adroll.options.legacy = false;
        analytics.track('Event A');
        analytics.didNotCall(window.__adroll.record_user);
      });

      describe('event not in events', function(){
        it('legacy: should send events with only adroll_segments', function(){
          adroll.options.legacy = true;
          analytics.track('event', {});
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'event'
          });
        });

        it('legacy: should send events with revenue and order id', function(){
          adroll.options.legacy = true;
          analytics.track('event', { revenue: 3.99, order_id: 1 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'event',
            adroll_conversion_value_in_dollars: 3.99,
            order_id: 1
          });
        });

        it('legacy: should pass user id in', function(){
          adroll.options.legacy = true;
          analytics.user().identify('id');
          analytics.track('event', { revenue: 3.99 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'event',
            adroll_conversion_value_in_dollars: 3.99,
            user_id: 'id'
          });
        });

        it('V2: should not send event', function(){
          adroll.options.legacy = false;
          analytics.track('event', {});
          analytics.didNotCall(window.__adroll.record_user);
        });
      });

      describe('event in events', function(){
        beforeEach(function(){
          adroll.options.events = { event: 'segmentId' };
        });

        it('should pass in revenue and order id', function(){
          analytics.track('event', { total: 1.99, orderId: 1 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'segmentId',
            adroll_conversion_value_in_dollars: 1.99,
            order_id: 1
          });
        });

        it('should pass .revenue as conversion value', function(){
          analytics.track('event', { revenue: 2.99 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'segmentId',
            adroll_conversion_value_in_dollars: 2.99,
          });
        });

        it('should include the user_id when available', function(){
          analytics.user().identify('id');
          analytics.track('event', { revenue: 3.99 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'segmentId',
            adroll_conversion_value_in_dollars: 3.99,
            user_id: 'id'
          });
        });

        it('should pass custom data like product id and sku', function(){
          analytics.track('event', { revenue: 2.99, id: '12345', sku: '43434-21', other: '1234' });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'segmentId',
            adroll_conversion_value_in_dollars: 2.99,
            product_id: '12345',
            sku: '43434-21',
            other: '1234',
            order_id: '12345'
          });
        });
      });
    });
  });
});
