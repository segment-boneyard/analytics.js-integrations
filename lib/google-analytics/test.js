
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Google Analytics', function(){
  var GA = plugin.Integration;
  var ga;
  var analytics;

  beforeEach(function(){
    analytics = new Analytics;
    analytics.use(plugin);
    analytics.use(tester);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(GA, integration('Google Analytics')
      .readyOnLoad()
      .global('ga')
      .global('_gaq')
      .global('GoogleAnalyticsObject')
      .option('anonymizeIp', false)
      .option('classic', false)
      .option('domain', 'auto')
      .option('doubleClick', false)
      .option('enhancedEcommerce', false)
      .option('enhancedLinkAttribution', false)
      .option('nonInteraction',false)
      .option('ignoredReferrers', null)
      .option('siteSpeedSampleRate', 1)
      .option('trackingId', '')
      .option('trackNamedPages', true));
  });

  describe('Universal', function(){
    var settings = {
      anonymizeIp: true,
      domain: 'auto',
      siteSpeedSampleRate: 42,
      trackingId: 'UA-27033709-12'
    };

    beforeEach(function(){
      ga = new GA(settings);
      analytics.add(ga);
    });

    afterEach(function(){
      ga.reset();
    });

    describe('before loading', function(){
      beforeEach(function(){
        analytics.stub(ga, 'load');
      });

      describe('#initialize', function(){
        it('should require "displayfeatures" if .doubleClick option is `true`', function(){
          ga.options.doubleClick = true;
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window.ga.q[1], ['require', 'displayfeatures']);
        });

        it('should create window.GoogleAnalyticsObject', function(){
          analytics.assert(!window.GoogleAnalyticsObject);
          analytics.initialize();
          analytics.page();
          analytics.assert('ga' === window.GoogleAnalyticsObject);
        });

        it('should create window.ga', function(){
          analytics.assert(!window.ga);
          analytics.initialize();
          analytics.page();
          analytics.assert('function' === typeof window.ga);
        });

        it('should create window.ga.l', function(){
          analytics.assert(!window.ga);
          analytics.initialize();
          analytics.page();
          analytics.assert('number' === typeof window.ga.l);
        });

        it('should call window.ga.create with options', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(Array.prototype.slice.call(window.ga.q[0]), ['create', settings.trackingId, {
            cookieDomain: 'none',
            siteSpeedSampleRate: settings.siteSpeedSampleRate,
            allowLinker: true
          }]);
        });

        it('should anonymize the ip', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window.ga.q[1], ['set', 'anonymizeIp', true]);
        });

        it('should call #load', function(){
          analytics.initialize();
          analytics.page();
          analytics.called(ga.load);
        });

        it('should not send universal user id by default', function(){
          analytics.user().id('baz');
          analytics.initialize();
          analytics.page();
          analytics.notDeepEqual(window.ga.q[1], ['set', 'userId', 'baz']);
        });

        it('should send universal user id if sendUserId option is true and user.id() is truthy', function(){
          analytics.user().id('baz');
          ga.options.sendUserId = true;
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window.ga.q[1], ['set', 'userId', 'baz']);
        });

        it('should map custom dimensions & metrics using user.traits()', function(){
          ga.options.metrics = { firstName: 'metric1', last_name: 'metric2' };
          ga.options.dimensions = { Age: 'dimension2' };
          analytics.user().traits({ firstName: 'John', lastName: 'Doe', age: 20 });
          analytics.initialize();
          analytics.page();

          analytics.deepEqual(window.ga.q[2], ['set', {
            metric1: 'John',
            metric2: 'Doe',
            dimension2: 20
          }]);
        });

        it('should not set metrics and dimensions if there are no traits', function(){
          ga.options.metrics = { metric1: 'something' };
          ga.options.dimensions = { dimension3: 'industry' };
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window.ga.q[2], undefined);
        });

        it('should set metrics and dimensions that have dots but arent nested', function(){
          ga.options.metrics = { 'name.first': 'metric1', 'name.last': 'metric2' };
          ga.options.dimensions = { Age: 'dimension2' };
          analytics.user().traits({ 'name.first': 'John', 'name.last': 'Doe', age: 20 });
          analytics.initialize();
          analytics.page();

          analytics.deepEqual(window.ga.q[2], ['set', {
            metric1: 'John',
            metric2: 'Doe',
            dimension2: 20
          }]);
        });

        it('should set metrics and dimensions that are nested, using dot notation', function(){
          ga.options.metrics = { 'name.first': 'metric1', 'name.last': 'metric2' };
          ga.options.dimensions = { Age: 'dimension2' };
          analytics.user().traits({
            name: {
              first: 'John',
              last: 'Doe',
            },
            age: 20
          });
          analytics.initialize();
          analytics.page();

          analytics.deepEqual(window.ga.q[2], ['set', {
            metric1: 'John',
            metric2: 'Doe',
            dimension2: 20
          }]);
        });
      });
    });

    describe('loading', function(){
      it('should load', function(done){
        analytics.load(ga, done);
      });
    });

    describe('after loading', function(){
      beforeEach(function(done){
        analytics.once('ready', done);
        analytics.initialize();
        analytics.page();
      });

      describe('#page', function(){
        beforeEach(function(){
          analytics.stub(window, 'ga');
        });

        it('should send a page view', function(){
          analytics.page();
          analytics.called(window.ga, 'send', 'pageview', {
            page: window.location.pathname,
            title: document.title,
            location: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname + window.location.search
          });
        });

        it('should send a page view with properties', function(){
          analytics.page('category', 'name', { url: 'url', path: '/path' });
          analytics.called(window.ga, 'send', 'pageview', {
            page: '/path',
            title: 'category name',
            location: 'url'
          });
        });

        it('should send the query if its included', function(){
          ga.options.includeSearch = true;
          analytics.page('category', 'name', { url: 'url', path: '/path', search: '?q=1' });
          analytics.called(window.ga, 'send', 'pageview', {
            page: '/path?q=1',
            title: 'category name',
            location: 'url'
          });
        });

        it('should send the campaign info if its included', function(){
          ga.options.includeSearch = true;
          analytics.page('category', 'name', { url: 'url', path: '/path', search: '?q=1' }, {
            campaign: {
              name: "test",
              source: "test",
              medium: "test",
              term: "test",
              content: "test"
            }
          });
          analytics.called(window.ga, 'send', 'pageview', {
            page: '/path?q=1',
            title: 'category name',
            location: 'url',
            campaignName: 'test',
            campaignSource: 'test',
            campaignMedium: "test",
            campaignKeyword: "test",
            campaignContent: "test"
          });
        });

        it('should track a named page', function(){
          analytics.page('Name');
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'Viewed Name Page',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: true
          });
        });

        it('should track a named page with context', function(){
          analytics.page('Name', {}, {
            campaign: {
              name: "test",
              source: "test",
              medium: "test",
              term: "test",
              content: "test"
            }
          });
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'Viewed Name Page',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: true,
            campaignName: 'test',
            campaignSource: 'test',
            campaignMedium: "test",
            campaignKeyword: "test",
            campaignContent: "test"
          });
        });

        it('should track a name + category page', function(){
          analytics.page('Category', 'Name');
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'Category',
            eventAction: 'Viewed Category Name Page',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: true
          });
        });

        it('should track a categorized page', function(){
          analytics.page('Category', 'Name');
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'Category',
            eventAction: 'Viewed Category Page',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: true
          });
        });

        it('should not track a named or categorized page when the option is off', function(){
          ga.options.trackNamedPages = false;
          ga.options.trackCategorizedPages = false;
          analytics.page('Name');
          analytics.page('Category', 'Name');
          analytics.calledTwice(window.ga);
        });
      });

      describe('#track', function(){
        beforeEach(function(){
          analytics.stub(window, 'ga');
        });

        it('should send an event', function(){
          analytics.track('event');
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: false
          });
        });

        it('should send an event with context', function(){
          analytics.track('event', {}, {
            campaign: {
              name: "test",
              source: "test",
              medium: "test",
              term: "test",
              content: "test"
            }
          });
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: false,
            campaignName: 'test',
            campaignSource: 'test',
            campaignMedium: "test",
            campaignKeyword: "test",
            campaignContent: "test"
          });
        });

        it('should send a category property', function(){
          analytics.track('event', { category: 'category' });
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'category',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: false
          });
        });

        it('should send a stored category', function(){
          analytics.page('category', 'name');
          analytics.track('event', {});
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'category',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: false
          });
        });

        it('should send a category property even if there is a stored category', function(){
          analytics.page('category(page)');
          analytics.track('event', { category: 'category(track)' });
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'category(track)',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: false
          });
        });

        it('should send a label property', function(){
          analytics.track('event', { label: 'label' });
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'event',
            eventLabel: 'label',
            eventValue: 0,
            nonInteraction: false
          });
        });

        it('should send a rounded value property', function(){
          analytics.track('event', { value: 1.1 });
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 1,
            nonInteraction: false
          });
        });

        it('should prefer a rounded revenue property', function(){
          analytics.track('event', { revenue: 9.99 });
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 10,
            nonInteraction: false
          });
        });

        it('should send a non-interaction property', function(){
          analytics.track('event', { nonInteraction: 1 });
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: true
          });
        });

        it('should send a non-interaction option', function(){
          analytics.track('event', {}, { 'Google Analytics': { nonInteraction: 1 } });
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: true
          });
        });

        it('should respect the non-interaction option', function(){
          ga.options.nonInteraction = true;
          analytics.track('event');
          analytics.called(window.ga, 'send', 'event', {
            eventCategory: 'All',
            eventAction: 'event',
            eventLabel: undefined,
            eventValue: 0,
            nonInteraction: true
          })
        });

        it('should map custom dimensions & metrics using track.properties()', function(){
          ga.options.metrics = { loadTime: 'metric1', levelAchieved: 'metric2' };
          ga.options.dimensions = { referrer: 'dimension2' };
          analytics.track('Level Unlocked', { loadTime: '100', levelAchieved:'5', referrer: 'Google' });

          analytics.called(window.ga, 'set', {
            metric1: '100',
            metric2: '5',
            dimension2: 'Google'
          });
        });
      });

      describe('ecommerce', function(){
        beforeEach(function(){
          analytics.stub(window, 'ga');
        });

        it('should require ecommerce.js', function(){
          analytics.track('completed order', { orderId: 'ee099bf7' });
          analytics.called(window.ga, 'require', 'ecommerce');
          analytics.assert(ga.ecommerce);
        });

        it('should not require ecommerce if .ecommerce is true', function(){
          ga.ecommerce = true;
          analytics.track('completed order', { orderId: 'e213e4da' });
          analytics.didNotCall(window.ga, 'require', 'ecommerce');
        });

        it('should send simple ecommerce data', function(){
          analytics.track('completed order', { orderId: '7306cc06' });
          analytics.assert(3 == window.ga.args.length);
          analytics.assert('ecommerce:addTransaction' == window.ga.args[1][0]);
          analytics.assert('ecommerce:send' == window.ga.args[2][0]);
        });

        it('should send ecommerce data', function(){
          analytics.track('completed order', {
            orderId: '780bc55',
            total: 99.99,
            shipping: 13.99,
            tax: 20.99,
            products: [{
              quantity: 1,
              price: 24.75,
              name: 'my product',
              sku: 'p-298'
            }, {
              quantity: 3,
              price: 24.75,
              name: 'other product',
              sku: 'p-299'
            }]
          });

          analytics.deepEqual(window.ga.args[1], ['ecommerce:addTransaction', {
            id: '780bc55',
            revenue: 99.99,
            shipping: 13.99,
            affiliation: undefined,
            tax: 20.99,
            currency: 'USD'
          }]);

          analytics.deepEqual(window.ga.args[2], ['ecommerce:addItem', {
            id: '780bc55',
            category: undefined,
            name: 'my product',
            price: 24.75,
            quantity: 1,
            sku: 'p-298',
            currency: 'USD'
          }]);

          analytics.deepEqual(window.ga.args[3], ['ecommerce:addItem', {
            id: '780bc55',
            category: undefined,
            name: 'other product',
            price: 24.75,
            sku: 'p-299',
            quantity: 3,
            currency: 'USD'
          }]);

          analytics.deepEqual(window.ga.args[4], ['ecommerce:send']);
        });

        it('should fallback to revenue', function(){
          analytics.track('completed order', {
            orderId: '5d4c7cb5',
            revenue: 99.9,
            shipping: 13.99,
            tax: 20.99,
            products: []
          });

          analytics.deepEqual(window.ga.args[1], ['ecommerce:addTransaction', {
            id: '5d4c7cb5',
            revenue: 99.9,
            shipping: 13.99,
            affiliation: undefined,
            tax: 20.99,
            currency: 'USD'
          }]);
        });

        it('should pass custom currency', function(){
          analytics.track('completed order', {
            orderId: '5d4c7cb5',
            revenue: 99.9,
            shipping: 13.99,
            tax: 20.99,
            products: [],
            currency: 'EUR'
          });

          analytics.deepEqual(window.ga.args[1], ['ecommerce:addTransaction', {
            id: '5d4c7cb5',
            revenue: 99.9,
            shipping: 13.99,
            affiliation: undefined,
            tax: 20.99,
            currency: 'EUR'
          }]);
        });
      });
    });
  });

  describe('Universal Enhanced Ecommerce', function(){
    var settings = {
      enhancedEcommerce: true,
      anonymizeIp: true,
      domain: 'none',
      siteSpeedSampleRate: 42,
      trackingId: 'UA-27033709-12'
    };

    beforeEach(function(){
      ga = new GA(settings);
      analytics.add(ga);
    });

    afterEach(function(){
      ga.reset();
    });

    describe('after loading', function(){
      beforeEach(function(done){
        analytics.once('ready', done);
        analytics.initialize();
        analytics.page();
      });

      describe('enhanced ecommerce', function(){
        beforeEach(function(){
          analytics.stub(window, 'ga');
        });

        it('should require ec.js', function(){
          analytics.track('completed order', { orderId: 'ee099bf7' });
          analytics.assert(window.ga.args.length > 0);
          analytics.deepEqual(window.ga.args[0], ['require', 'ec']);
        });

        it('should not require ec if .enhancedEcommerceLoaded is true', function(){
          ga.enhancedEcommerceLoaded = true;
          analytics.track('completed order', { orderId: 'e213e4da' });
          analytics.assert(window.ga.args.length > 0);
          analytics.notDeepEqual(window.ga.args[0], ['require', 'ec']);
        });

        it('should set currency for ec.js  to default', function(){
          analytics.track('completed order', { orderId: 'ee099bf7' });
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'USD']);
        });

        it('should set currency for ec.js to custom currency', function(){
          analytics.track('completed order', { orderId: 'ee099bf7', currency: 'EUR' });
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'EUR']);
        });

        it('should send added product data', function(){
          analytics.track('added product', {
            currency: 'CAD',
            quantity: 1,
            price: 24.75,
            name: 'my product',
            category: 'cat 1',
            sku: 'p-298'
          });

          analytics.assert(5 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addProduct', {
            id: 'p-298',
            name: 'my product',
            category: 'cat 1',
            quantity: 1,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[3], ['ec:setAction', 'add', {}]);
          analytics.deepEqual(window.ga.args[4], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send removed product data', function(){
          analytics.track('removed product', {
            currency: 'CAD',
            quantity: 1,
            price: 24.75,
            name: 'my product',
            category: 'cat 1',
            sku: 'p-298'
          });

          analytics.assert(5 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addProduct', {
            id: 'p-298',
            name: 'my product',
            category: 'cat 1',
            quantity: 1,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[3], ['ec:setAction', 'remove', {}]);
          analytics.deepEqual(window.ga.args[4], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send viewed product details data', function(){
          analytics.track('viewed product details', {
            currency: 'CAD',
            quantity: 1,
            price: 24.75,
            name: 'my product',
            category: 'cat 1',
            sku: 'p-298'
          });

          analytics.assert(5 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addProduct', {
            id: 'p-298',
            name: 'my product',
            category: 'cat 1',
            quantity: 1,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[3], ['ec:setAction', 'detail', {}]);
          analytics.deepEqual(window.ga.args[4], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send clicked product data', function(){
          analytics.track('clicked product', {
            currency: 'CAD',
            quantity: 1,
            price: 24.75,
            name: 'my product',
            category: 'cat 1',
            sku: 'p-298',
            list: 'search results',
          });

          analytics.assert(5 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addProduct', {
            id: 'p-298',
            name: 'my product',
            category: 'cat 1',
            quantity: 1,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[3], ['ec:setAction', 'click', {
            list: 'search results'
          }]);
          analytics.deepEqual(window.ga.args[4], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send viewed product data', function(){
          analytics.track('viewed product', {
            currency: 'CAD',
            name: 'my product',
            category: 'cat 1',
            sku: 'p-298',
            list: 'search results',
            position: 1
          });

          analytics.assert(4 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addImpression', {
            id: 'p-298',
            name: 'my product',
            category: 'cat 1',
            brand: undefined,
            variant: undefined,
            list: 'search results',
            position: 1
          }]);
          analytics.deepEqual(window.ga.args[3], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send viewed promotion data', function(){
          analytics.track('viewed promotion', {
            currency: 'CAD',
            id: 'PROMO_1234',
            name: 'Summer Sale',
            creative: 'summer_banner2',
            position: 'banner_slot1'
          });

          //analytics.assert(4 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addPromo', {
            id: 'PROMO_1234',
            name: 'Summer Sale',
            creative: 'summer_banner2',
            position: 'banner_slot1'
          }]);
          analytics.deepEqual(window.ga.args[3], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send clicked promotion data', function(){
          analytics.track('clicked promotion', {
            currency: 'CAD',
            id: 'PROMO_1234',
            name: 'Summer Sale',
            creative: 'summer_banner2',
            position: 'banner_slot1'
          });

          //analytics.assert(5 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addPromo', {
            id: 'PROMO_1234',
            name: 'Summer Sale',
            creative: 'summer_banner2',
            position: 'banner_slot1'
          }]);
          analytics.deepEqual(window.ga.args[3], ['ec:setAction', 'promo_click', {}]);
          analytics.deepEqual(window.ga.args[4], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send started order data', function(){
          analytics.track('started order', {
            currency: 'CAD',
            products: [{
              quantity: 1,
              price: 24.75,
              name: 'my product',
              sku: 'p-298'
            }, {
              quantity: 3,
              price: 24.75,
              name: 'other product',
              sku: 'p-299'
            }],
            step: 1,
            paymentMethod: 'Visa'
          });

          analytics.assert(6 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addProduct', {
            id: 'p-298',
            name: 'my product',
            category: undefined,
            quantity: 1,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[3], ['ec:addProduct', {
            id: 'p-299',
            name: 'other product',
            category: undefined,
            quantity: 3,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[4], ['ec:setAction', 'checkout', {
            step: 1,
            option: 'Visa'
          }]);
          analytics.deepEqual(window.ga.args[5], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send updated order data', function(){
          analytics.track('updated order', {
            currency: 'CAD',
            products: [{
              quantity: 1,
              price: 24.75,
              name: 'my product',
              category: 'cat 1',
              sku: 'p-298'
            }, {
              quantity: 3,
              price: 24.75,
              name: 'other product',
              category: 'cat 2',
              sku: 'p-299'
            }],
            step: 1,
            paymentMethod: 'Visa'
          });

          analytics.assert(6 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addProduct', {
            id: 'p-298',
            name: 'my product',
            category: 'cat 1',
            quantity: 1,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[3], ['ec:addProduct', {
            id: 'p-299',
            name: 'other product',
            category: 'cat 2',
            quantity: 3,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[4], ['ec:setAction', 'checkout', {
            step: 1,
            option: 'Visa'
          }]);
          analytics.deepEqual(window.ga.args[5], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send viewed checkout step data', function(){
          analytics.track('viewed checkout step', {
            currency: 'CAD',
            step: 2
          });

          analytics.assert(4 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:setAction', 'checkout', {
            step: 2,
            option: undefined,
          }]);
          analytics.deepEqual(window.ga.args[3], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send completed checkout step data', function(){
          analytics.track('completed checkout step', {
            currency: 'CAD',
            step: 2,
            shippingMethod: 'FedEx'
          });

          analytics.assert(4 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:setAction', 'checkout_option', {
            step: 2,
            option: 'FedEx',
          }]);
          analytics.deepEqual(window.ga.args[3], ['send', 'event', 'Checkout', 'Option']);
        });

        it('should send completed checkout step data with all options', function(){
          analytics.track('completed checkout step', {
            currency: 'CAD',
            step: 2,
            paymentMethod: 'Visa',
            shippingMethod: 'FedEx',
          });

          analytics.assert(4 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:setAction', 'checkout_option', {
            step: 2,
            option: 'Visa, FedEx',
          }]);
          analytics.deepEqual(window.ga.args[3], ['send', 'event', 'Checkout', 'Option']);
        });

        it('should not send completed checkout step data without a step', function(){
          analytics.track('completed checkout step', {
            currency: 'CAD',
            shippingMethod: 'FedEx',
          });

          analytics.assert(0 == window.ga.args.length);
        });

        it('should not send completed checkout step data without an option', function(){
          analytics.track('completed checkout step', {
            currency: 'CAD',
            step: 2,
          });

          analytics.assert(0 == window.ga.args.length);
        });

        it('should send simple completed order data', function(){
          analytics.track('completed order', { orderId: '7306cc06' });
          analytics.assert(4 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[2], ['ec:setAction', 'purchase', {
            id: '7306cc06',
            affiliation: undefined,
            revenue: 0.0,
            tax: undefined,
            shipping: undefined,
            coupon: undefined
          }]);
          analytics.deepEqual(window.ga.args[3], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send completed order data', function(){
          analytics.track('completed order', {
            orderId: '780bc55',
            total: 99.9,
            shipping: 13.99,
            tax: 20.99,
            currency: 'CAD',
            coupon: 'coupon',
            affiliation: 'affiliation',
            products: [{
              quantity: 1,
              price: 24.75,
              name: 'my product',
              category: 'cat 1',
              sku: 'p-298'
            }, {
              quantity: 3,
              price: 24.75,
              name: 'other product',
              category: 'cat 2',
              sku: 'p-299'
            }]
          });

          analytics.assert(6 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[1], ['set', '&cu', 'CAD']);
          analytics.deepEqual(window.ga.args[2], ['ec:addProduct', {
            id: 'p-298',
            name: 'my product',
            category: 'cat 1',
            quantity: 1,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[3], ['ec:addProduct', {
            id: 'p-299',
            name: 'other product',
            category: 'cat 2',
            quantity: 3,
            price: 24.75,
            brand: undefined,
            variant: undefined,
          }]);
          analytics.deepEqual(window.ga.args[4], ['ec:setAction', 'purchase', {
            id: '780bc55',
            affiliation: 'affiliation',
            revenue: 99.9,
            tax: 20.99,
            shipping: 13.99,
            coupon: 'coupon'
          }]);
          analytics.deepEqual(window.ga.args[5], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('completed order should fallback to revenue', function(){
          analytics.track('completed order', {
            orderId: '5d4c7cb5',
            revenue: 99.9,
            shipping: 13.99,
            tax: 20.99,
            products: []
          });

          analytics.deepEqual(window.ga.args[2], ['ec:setAction', 'purchase', {
            id: '5d4c7cb5',
            affiliation: undefined,
            revenue: 99.9,
            tax: 20.99,
            shipping: 13.99,
            coupon: undefined
          }]);
        });

        it('should send full refunded order data', function(){
          analytics.track('refunded order', { orderId: '780bc55' });

          analytics.assert(4 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[2], ['ec:setAction', 'refund', {
            id: '780bc55'
          }]);
          analytics.deepEqual(window.ga.args[3], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });

        it('should send partial refunded order data', function(){
          analytics.track('refunded order', {
            orderId: '780bc55',
            products: [{
              quantity: 1,
              sku: 'p-298'
            }, {
              quantity: 2,
              sku: 'p-299'
            }]
          });

          analytics.assert(6 == window.ga.args.length);
          analytics.deepEqual(window.ga.args[2], ['ec:addProduct', {
            id: 'p-298',
            quantity: 1,
          }]);
          analytics.deepEqual(window.ga.args[3], ['ec:addProduct', {
            id: 'p-299',
            quantity: 2,
          }]);
          analytics.deepEqual(window.ga.args[4], ['ec:setAction', 'refund', {
            id: '780bc55'
          }]);
          analytics.deepEqual(window.ga.args[5], ['send', 'event', 'EnhancedEcommerce', 'Push', { nonInteraction: 1 }]);
        });
      });
    });
  });

  describe('Classic', function(){
    var settings = {
      anonymizeIp: true,
      classic: true,
      domain: 'auto',
      enhancedLinkAttribution: true,
      ignoredReferrers: ['domain.com', 'www.domain.com'],
      siteSpeedSampleRate: 42,
      trackingId: 'UA-27033709-5'
    };

    beforeEach(function(){
      ga = new GA(settings);
      analytics.add(ga);
    });

    afterEach(function(){
      ga.reset();
    });

    describe('before loading', function(){
      beforeEach(function(){
        analytics.stub(ga, 'load');
      });

      describe('#initialize', function(){
        it('should create window._gaq', function(){
          analytics.assert(!window._gaq);
          analytics.initialize();
          analytics.page();
          analytics.assert(window._gaq instanceof Array);
        });

        it('should push the tracking id', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._gaq[0], ['_setAccount', settings.trackingId]);
        });

        it('should set allow linker', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._gaq[1], ['_setAllowLinker', true]);
        });

        it('should set anonymize ip', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._gaq[2], ['_gat._anonymizeIp']);
        });

        it('should set domain name', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._gaq[3], ['_setDomainName', settings.domain]);
        });

        it('should set site speed sample rate', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._gaq[4], ['_setSiteSpeedSampleRate', settings.siteSpeedSampleRate]);
        });

        it('should set enhanced link attribution', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._gaq[5], ['_require', 'inpage_linkid', 'http://www.google-analytics.com/plugins/ga/inpage_linkid.js']);
        });

        it('should set ignored referrers', function(){
          analytics.initialize();
          analytics.page();
          analytics.deepEqual(window._gaq[6], ['_addIgnoredRef', settings.ignoredReferrers[0]]);
          analytics.deepEqual(window._gaq[7], ['_addIgnoredRef', settings.ignoredReferrers[1]]);
        });
      });
    });

    describe('loading', function(){
      it('should load', function(done){
        analytics.load(ga, done);
      });
    });

    describe('after loading', function(){
      beforeEach(function(done){
        analytics.once('ready', done);
        analytics.initialize();
        analytics.page();
      });

      describe('#page', function(){
        beforeEach(function(){
          analytics.stub(window._gaq, 'push');
        });

        it('should send a page view', function(){
          analytics.page();
          analytics.called(window._gaq.push, ['_trackPageview', window.location.pathname]);
        });

        it('should send a path', function(){
          analytics.page({ path: '/path' });
          analytics.called(window._gaq.push, ['_trackPageview', '/path']);
        });

        it('should send the query if its included', function(){
          ga.options.includeSearch = true;
          analytics.page({ path: '/path', search: '?q=1' });
          analytics.called(window._gaq.push, ['_trackPageview', '/path?q=1']);
        });

        it('should track a named page', function(){
          analytics.page('Name');
          analytics.called(window._gaq.push, ['_trackEvent', 'All', 'Viewed Name Page', undefined, 0, true]);
        });

        it('should track a named page with a category', function(){
          analytics.page('Category', 'Name');
          analytics.called(window._gaq.push, ['_trackEvent', 'Category', 'Viewed Category Name Page', undefined, 0, true]);
        });

        it('should track a categorized page', function(){
          analytics.page('Category', 'Name');
          analytics.called(window._gaq.push, ['_trackEvent', 'Category', 'Viewed Category Page', undefined, 0, true]);
        });

        it('should not track a named or categorized page when the option is off', function(){
          ga.options.trackNamedPages = false;
          ga.options.trackCategorizedPages = false;
          analytics.page('Name');
          analytics.page('Category', 'Name');
          analytics.calledTwice(window._gaq.push);
        });
      });

      describe('#track', function(){
        beforeEach(function(){
          analytics.stub(window._gaq, 'push');
        });

        it('should send an event', function(){
          analytics.track('event');
          analytics.called(window._gaq.push, ['_trackEvent', 'All', 'event', undefined, 0, false]);
        });

        it('should send a category property', function(){
          analytics.track('event', { category: 'category' });
          analytics.called(window._gaq.push, ['_trackEvent', 'category', 'event', undefined, 0, false]);
        });

        it('should send a stored category', function(){
          analytics.page('category');
          analytics.track('event', { category: 'category' });
          analytics.called(window._gaq.push, ['_trackEvent', 'category', 'event', undefined, 0, false]);
        });

        it('should send a label property', function(){
          analytics.track('event', { label: 'label' });
          analytics.called(window._gaq.push, ['_trackEvent', 'All', 'event', 'label', 0, false]);
        });

        it('should send a rounded value property', function(){
          analytics.track('event', { value: 1.1 });
          analytics.called(window._gaq.push, ['_trackEvent', 'All', 'event', undefined, 1, false]);
        });

        it('should prefer a rounded revenue property', function(){
          analytics.track('event', { revenue: 9.99 });
          analytics.called(window._gaq.push, ['_trackEvent', 'All', 'event', undefined, 10, false]);
        });

        it('should send a non-interaction property', function(){
          analytics.track('event', { nonInteraction: 1 });
          analytics.called(window._gaq.push, ['_trackEvent', 'All', 'event', undefined, 0, true]);
        });

        it('should send a non-interaction option', function(){
          analytics.track('event', {}, { 'Google Analytics': { nonInteraction: 1 } });
          analytics.called(window._gaq.push, ['_trackEvent', 'All', 'event', undefined, 0, true]);
        });

      });

      describe('ecommerce', function(){
        beforeEach(function(){
          analytics.stub(window._gaq, 'push');
        });

        it('should send simple ecommerce data', function(){
          analytics.track('completed order', { orderId: '078781c7' });
          analytics.assert(3 == window._gaq.push.args.length);
          analytics.assert('_addTrans' == window._gaq.push.args[0][0][0]);
          analytics.deepEqual(['_set', 'currencyCode', 'USD'], window._gaq.push.args[1][0]);
          analytics.assert('_trackTrans' == window._gaq.push.args[2][0][0]);
        });

        it('should send ecommerce data', function(){
          analytics.track('completed order', {
            orderId: 'af5ccd73',
            total: 99.99,
            shipping: 13.99,
            tax: 20.99,
            products: [{
              quantity: 1,
              price: 24.75,
              name: 'my product',
              sku: 'p-298'
            }, {
              quantity: 3,
              price: 24.75,
              name: 'other product',
              sku: 'p-299'
            }]
          });

          analytics.deepEqual(window._gaq.push.args[0], [[
            '_addTrans',
            'af5ccd73',
            undefined,
            99.99,
            20.99,
            13.99,
            null,
            null,
            null
          ]]);

          analytics.deepEqual(window._gaq.push.args[1], [[
            '_addItem',
            'af5ccd73',
            'p-298',
            'my product',
            undefined,
            24.75,
            1,
          ]]);

          analytics.deepEqual(window._gaq.push.args[2], [[
            '_addItem',
            'af5ccd73',
            'p-299',
            'other product',
            undefined,
            24.75,
            3
          ]]);

          analytics.deepEqual(window._gaq.push.args[3], [[
            '_set',
            'currencyCode',
            'USD'
          ]]);

          analytics.deepEqual(window._gaq.push.args[4], [[
            '_trackTrans'
          ]]);
        });

        it('should fallback to revenue', function(){
          analytics.track('completed order', {
            orderId: 'f2ffee5c',
            revenue: 9,
            shipping: 3,
            tax: 2,
            products: []
          });

          analytics.deepEqual(window._gaq.push.args[0], [[
            '_addTrans',
            'f2ffee5c',
            undefined,
            9,
            2,
            3,
            null,
            null,
            null
          ]]);
        });
      });
    });
  });
});
