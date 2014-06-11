
describe('Google Analytics', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var GA = require('integrations/lib/google-analytics');
  var sinon = require('sinon');
  var test = require('integration-tester');

  it('should have the right settings', function () {
    var ga = new GA.Integration();
    test(ga)
      .name('Google Analytics')
      .readyOnLoad()
      .global('ga')
      .global('_gaq')
      .global('GoogleAnalyticsObject')
      .option('anonymizeIp', false)
      .option('classic', false)
      .option('domain', 'none')
      .option('doubleClick', false)
      .option('enhancedLinkAttribution', false)
      .option('ignoredReferrers', null)
      .option('siteSpeedSampleRate', 1)
      .option('trackingId', '')
      .option('trackNamedPages', true);
  });

  describe('Universal', function () {

    var ga;
    var settings = {
      anonymizeIp: true,
      domain: 'none',
      siteSpeedSampleRate: 42,
      trackingId: 'UA-27033709-12'
    };

    beforeEach(function () {
      analytics.use(GA);
      ga = new GA.Integration(settings);
      analytics.user().reset();
      analytics.group().reset();
    });

    afterEach(function () {
      ga.reset();
    });

    describe('#initialize', function () {
      beforeEach(function () {
        ga.load = sinon.spy();
      });

      it('should require "displayfeatures" if .doubleClick option is `true`', function(){
        ga.options.doubleClick = true;
        ga.initialize();
        assert(equal(window.ga.q[1], ['require', 'displayfeatures']));
      })

      it('should create window.GoogleAnalyticsObject', function () {
        assert(!window.GoogleAnalyticsObject);
        ga.initialize();
        assert('ga' === window.GoogleAnalyticsObject);
      });

      it('should create window.ga', function () {
        assert(!window.ga);
        ga.initialize();
        assert('function' === typeof window.ga);
      });

      it('should create window.ga.l', function () {
        assert(!window.ga);
        ga.initialize();
        assert('number' === typeof window.ga.l);
      });

      it('should call window.ga.create with options', function () {
        ga.initialize();
        assert(equal(window.ga.q[0], ['create', settings.trackingId, {
          cookieDomain: settings.domain,
          siteSpeedSampleRate: settings.siteSpeedSampleRate,
          allowLinker: true
        }]));
      });

      it('should anonymize the ip', function () {
        ga.initialize();
        assert(equal(window.ga.q[1], ['set', 'anonymizeIp', true]));
      });

      it('should call #load', function () {
        ga.initialize();
        assert(ga.load.called);
      });

      it('should not send universal user id by default', function(){
        analytics.user().id('baz');
        ga.initialize();
        assert(!equal(window.ga.q[1], ['set', '&uid', 'baz']));
      })

      it('should send universal user id if sendUserId option is true and user.id() is truthy', function(){
        analytics.user().id('baz');
        ga.options.sendUserId = true;
        ga.initialize();
        assert(equal(window.ga.q[1], ['set', '&uid', 'baz']));
      })

      it('should map custom dimensions & metrics using user.traits()', function(){
        ga.options.metrics = { firstName: 'metric1', last_name: 'metric2' };
        ga.options.dimensions = { Age: 'dimension2' };
        analytics.user().traits({ firstName: 'John', lastName: 'Doe', age: 20 });
        ga.initialize();

        assert(equal(window.ga.q[2], ['set', {
          metric1: 'John',
          metric2: 'Doe',
          dimension2: 20
        }]));
      })

      it('should not set metrics and dimensions if there are no traits', function(){
        ga.options.metrics = { metric1: 'something' };
        ga.options.dimensions = { dimension3: 'industry' };
        ga.initialize();

        assert(equal(window.ga.q[2], undefined));
      })
    });

    describe('#loaded', function () {
      it('should test window.gaplugins', function () {
        assert(!ga.loaded());
        window.gaplugins = {};
        assert(ga.loaded());
      });
    });

    describe('#load', function () {
      beforeEach(function () {
        sinon.stub(ga, 'load');
        ga.initialize();
        ga.load.restore();
      });

      it('should change loaded state', function (done) {
        assert(!ga.loaded());
        ga.load(function (err) {
          if (err) return done(err);
          assert(ga.loaded());
          done();
        });
      });

      it('should call ready on load', function (done) {
        ga.on('ready', done);
        ga.load();
      });
    });

    describe('#page', function () {
      beforeEach(function () {
        ga.initialize();
        window.ga = sinon.spy();
      });

      it('should send a page view', function () {
        test(ga).page();
        assert(window.ga.calledWith('send', 'pageview', {
          page: undefined,
          title: undefined,
          location: undefined
        }));
      });

      it('should send a page view with properties', function () {
        test(ga).page('category', 'name', { url: 'url', path: '/path' });
        assert(window.ga.calledWith('send', 'pageview', {
          page: '/path',
          title: 'category name',
          location: 'url'
        }));
      });

      it('should send the query if its included', function () {
        ga.options.includeSearch = true;
        test(ga).page('category', 'name', { url: 'url', path: '/path', search: '?q=1' });
        assert(window.ga.calledWith('send', 'pageview', {
          page: '/path?q=1',
          title: 'category name',
          location: 'url'
        }));
      });

      it('should track a named page', function () {
        test(ga).page(null, 'Name');
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'Viewed Name Page',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: true
        }));
      });

      it('should track a name + category page', function () {
        test(ga).page('Category', 'Name');
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'Category',
          eventAction: 'Viewed Category Name Page',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: true
        }));
      });

      it('should track a categorized page', function () {
        test(ga).page('Category', 'Name');
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'Category',
          eventAction: 'Viewed Category Page',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: true
        }));
      });

      it('should not track a named or categorized page when the option is off', function () {
        ga.options.trackNamedPages = false;
        ga.options.trackCategorizedPages = false;
        test(ga).page(null, 'Name');
        test(ga).page('Category', 'Name');
        assert(window.ga.calledTwice);
      });
    });

    describe('#track', function () {
      beforeEach(function () {
        ga.initialize();
        window.ga = sinon.spy();
      });

      it('should send an event', function () {
        test(ga).track('event');
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: undefined
        }));
      });

      it('should send a category property', function () {
        test(ga).track('event', { category: 'category' });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'category',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: undefined
        }));
      });

      it('should send a stored category', function () {
        test(ga).page('category');
        test(ga).track('event', {});
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'category',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: undefined
        }));
      });

      it('should send a category property even if there is a stored category', function () {
        test(ga).page('category(page)');
        test(ga).track('event', { category: 'category(track)' });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'category(track)',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: undefined
        }));
      });

      it('should send a label property', function () {
        test(ga).track('event', { label: 'label' });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: 'label',
          eventValue: 0,
          nonInteraction: undefined
        }));
      });

      it('should send a rounded value property', function () {
        test(ga).track('event', { value: 1.1 });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 1,
          nonInteraction: undefined
        }));
      });

      it('should prefer a rounded revenue property', function () {
        test(ga).track('event', { revenue: 9.99 });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 10,
          nonInteraction: undefined
        }));
      });

      it('should send a non-interaction property', function () {
        test(ga).track('event', { noninteraction: true });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: true
        }));
      });

      it('should send a non-interaction option', function () {
        test(ga).track('event', {}, { 'Google Analytics': { noninteraction: true } });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: true
        }));
      });
    });

    describe('ecommerce', function(){
      beforeEach(function(){
        ga.initialize();
        window.ga = sinon.spy();
      })

      it('should require ecommerce.js', function(){
        test(ga).track('completed order', { orderId: 'ee099bf7' });
        assert(window.ga.calledWith('require', 'ecommerce', 'ecommerce.js'));
        assert(ga.ecommerce);
      })

      it('should not require ecommerce if .ecommerce is true', function(){
        ga.ecommerce = true;
        test(ga).track('completed order', { orderId: 'e213e4da' });
        assert(!window.ga.calledWith('require', 'ecommerce', 'ecommerce.js'));
      })

      it('should send simple ecommerce data', function(){
        test(ga).track('completed order', { orderId: '7306cc06' });
        assert(3 == window.ga.args.length);
        assert('ecommerce:addTransaction' == window.ga.args[1][0]);
        assert('ecommerce:send' == window.ga.args[2][0]);
      })

      it('should send ecommerce data', function(){
        test(ga).track('completed order', {
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

        assert(equal(window.ga.args[1], ['ecommerce:addTransaction', {
          id: '780bc55',
          revenue: 99.99,
          shipping: 13.99,
          affiliation: undefined,
          tax: 20.99
        }]));

        assert(equal(window.ga.args[2], ['ecommerce:addItem', {
          id: '780bc55',
          category: undefined,
          name: 'my product',
          price: 24.75,
          quantity: 1,
          sku: 'p-298'
        }]));

        assert(equal(window.ga.args[3], ['ecommerce:addItem', {
          id: '780bc55',
          category: undefined,
          name: 'other product',
          price: 24.75,
          sku: 'p-299',
          quantity: 3
        }]));

        assert(equal(window.ga.args[4], ['ecommerce:send']));
      })

      it('should fallback to revenue', function(){
        test(ga).track('completed order', {
          orderId: '5d4c7cb5',
          revenue: 99.9,
          shipping: 13.99,
          tax: 20.99,
          products: []
        });

        assert(equal(window.ga.args[1], ['ecommerce:addTransaction', {
          id: '5d4c7cb5',
          revenue: 99.9,
          shipping: 13.99,
          affiliation: undefined,
          tax: 20.99
        }]));
      })
    })
  });

  describe('Classic', function () {

    var ga;
    var settings = {
      anonymizeIp: true,
      classic: true,
      domain: 'none',
      enhancedLinkAttribution: true,
      ignoredReferrers: ['domain.com', 'www.domain.com'],
      siteSpeedSampleRate: 42,
      trackingId: 'UA-27033709-5'
    };

    beforeEach(function () {
      analytics.use(GA);
      ga = new GA.Integration(settings);
    });

    afterEach(function () {
      ga.reset();
    });

    describe('#initialize', function () {
      beforeEach(function () {
        ga.load = sinon.spy();
      });

      it('should create window._gaq', function () {
        assert(!window._gaq);
        ga.initialize();
        assert(window._gaq instanceof Array);
      });

      it('should push the tracking id', function () {
        ga.initialize();
        assert(equal(window._gaq[0], ['_setAccount', settings.trackingId]));
      });

      it('should set allow linker', function () {
        ga.initialize();
        assert(equal(window._gaq[1], ['_setAllowLinker', true]));
      });

      it('should set anonymize ip', function () {
        ga.initialize();
        assert(equal(window._gaq[2], ['_gat._anonymizeIp']));
      });

      it('should set domain name', function () {
        ga.initialize();
        assert(equal(window._gaq[3], ['_setDomainName', settings.domain]));
      });

      it('should set site speed sample rate', function () {
        ga.initialize();
        assert(equal(window._gaq[4], ['_setSiteSpeedSampleRate', settings.siteSpeedSampleRate]));
      });

      it('should set enhanced link attribution', function () {
        ga.initialize();
        assert(equal(window._gaq[5], ['_require', 'inpage_linkid', 'http://www.google-analytics.com/plugins/ga/inpage_linkid.js']));
      });

      it('should set ignored referrers', function () {
        ga.initialize();
        assert(equal(window._gaq[6], ['_addIgnoredRef', settings.ignoredReferrers[0]]));
        assert(equal(window._gaq[7], ['_addIgnoredRef', settings.ignoredReferrers[1]]));
      });

      it('should call #load', function () {
        ga.loadClassic = sinon.spy();
        ga.initialize();
        assert(ga.load.called);
      });
    });

    describe('#loaded', function () {
      it('should test window._gaq.push', function () {
        window._gaq = [];
        assert(!ga.loaded());
        window._gaq.push = function(){};
        assert(ga.loaded());
      });
    });

    describe('#load', function () {
      beforeEach(function () {
        sinon.stub(ga, 'load');
        ga.initialize();
        ga.load.restore();
      });

      it('should change loaded state', function (done) {
        assert(!ga.loaded());
        ga.load(function (err) {
          if (err) return done(err);
          assert(ga.loaded());
          done();
        });
      });

      it('should call ready on load', function (done) {
        ga.on('ready', done);
        ga.load();
      });
    });

    describe('#page', function () {
      beforeEach(function () {
        ga.initialize();
        window._gaq.push = sinon.spy();
      });

      it('should send a page view', function () {
        test(ga).page();
        assert(window._gaq.push.calledWith(['_trackPageview', undefined]));
      });

      it('should send a path', function () {
        test(ga).page(null, null, { path: '/path' });
        assert(window._gaq.push.calledWith(['_trackPageview', '/path']));
      });

      it('should send the query if its included', function () {
        ga.options.includeSearch = true;
        test(ga).page(null, null, { path: '/path', search: '?q=1' });
        assert(window._gaq.push.calledWith(['_trackPageview', '/path?q=1']));
      });

      it('should track a named page', function () {
        test(ga).page(null, 'Name');
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'Viewed Name Page', undefined, 0, true]));
      });

      it('should track a named page with a category', function () {
        test(ga).page('Category', 'Name');
        assert(window._gaq.push.calledWith(['_trackEvent', 'Category', 'Viewed Category Name Page', undefined, 0, true]));
      });

      it('should track a categorized page', function () {
        test(ga).page('Category', 'Name');
        assert(window._gaq.push.calledWith(['_trackEvent', 'Category', 'Viewed Category Page', undefined, 0, true]));
      });

      it('should not track a named or categorized page when the option is off', function () {
        ga.options.trackNamedPages = false;
        ga.options.trackCategorizedPages = false;
        test(ga).page(null, 'Name');
        test(ga).page('Category', 'Name');
        assert(window._gaq.push.calledTwice);
      });
    });

    describe('#track', function () {
      beforeEach(function () {
        ga.initialize();
        window._gaq.push = sinon.spy();
      });

      it('should send an event', function () {
        test(ga).track('event');
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 0, undefined]));
      });

      it('should send a category property', function () {
        test(ga).track('event', { category: 'category' });
        assert(window._gaq.push.calledWith(['_trackEvent', 'category', 'event', undefined, 0, undefined]));
      });

      it('should send a stored category', function () {
        test(ga).page('category');
        test(ga).track('event', { category: 'category' });
        assert(window._gaq.push.calledWith(['_trackEvent', 'category', 'event', undefined, 0, undefined]));
      });

      it('should send a label property', function () {
        test(ga).track('event', { label: 'label' });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', 'label', 0, undefined]));
      });

      it('should send a rounded value property', function () {
        test(ga).track('event', { value: 1.1 });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 1, undefined]));
      });

      it('should prefer a rounded revenue property', function () {
        test(ga).track('event', { revenue: 9.99 });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 10, undefined]));
      });

      it('should send a non-interaction property', function () {
        test(ga).track('event', { noninteraction: true });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 0, true]));
      });

      it('should send a non-interaction option', function () {
        test(ga).track('event', {}, { 'Google Analytics': { noninteraction: true } });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 0, true]));
      });
    });

    describe('ecommerce', function(){
      beforeEach(function(){
        ga.initialize();
        window._gaq.push = sinon.spy();
      })

      it('should send simple ecommerce data', function(){
        test(ga).track('completed order', { orderId: '078781c7' });
        assert(2 == window._gaq.push.args.length);
        assert('_addTrans' == window._gaq.push.args[0][0][0]);
        assert('_trackTrans' == window._gaq.push.args[1][0][0]);
      })

      it('should send ecommerce data', function(){
        test(ga).track('completed order', {
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

        assert(equal(window._gaq.push.args[0], [[
          '_addTrans',
          'af5ccd73',
          undefined,
          99.99,
          20.99,
          13.99,
          undefined,
          undefined,
          undefined
        ]]));

        assert(equal(window._gaq.push.args[1], [[
          '_addItem',
          'af5ccd73',
          'p-298',
          'my product',
          undefined,
          24.75,
          1,
        ]]));

        assert(equal(window._gaq.push.args[2], [[
          '_addItem',
          'af5ccd73',
          'p-299',
          'other product',
          undefined,
          24.75,
          3
        ]]));
      })

      it('should fallback to revenue', function(){
        test(ga).track('completed order', {
          orderId: 'f2ffee5c',
          revenue: 9,
          shipping: 3,
          tax: 2,
          products: []
        });

        assert(equal(window._gaq.push.args[0], [[
          '_addTrans',
          'f2ffee5c',
          undefined,
          9,
          2,
          3,
          undefined,
          undefined,
          undefined
        ]]));
      })
    })
  });

});
