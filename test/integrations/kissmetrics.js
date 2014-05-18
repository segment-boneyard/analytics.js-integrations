
describe('KISSmetrics', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var KISSmetrics = require('integrations/lib/kissmetrics');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var intervals = require('clear-intervals');
  var timeouts = require('clear-timeouts');
  var equals = require('equals');

  var kissmetrics;
  var settings = {
    apiKey: '67f57ae9d61a6981fa07d141bec8c6c37e8b88c7'
  };

  before(function (done) {
    // setup global that tell kissmetrics to not fire jsonp breaking requests
    window.KM_DNT = true;
    window.KMDNTH = true;

    analytics.use(KISSmetrics);
    kissmetrics = new KISSmetrics.Integration(settings);
    kissmetrics.initialize(); // noop

    // initialize only once because kissmetrics has a bunch of timeouts
    kissmetrics.once('load', done);
    kissmetrics.initialize();
  });

  afterEach(function(){
    intervals();
    timeouts();
  })

  it('should have the right settings', function () {
    test(kissmetrics)
      .name('KISSmetrics')
      .assumesPageview()
      .readyOnInitialize()
      .global('_kmq')
      .global('KM')
      .global('_kmil')
      .option('apiKey', '')
      .option('trackNamedPages', true);
  });

  it('should create window._kmq', function () {
    assert(window._kmq instanceof Array);
  });

  it('should create window.KM', function () {
    assert(window.KM);
  });

  describe('#loaded', function () {
    var global;

    before(function () {
      global = window.KM;
    });

    after(function () {
      window.KM = global;
    });

    it('should test window.KM', function () {
      window.KM = undefined;
      assert(!kissmetrics.loaded());
      window.KM = document.createElement('div');
      assert(!kissmetrics.loaded());
      window.KM = {};
      assert(kissmetrics.loaded());
    });
  });

  describe('#page', function () {
    beforeEach(function () {
      window._kmq.push = sinon.spy();
    });

    it('should track named pages by default', function () {
      test(kissmetrics).page(null, 'Name');
      assert(window._kmq.push.calledWith(['record', 'Viewed Name Page', { name: 'Name' }]));
    });

    it('should track named pages with categories', function () {
      test(kissmetrics).page('Category', 'Name');
      assert(window._kmq.push.calledWith(['record', 'Viewed Category Name Page', {
        category: 'Category',
        name: 'Name'
      }]));
    });

    it('should track categorized pages by default', function () {
      test(kissmetrics).page('Category', 'Name');
      assert(window._kmq.push.calledWith(['record', 'Viewed Category Page', {
        category: 'Category',
        name: 'Name'
      }]));
    });

    it('should not track a named or categorized page when the option is off', function () {
      kissmetrics.options.trackNamedPages = false;
      kissmetrics.options.trackCategorizedPages = false;
      test(kissmetrics).page(null, 'Name');
      test(kissmetrics).page('Category', 'Name');
      assert(!window._kmq.push.called);
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      window._kmq.push = sinon.spy();
    });

    it('should send an id', function () {
      test(kissmetrics).identify('id');
      assert(window._kmq.push.calledWith(['identify', 'id']));
    });

    it('should send traits', function () {
      test(kissmetrics).identify(null, { trait: true });
      assert(window._kmq.push.calledWith(['set', { trait: true }]));
    });

    it('should send an id and traits', function () {
      test(kissmetrics).identify('id', { trait: true });
      assert(window._kmq.push.calledWith(['identify', 'id']));
      assert(window._kmq.push.calledWith(['set', { trait: true, id: 'id' }]));
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      window._kmq.push = sinon.spy();
    });

    it('should send an event', function () {
      test(kissmetrics).track('event');
      assert(window._kmq.push.calledWith(['record', 'event', {}]));
    });

    it('should send an event and properties', function () {
      test(kissmetrics).track('event', { property: true });
      assert(window._kmq.push.calledWith(['record', 'event', { property: true }]));
    });

    it('should alias revenue to "Billing Amount"', function () {
      test(kissmetrics).track('event', { revenue: 9.99 });
      assert(window._kmq.push.calledWith(['record', 'event', { 'Billing Amount': 9.99 }]));
    });
  });

  describe('#alias', function () {
    beforeEach(function () {
      window._kmq.push = sinon.spy();
    });

    it('should send a new id', function () {
      test(kissmetrics).alias('new');
      assert(window._kmq.push.calledWith(['alias', 'new', undefined]));
    });

    it('should send a new and old id', function () {
      test(kissmetrics).alias('new', 'old');
      assert(window._kmq.push.calledWith(['alias', 'new', 'old']));
    });
  });

  describe('ecommerce', function(){
    beforeEach(function(){
      kissmetrics.initialize();
      window.KM = { set: sinon.spy(), ts: Function('return 0') };
      window._kmq.push = sinon.spy();
    });

    it('should track viewed product', function(){
      test(kissmetrics)
        .track('viewed product', { sku: 1, name: 'item', category: 'category', price: 9 })
        .called(window._kmq.push)
        .with(['record', 'viewed product', {
          'viewed product - SKU': 1,
          'viewed product - Name': 'item',
          'viewed product - Category': 'category',
          'viewed product - Price': 9,
          'viewed product - Quantity': 1
        }]);
    })

    it('should track added product', function(){
      test(kissmetrics)
        .track('added product', { sku: 1, name: 'item', category: 'category', price: 9, quantity: 2 })
        .called(window._kmq.push)
        .with(['record', 'added product', {
          'added product - SKU': 1,
          'added product - Name': 'item',
          'added product - Category': 'category',
          'added product - Price': 9,
          'added product - Quantity': 2
        }])
    })

    it('should track completed order', function(){
      test(kissmetrics)
        .track('completed order', {
          orderId: '12074d48',
          tax: 16,
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

      assert(window._kmq.push.args[0], ['record', 'completed order', {
        'completed order - ID': '12074d48',
        'completed order - Subtotal': 150,
        'completed order - Total': 166
      }]);
    })

    it('should add items once KM is loaded', function(){
      test(kissmetrics)
        .track('completed order', {
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
        'completed order - SKU': '40bcda73',
        'completed order - Name': 'my-product',
        'completed order - Category': 'my-category',
        'completed order - Price': 75,
        'completed order - Quantity': 1,
        _t: 0,
        _d: 1
      }));

      assert(equals(window.KM.set.args[1][0], {
        'completed order - SKU': '64346fc6',
        'completed order - Name': 'other-product',
        'completed order - Category': 'my-other-category',
        'completed order - Price': 75,
        'completed order - Quantity': 1,
        _t: 1,
        _d: 1
      }));
    })
  })
});
