
describe('Quantcast', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Quantcast = require('integrations/lib/quantcast');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var quantcast;
  var settings = {
    pCode: 'p-ZDsjJUtp583Se'
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
      .option('advertise', false)
      .option('pageLabels', true)
      .option('eventLabels', true)
      .option('globalLabels', []);
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

    it('should push "refresh" with labels when given a page', function(){
      quantcast.page = sinon.spy();
      quantcast.initialize(test.types.page('category', 'name'));
      var pushed = window._qevents[0];
      assert(settings.pCode == pushed.qacct);
      assert(null == pushed.event);
      assert('page.category.name' == pushed.labels);
    });

    it('should incude global labels with page labels', function() {
      quantcast.options.globalLabels = ['GlobalLabel'];
      quantcast.page = sinon.spy();
      quantcast.initialize(test.types.page('category', 'name'));
      var pushed = window._qevents[0];
      assert(settings.pCode == pushed.qacct);
      assert(null == pushed.event);
      assert('GlobalLabel,page.category.name' == pushed.labels);     
    });

    it('should incude multiple global labels with page labels', function() {
      quantcast.options.globalLabels = ['GlobalLabel1', 'GlobalLabel2'];
      quantcast.page = sinon.spy();
      quantcast.initialize(test.types.page('category', 'name'));
      var pushed = window._qevents[0];
      assert(settings.pCode == pushed.qacct);
      assert(null == pushed.event);
      assert('GlobalLabel1,GlobalLabel2,page.category.name' == pushed.labels);     
    });

    it('should push "refresh" without labels with options.pageLabels === false', function(){
      quantcast.page = sinon.spy();
      quantcast.options.pageLabels = false;
      quantcast.initialize(test.types.page());
      var pushed = window._qevents[0];
      assert(settings.pCode == pushed.qacct);
      assert(null == pushed.event);
      assert('' == pushed.labels);
    });

    it('should push "refresh" with global labels with options.pageLabels === false', function(){
      quantcast.page = sinon.spy();
      quantcast.options.globalLabels = ['GlobalLabel1', 'GlobalLabel2'];
      quantcast.options.pageLabels = false;
      quantcast.initialize(test.types.page('category','name'));
      var pushed = window._qevents[0];
      assert(settings.pCode == pushed.qacct);
      assert(null == pushed.event);
      assert('GlobalLabel1,GlobalLabel2' == pushed.labels);
    });
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

    it('should not push a label when no page name is provided', function () {
      test(quantcast).page();
      var item = window._qevents[1];
      assert(item.labels === '');
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

    it('should push options.label as labels with no page name', function () {
      quantcast.options.globalLabels = ['GlobalLabels'];
      test(quantcast).page();
      var item = window._qevents[1];
      assert(item.labels === ('GlobalLabels'));
    });

    it('should push options.label and page category and name as labels', function () {
      quantcast.options.globalLabels = ['GlobalLabels'];
      test(quantcast).page('Category', 'Page');
      var item = window._qevents[1];
      assert(item.labels === ('GlobalLabels,page.Category.Page'));
    });

    it('should push options.label and page category and name as labels when eventLabels === false', function () {
      quantcast.options.globalLabels = ['GlobalLabels'];
      quantcast.options.eventLabels = false;
      test(quantcast).page('Category', 'Page');
      var item = window._qevents[1];
      assert(item.labels === ('GlobalLabels,page.Category.Page'));
    });

    it('should push options.label and not page category and name as labels when pageLabels === false', function () {
      quantcast.options.globalLabels = ['GlobalLabels'];
      quantcast.options.pageLabels = false;
      test(quantcast).page('Category', 'Page');
      var item = window._qevents[1];
      assert(item.labels === ('GlobalLabels'));
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
      });

      it('should not include labels when no page name is specified', function(){
        quantcast.options.advertise = true;
        test(quantcast).page();
        var item = window._qevents[1];
        assert(item.labels == '');
      });

      it('should send category and name', function(){
        quantcast.options.advertise = true;
        test(quantcast).page('Category Name', 'Page Name');
        var item = window._qevents[1];
        assert(item.labels == '_fp.event.Category Name Page Name');
      });

      it('should send options.labels plus category and name', function(){
        quantcast.options.advertise = true;
        quantcast.options.globalLabels = ['GlobalLabel'];
        test(quantcast).page('Category Name', 'Page Name');
        var item = window._qevents[1];
        assert(item.labels == 'GlobalLabel,_fp.event.Category Name Page Name');
      });

      it('should not send labels when pageLabels === false', function(){
        quantcast.options.advertise = true;
        quantcast.options.pageLabels = false;
        test(quantcast).page('Category Name', 'Page Name');
        var item = window._qevents[1];
        assert(item.labels == '');
      });
    });
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

    it('should not push a label when options.eventLabels === false', function () {
      quantcast.options.eventLabels = false;
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.labels === '');
    });

    it('should push a label when options.pageLabels === false', function () {
      quantcast.options.pageLabels = false;
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.labels === 'event.event');
    });

    it('should push options.label as labels', function () {
      quantcast.options.globalLabels = ['GlobalLabels'];
      test(quantcast).track();
      var item = window._qevents[1];
      assert(item.labels === ('GlobalLabels'));
    });

    it('should push options.label and event name as labels', function () {
      quantcast.options.globalLabels = ['GlobalLabels'];
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.labels === ('GlobalLabels,event.event'));
    });

    it('should push revenue for the event', function () {
      var revenue = 10.45;
      test(quantcast).track('event', { revenue : revenue });
      var item = window._qevents[1];
      assert(item.revenue === '10.45');
    });

    it('should not push revenue if its undefined', function(){
      test(quantcast).track('event', { revenue: undefined });
      var item = window._qevents[1];
      assert(!item.hasOwnProperty('revenue'));
    })

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

      it('should prefix with _fp.event and include options.labels', function(){
        quantcast.options.advertise = true;
        quantcast.options.globalLabels = ['GlobalLabel'];
        test(quantcast).track('event');
        var item = window._qevents[1];
        assert(item.labels == 'GlobalLabel,_fp.event.event');
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

      it('should handle completed order events with global labels', function(){
        quantcast.options.advertise = true;
        quantcast.options.globalLabels = ['GlobalLabel'];
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
        assert(item.labels == 'GlobalLabel,_fp.event.completed order,_fp.pcat.tech');
      })
    })
  });

});
