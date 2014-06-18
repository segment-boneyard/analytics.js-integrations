
describe('KISSmetrics', function(){

  var analytics = require('analytics.js');
  var assert = require('assert');
  var KISSmetrics = require('./index')
  var sinon = require('sinon');
  var tester = require('analytics.js-integration-tester');
  var intervals = require('clear-intervals');
  var timeouts = require('clear-timeouts');
  var equals = require('equals');
  var Page = require('facade').Page;

  var kissmetrics;
  var test;
  var settings = {
    apiKey: '67f57ae9d61a6981fa07d141bec8c6c37e8b88c7'
  };

  before(function (done) {
    // setup global that tell kissmetrics to not fire jsonp breaking requests
    window.KM_DNT = true;
    window.KMDNTH = true;

    analytics.use(KISSmetrics);
    kissmetrics = new KISSmetrics.Integration(settings);
    analytics = tester(kissmetrics).stub(kissmetrics, 'load');
  });

  afterEach(function(){
    intervals();
    timeouts();
  });

  it('should have the right settings', function(){
    analytics
      .name('KISSmetrics')
      .assumesPageview()
      .readyOnLoad()
      .global('_kmq')
      .global('KM')
      .global('_kmil')
      .option('apiKey', '')
      .option('trackNamedPages', true)
      .option('trackCategorizedPages', true)
      .option('prefixProperties', true);
  });

  it('should create window._kmq', function(){
    assert(window._kmq instanceof Array);
  });

  it('should create window.KM', function(){
    assert(window.KM);
  });

  describe('#loaded', function(){
    var global;

    before(function(){
      global = window.KM;
    });

    after(function(){
      window.KM = global;
    });

    it('should test window.KM', function(){
      window.KM = undefined;
      assert(!kissmetrics.loaded());
      window.KM = document.createElement('div');
      assert(!kissmetrics.loaded());
      window.KM = {};
      assert(kissmetrics.loaded());
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      analytics.initialize();
      analytics.spy(window._kmq, 'push');
      analytics.spy(window.KM, 'pageView');
    });

    afterEach(function(){
      // set back to defaults
      // XXX: should we add a `reset` method either to 
      // kissmetrics integration or test? (for each test)
      window.KM_SKIP_PAGE_VIEW = 1;
      analytics.restore();
    });

    it('should record normal kissmetrics page views when the option is set', function(){
      window.KM_SKIP_PAGE_VIEW = false;
      analytics.page();
      analytics.didntCall(window._kmq.push);
    });

    it('should call `KM.pageView()` when KM_SKIP_PAGE_VIEW is not set', function(){
      window.KM_SKIP_PAGE_VIEW = false;
      analytics.page();
      analytics.called(window.KM.pageView);
    });

    it('should not call `KM.pageView()` when KM_SKIP_PAGE_VIEW is set', function(){
      window.KM_SKIP_PAGE_VIEW = 1;
      analytics.page();
      analytics.didntCall(window.KM.pageView);
    });

    it('should track named pages by default', function(){
      analytics.page(null, 'Name', {
        title: document.title,
        url: window.location.href
      });
      analytics.called(window._kmq.push, 'record', 'Viewed Name Page', {
        'Viewed Name Page - title': document.title,
        'Viewed Name Page - url': window.location.href,
        'Viewed Name Page - name': 'Name'
      });
    });

    it('should not track a named page when the option is off', function(){
      kissmetrics.options.trackNamedPages = false;
      analytics.page(null, 'Name');
      analytics.didntCall(window._kmq.push);
    });

    it('should not track a named page when the option is off, but should track category', function(){
      kissmetrics.options.trackNamedPages = false;
      test(kissmetrics).page('Category', 'Name');
      assert(window._kmq.push.calledOnce);
      assert(window._kmq.push.args[0][0][1] == 'Viewed Category Page');
    });

    it('should not track a categorized page when the option is off', function(){
      kissmetrics.options.trackCategorizedPages = false;
      analytics.page('Category', null);
      analytics.didntCall(window._kmq.push);
    });

    it('should not track a categorized page when the option is off, but should track name', function(){
      kissmetrics.options.trackCategorizedPages = false;
      test(kissmetrics).page('Category', 'Name');
      assert(window._kmq.push.calledOnce);
      assert(window._kmq.push.args[0][0][1] == 'Viewed Category Name Page');
    });

    it('should track both named and categorized page when options are on', function(){
      test(kissmetrics).page('Category', 'Name');
      assert(window._kmq.push.calledTwice);
      assert(window._kmq.push.args[0][0][1] == 'Viewed Category Name Page');
      assert(window._kmq.push.args[1][0][1] == 'Viewed Category Page');
    });

    it('should not prefixProperties if option is off', function(){
      kissmetrics.options.prefixProperties = false;
      analytics.page(null, 'Name', {
        title: document.title,
        url: window.location.href
      });
      analytics.called(window._kmq.push, 'record', 'Viewed Name Page', {
        title: document.title,
        url: window.location.href,
        name: 'Name'
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      analytics.initialize();
      analytics.spy(window._kmq, 'push');
    });

    it('should send an id', function(){
      analytics.identify('id');
      analytics.called(window._kmq.push, 'identify', 'id');
    });

    it('should send traits', function(){
      analytics.identify(null, { trait: true });
      analytics.called(window._kmq.push, 'set', { trait: true });
    });

    it('should send an id and traits', function(){
      analytics.identify('id', { trait: true });
      analytics.called(window._kmq.push, 'identify', 'id');
      analytics.called(window._kmq.push, 'set', { trait: true, id: 'id' });
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      analytics.initialize();
      analytics.spy(window._kmq, 'push');
    });

    it('should send an event', function(){
      analytics.track('event');
      analytics.called(window._kmq.push, 'record', 'event', {});
    });

    it('should send an event and properties', function(){
      analytics.track('event', { property: true });
      analytics.called(window._kmq.push, 'record', 'event', {
        'event - property': true
      });
    });

    it('should alias revenue to "Billing Amount"', function(){
      analytics.track('event', { revenue: 9.99 });
      analytics.called(window._kmq.push, 'record', 'event', {
        'Billing Amount': 9.99
      });
    });
  });

  describe('#alias', function(){
    beforeEach(function(){
      analytics.initialize();
      analytics.spy(window._kmq, 'push');
    });

    it('should send a new id', function(){
      analytics.alias('new');
      analytics.called(window._kmq.push, 'alias', 'new', undefined);
    });

    it('should send a new and old id', function(){
      analytics.alias('new', 'old');
      analytics.called(window._kmq.push, 'alias', 'new', 'old');
    });
  });

  describe('ecommerce', function(){
    beforeEach(function(){
      analytics.initialize();
      analytics.spy(window.KM, 'set');
      analytics.spy(window.KM, 'ts', Function('return 0'));
      analytics.spy(window._kmq, 'push');
    });

    it('should track viewed product', function(){
      analytics.track('viewed product', {
        sku: 1, 
        name: 'item', 
        category: 'category', 
        price: 9
      });
      analytics.called(window._kmq.push, 'record', 'viewed product', {
        'viewed product - sku': 1,
        'viewed product - name': 'item',
        'viewed product - category': 'category',
        'viewed product - price': 9
      });
    })

    it('should track added product', function(){
      analytics.track('added product', {
        sku: 1, 
        name: 'item', 
        category: 'category', 
        price: 9, 
        quantity: 2
      });
      analytics.called(window._kmq.push, 'record', 'added product', {
        'added product - sku': 1,
        'added product - name': 'item',
        'added product - category': 'category',
        'added product - price': 9,
        'added product - quantity': 2
      });
    })

    it('should track completed order', function(){
      analytics.track('completed order', {
        orderId: '12074d48',
        tax: 16,
        total: 166,
        products: [{
          sku: '40bcda73',
          name: 'my-product',
          price: 75,
          quantity: 1
        }, {
          sku: '64346fc6',
          name: 'other-product',
          price: 75,
          quantity: 1
        }]
      });
      analytics.called(window._kmq.push.args[0], 'record', 'completed order', {
        'completed order - sku': '12074d48',
        'completed order - total': 166
      });
    })

    it('should add items once KM is loaded', function(){
      analytics.track('completed order', {
        orderId: '12074d48',
        tax: 16,
        products: [{
          sku: '40bcda73',
          name: 'my-product',
          category: 'my-category',
          price: 75,
          quantity: 1
        }, {
          sku: '64346fc6',
          name: 'other-product',
          category: 'my-other-category',
          price: 75,
          quantity: 1
        }]
      });

      var fn = window._kmq.push.args[1][0];
      assert(2 == window._kmq.push.args.length);
      assert('function' == typeof fn);
      fn();

      assert(equals(window.KM.set.args[0][0], {
        'completed order - sku': '40bcda73',
        'completed order - name': 'my-product',
        'completed order - category': 'my-category',
        'completed order - price': 75,
        'completed order - quantity': 1,
        _t: 0,
        _d: 1
      }));

      assert(equals(window.KM.set.args[1][0], {
        'completed order - sku': '64346fc6',
        'completed order - name': 'other-product',
        'completed order - category': 'my-other-category',
        'completed order - price': 75,
        'completed order - quantity': 1,
        _t: 1,
        _d: 1
      }));
    })
  })
});
