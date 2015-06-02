
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var sandbox = require('clear-env');
var AdRoll = require('./');

describe('AdRoll', function() {
  var adroll;
  var analytics;
  var options = {
    advId: 'FSQJWMMZ2NEAZH6XWKVCNO',
    pixId: 'N6HGWT4ALRDRXCAO5PLTB6'
  };

  beforeEach(function() {
    analytics = new Analytics();
    adroll = new AdRoll(options);
    analytics.use(AdRoll);
    analytics.use(tester);
    analytics.add(adroll);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    adroll.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(AdRoll, integration('AdRoll')
      .assumesPageview()
      .global('__adroll')
      .global('__adroll_loaded')
      .global('adroll_adv_id')
      .global('adroll_custom_data')
      .global('adroll_pix_id')
      .option('advId', '')
      .option('pixId', '')
      .mapping('events'));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(adroll, 'load');
    });

    afterEach(function() {
      adroll.reset();
    });

    describe('#initialize', function() {
      it('should initialize the adroll variables', function() {
        analytics.initialize();
        analytics.page();
        analytics.equal(window.adroll_adv_id, options.advId);
        analytics.equal(window.adroll_pix_id, options.pixId);
      });

      it('should set window.__adroll_loaded', function() {
        analytics.initialize();
        analytics.page();
        analytics.assert(window.__adroll_loaded);
      });

      it('should call #load', function() {
        analytics.initialize();
        analytics.page();
        analytics.called(adroll.load);
      });

      describe('with user', function() {
        beforeEach(function() {
          analytics.user().identify('id');
        });

        it('should not set a user id', function() {
          analytics.initialize();
          analytics.page();
          analytics.assert(!window.adroll_custom_data);
        });
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(adroll, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function() {
      beforeEach(function() {
        analytics.stub(window.__adroll, 'record_user');
      });

      it('should track page view with fullName', function() {
        analytics.page('Category', 'Name', { url: 'http://localhost:34448/test/' });
        analytics.called(window.__adroll.record_user, {
        adroll_segments: 'viewed_category_name_page',
        adroll_custom_data: {
          path: '/test/',
          referrer: '',
          title: 'integrations tests',
          search: '',
          name: 'Name',
          category: 'Category',
          url: 'http://localhost:34448/test/'
        }
        });
      });

      it('should track unnamed/categorized page', function() {
        analytics.page({ url: 'http://localhost:34448/test/' });
        analytics.called(window.__adroll.record_user, {
          adroll_segments: 'loaded_a_page',
          adroll_custom_data: {
            path: '/test/',
            referrer: '',
            title: 'integrations tests',
            search: '',
            url: 'http://localhost:34448/test/'
          }
        });
      });

      it('should track unnamed page', function() {
        analytics.page('Name', { url: 'http://localhost:34448/test/' });
        analytics.called(window.__adroll.record_user, {
          adroll_segments: 'viewed_name_page',
          adroll_custom_data: {
            path: '/test/',
            referrer: '',
            title: 'integrations tests',
            search: '',
            name: 'Name',
            url: 'http://localhost:34448/test/'
          }
        });
      });

      it('should track uncategorized page', function() {
        analytics.page('Name', { url: 'http://localhost:34448/test/' });
        analytics.called(window.__adroll.record_user, {
          adroll_segments: 'viewed_name_page',
          adroll_custom_data: {
            path: '/test/',
            referrer: '',
            title: 'integrations tests',
            search: '',
            name: 'Name',
            url: 'http://localhost:34448/test/'
          }
        });
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window.__adroll, 'record_user');
      });

      it('should snake case event name', function() {
        analytics.track('Event A');
        analytics.called(window.__adroll.record_user, {
          adroll_segments: 'event_a'
        });
      });

      describe('event not in events', function() {
        it('should send events with only adroll_segments', function() {
          analytics.track('event', {});
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'event'
          });
        });

        it('should send events with revenue and order id', function() {
          analytics.track('event', { revenue: 3.99, order_id: 1 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'event',
            adroll_conversion_value_in_dollars: 3.99,
            order_id: 1
          });
        });

        it('should pass user id in', function() {
          analytics.user().identify('id');
          analytics.track('event', { revenue: 3.99 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'event',
            adroll_conversion_value_in_dollars: 3.99,
            user_id: 'id'
          });
        });
      });

      describe('event in events', function() {
        beforeEach(function() {
          adroll.options.events = { event: 'segment' };
        });

        it('should pass in revenue and order id', function() {
          analytics.track('event', { total: 1.99, orderId: 1 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'segment',
            adroll_conversion_value_in_dollars: 1.99,
            order_id: 1
          });
        });

        it('should pass .revenue as conversion value', function() {
          analytics.track('event', { revenue: 2.99 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'segment',
            adroll_conversion_value_in_dollars: 2.99
          });
        });

        it('should include the user_id when available', function() {
          analytics.user().identify('id');
          analytics.track('event', { revenue: 3.99 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'segment',
            adroll_conversion_value_in_dollars: 3.99,
            user_id: 'id'
          });
        });

        it('should pass custom data like product id and sku', function() {
          analytics.track('event', { revenue: 2.99, id: '12345', sku: '43434-21', other: '1234' });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'segment',
            adroll_conversion_value_in_dollars: 2.99,
            product_id: '12345',
            sku: '43434-21',
            adroll_custom_data: { other: '1234' },
            order_id: '12345'
          });
        });

        it('should support array events', function() {
          adroll.options.events = [{ key: 'event', value: 'pixel' }];
          analytics.track('event', { total: 2.99, orderId: 2 });
          analytics.called(window.__adroll.record_user, {
            adroll_segments: 'pixel',
            adroll_conversion_value_in_dollars: 2.99,
            order_id: 2
          });
        });

        it('should track multiple events', function() {
          adroll.options.events = [{ key: 'event', value: 'one' }];
          adroll.options.events.push({ key: 'event', value: 'two' });
          analytics.track('event', { total: 2.99, orderId: 2 });
          analytics.calledTwice(window.__adroll.record_user);
        });
      });
    });
  });
});
