
describe('Quantcast', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Quantcast = require('integrations/lib/quantcast');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var quantcast;
  var settings = {
    pCode: 'x'
  };

  beforeEach(function () {
    analytics.use(Quantcast);
    quantcast = new Quantcast.Integration(settings);
    quantcast.initialize(); // noop
  });

  afterEach(function () {
    quantcast.reset();
    analytics.user().reset();
  });

  it('should have the right settings', function () {
    test(quantcast)
      .name('Quantcast')
      .assumesPageview()
      .readyOnInitialize()
      .global('_qevents')
      .global('__qc')
      .option('pCode', null)
      .option('advertise', false);
  });

  describe('#initialize', function () {
    beforeEach(function () {
      sinon.stub(quantcast, 'load');
    });

    it('should push the pCode', function () {
      quantcast.initialize();
      assert(window._qevents[0].qacct === settings.pCode);
    });

    it('should push the user id', function () {
      analytics.user().identify('id');
      quantcast.initialize();
      assert(window._qevents[0].uid === 'id');
    });

    it('should call #load', function () {
      quantcast.initialize();
      assert(quantcast.load.called);
    });

    it('should call #page when given a page', function(){
      quantcast.page = sinon.spy();
      quantcast.initialize(test.types.page())
      assert('page' == quantcast.page.args[0][0].action());
    })
  });

  describe('#loaded', function () {
    it('should test window.__qc', function () {
      assert(!quantcast.loaded());
      window.__qc = {};
      assert(quantcast.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(quantcast, 'load');
      quantcast.initialize();
      quantcast.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!quantcast.loaded());
      quantcast.load(function (err) {
        if (err) return done(err);
        assert(quantcast.loaded());
        done();
      });
    });
  });

  describe('#page', function () {
    beforeEach(function () {
      quantcast.initialize();
    });

    it('should push a refresh event', function () {
      test(quantcast).page();
      var item = window._qevents[1];
      assert(item.event === 'refresh');
    });

    it('should push the pCode', function () {
      test(quantcast).page();
      var item = window._qevents[1];
      assert(item.qacct === settings.pCode);
    });

    it('should push the page name as a label', function () {
      test(quantcast).page('Page Name');
      var item = window._qevents[1];
      assert(item.labels === 'page.Page Name');
    });

    it('should push the page name as a label without commas', function () {
      test(quantcast).page('Page, Name');
      var item = window._qevents[1];
      assert(item.labels === 'page.Page; Name');
    });

    it('should push the page category and name as labels', function () {
      test(quantcast).page('Category', 'Page');
      var item = window._qevents[1];
      assert(item.labels === ('page.Category.Page'));
    });

    it('should push the user id', function () {
      analytics.user().identify('id');
      test(quantcast).page();
      var item = window._qevents[1];
      assert(item.uid === 'id');
    });

    it('should call `#initialize` with `#page` once the integration is ready', function(){
      quantcast._initialized = false;
      quantcast.initialize = sinon.spy();
      test(quantcast).page('name');
      assert('page' == quantcast.initialize.args[0][0].action());
    })

    describe('when advertise is true', function(){
      it('should prefix with _fp.event', function(){
        quantcast.options.advertise = true;
        test(quantcast).page('Page Name');
        var item = window._qevents[1];
        assert(item.labels == '_fp.event.Page Name');
      })

      it('should send category and name', function(){
        quantcast.options.advertise = true;
        test(quantcast).page('Category Name', 'Page Name');
        var item = window._qevents[1];
        assert(item.labels == '_fp.event.Category Name.Page Name');
      })
    })
  });

  describe('#identify', function () {
    beforeEach(function () {
      quantcast.initialize();
    });

    it('should update the user id', function () {
      test(quantcast).identify('id');
      assert(window._qevents[0].uid === 'id');
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      quantcast.initialize();
    });

    it('should push a click event', function () {
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.event === 'click');
    });

    it('should push a label for the event', function () {
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.labels === 'event.event');
    });

    it('should push revenue for the event', function () {
      var revenue = 10.45;
      test(quantcast).track('event', { revenue : revenue });
      var item = window._qevents[1];
      assert(item.revenue === '10.45');
    });

    it('should push the pCode', function () {
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.qacct === settings.pCode);
    });

    it('should push the user id', function () {
      analytics.user().identify('id');
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.uid === 'id');
    });

    it('should handle completed order events', function () {
      test(quantcast).track('completed order', {
        orderId: '780bc55',
        category: 'tech',
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
      var item = window._qevents[1];
      assert(item.orderid === '780bc55');
      assert(item.revenue === '99.99');
      assert(item.labels === 'event.completed order');
    });

    describe('when advertise is true', function(){
      it('should prefix with _fp.event', function(){
        quantcast.options.advertise = true;
        test(quantcast).track('event');
        var item = window._qevents[1];
        assert(item.labels == '_fp.event.event');
      })

      it('should handle completed order events', function(){
        quantcast.options.advertise = true;
        test(quantcast).track('completed order', {
          orderId: '780bc55',
          category: 'tech',
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
        var item = window._qevents[1];
        assert(item.labels == '_fp.event.completed order,_fp.pcat.tech');
      })
    })
  });

});
