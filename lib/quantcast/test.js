
var tester = require('analytics.js-integration-tester');
var analytics = require('analytics.js');
var Quantcast = require('./index');
var assert = require('assert');
var sinon = require('sinon');

describe('Quantcast', function(){
  var quantcast;
  var test;
  var settings = {
    pCode: 'p-ZDsjJUtp583Se'
  };

  beforeEach(function(){
    analytics.use(Quantcast);
    quantcast = new Quantcast.Integration(settings);
    test = tester(quantcast);
  });

  afterEach(function(){
    test.reset();
    analytics.user().reset();
  });

  it('should have the right settings', function(){
    test
      .name('Quantcast')
      .assumesPageview()
      .readyOnInitialize()
      .global('_qevents')
      .global('__qc')
      .option('pCode', null)
      .option('advertise', false);
  });

  describe('#initialize', function(){
    it('should push the pCode', function(){
      // XXX: should refactor this test too, to use `.called`
      test
        .initialize()
        .equal(window._qevents[0].qacct, settings.pCode);
    });

    it('should push the user id', function(){
      analytics.user().identify('id');
      test
        .initialize()
        .equal(window._qevents[0].uid, 'id');
    });

    it('should call #load', function(){
      test
        .initialize()
        .called(quantcast.load);
    });

    it('should push "refresh" with labels when given a page', function(){
      quantcast.page = sinon.spy();
      quantcast.initialize(test.types.page('category', 'name'));
      var pushed = window._qevents[0];
      assert(settings.pCode == pushed.qacct);
      assert(null == pushed.event);
      assert('page.category.name' == pushed.labels);
    })
  });

  describe('#loaded', function(){
    it('should test window.__qc', function(){
      assert(!test.loaded());
      window.__qc = {};
      assert(test.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      test.initialize();
      test.load.restore();
    });

    it('should change loaded state', function(done){
      assert(!test.loaded());
      test.load(function(err){
        if (err) return done(err);
        assert(test.loaded());
        done();
      });
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      test.spy(window._qevents, 'push');
    });

    // XXX: all of these need to have extra props added to the `.called` args

    it('should push a refresh event and pcode', function(){
      test
        .initialize()
        .page()
        .called(window._qevents.push)
        .called(window._qevents.push, {
          event: 'refresh',
          qacct: settings.pCode
        });
    });

    it('should push the page name as a label', function(){
      test
        .initialize()
        .page('Page Name')
        .called(window._qevents.push)
        .called(window._qevents.push, { labels: 'page.Page Name' });
    });

    it('should push the page name as a label without commas', function(){
      test
        .initialize()
        .page('Page, Name')
        .called(window._qevents.push)
        .called(window._qevents.push, { labels: 'page.Page; Name' });
    });

    it('should push the page category and name as labels', function(){
      test
        .initialize()
        .page('Category', 'Page')
        .called(window._qevents.push)
        .called(window._qevents.push, { labels: 'page.Category.Page' });
    });

    it('should push the user id', function(){
      analytics.user().identify('id');
      test
        .initialize()
        .page()
        .called(window._qevents.push)
        .called(window._qevents.push, { uid: 'id' });
    });

    it('should call `#initialize` with `#page` once the integration is ready', function(){
      quantcast._initialized = false;
      test
        .spy(quantcast, 'initialize')
        .page('name')
        // XXX?
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
        assert(item.labels == '_fp.event.Category Name Page Name');
      })
    })
  });

  describe('#identify', function(){
    beforeEach(function(){
      sinon.stub(quantcast, 'load');
      quantcast.initialize();
    });

    it('should update the user id', function(){
      test(quantcast).identify('id');
      assert(window._qevents[0].uid === 'id');
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      sinon.stub(quantcast, 'load');
      quantcast.initialize();
    });

    it('should push a click event', function(){
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.event === 'click');
    });

    it('should push a label for the event', function(){
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.labels === 'event.event');
    });

    it('should push revenue for the event', function(){
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

    it('should push the pCode', function(){
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.qacct === settings.pCode);
    });

    it('should push the user id', function(){
      analytics.user().identify('id');
      test(quantcast).track('event');
      var item = window._qevents[1];
      assert(item.uid === 'id');
    });

    it('should handle completed order events', function(){
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
