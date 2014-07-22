
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('FoxMetrics', function(){
  var FoxMetrics = plugin;
  var foxmetrics;
  var analytics;
  var options = {
    appId: '5135085424023236bca9c08c'
  };

  beforeEach(function(){
    analytics = new Analytics;
    foxmetrics = new FoxMetrics(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(foxmetrics);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    foxmetrics.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(FoxMetrics, integration('FoxMetrics')
      .assumesPageview()
      .global('_fxm')
      .option('appId', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(foxmetrics, 'load');
    });

    describe('#initialize', function(){
      
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(foxmetrics, done);
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
        analytics.stub(window._fxm, 'push');
      });

      it('should send a page view', function(){
        analytics.page();
        analytics.called(window._fxm.push, [
          '_fxm.pages.view',
          document.title,
          undefined,
          undefined,
          window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + window.location.pathname,
          ''
        ]);
      });

      it('should send page properties', function(){
        analytics.page('category', 'name', {
          referrer: 'referrer',
          title: 'title',
          url: 'url'
        });

        analytics.called(window._fxm.push, [
          '_fxm.pages.view',
          'title',
          'name',
          'category',
          'url',
          'referrer'
        ]);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._fxm, 'push');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window._fxm.push, [
          '_fxm.visitor.profile',
          'id',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { id: 'id' }
        ]);
      });

      it('should not only send traits', function(){
        analytics.identify({ trait: true });
        analytics.didNotCall(window._fxm.push);
      });

      it('should send an id and traits', function(){
        analytics.identify('id', {
          address: 'address',
          email: 'email@example.com',
          firstName: 'first',
          lastName: 'last',
          trait: true
        });
        analytics.called(window._fxm.push, [
          '_fxm.visitor.profile',
          'id',
          'first',
          'last',
          'email@example.com',
          'address',
          undefined,
          undefined,
          {
            address: 'address',
            email: 'email@example.com',
            firstName: 'first',
            lastName: 'last',
            trait: true,
            id: 'id'
          }
        ]);
      });

      it('should split a name trait', function(){
        analytics.identify('id', { name: 'first last' });
        analytics.called(window._fxm.push, [
          '_fxm.visitor.profile',
          'id',
          'first',
          'last',
          undefined,
          undefined,
          undefined,
          undefined,
          {
            name: 'first last',
            id: 'id'
          }
        ]);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._fxm, 'push');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window._fxm.push, [
          'event',
          undefined,
          {}
        ]);
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window._fxm.push, [
          'event',
          undefined,
          { property: true }
        ]);
      });

      it('should send a category property', function(){
        analytics.track('event', { category: 'category' });
        analytics.called(window._fxm.push, [
          'event',
          'category',
          { category: 'category' }
        ]);
      });

      it('should send a stored category', function(){
        analytics.page('category');
        analytics.track('event', { category: 'category' });
        analytics.called(window._fxm.push, [
          '_fxm.pages.view',
          document.title,
          'category',
          null,
          window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + window.location.pathname,
          ''
        ]);
      });
    });

    describe('ecommerce', function(){
      beforeEach(function(){
        analytics.stub(window._fxm, 'push');
      });

      it('should track viewed product', function(){
        analytics.track('viewed product', {
          sku: 'f84d349b',
          name: 'my-product',
          category: 'category'
        });

        analytics.called(window._fxm.push, [
          '_fxm.ecommerce.productview',
          'f84d349b',
          'my-product',
          'category'
        ]);
      });

      it('should track added product', function(){
        analytics.track('added product', {
          id: 'c1ec1864',
          name: 'my-product',
          category: 'category'
        });

        analytics.called(window._fxm.push, [
          '_fxm.ecommerce.cartitem',
          'c1ec1864',
          'my-product',
          'category'
        ]);
      });

      it('should track removed product', function(){
        analytics.track('removed product', {
          sku: 'c1ec1864',
          name: 'my-product'
        });

        analytics.called(window._fxm.push, [
          '_fxm.ecommerce.removecartitem',
          'c1ec1864',
          'my-product',
          undefined
        ]);
      });

      it('should track completed order', function(){
        analytics.track('completed order', {
          orderId: '3723ee8a',
          total: 300,
          tax: 10,
          shipping: 20,
          products: [{
            sku: 'd370b4cd',
            name: 'sony pulse',
            category: 'tech',
            price: 270,
            quantity: 1
          }]
        });

        analytics.deepEqual(window._fxm.push.args[0][0], [
          '_fxm.ecommerce.order',
          '3723ee8a',
          270,
          20,
          10,
          undefined,
          undefined,
          undefined,
          1,
        ]);

        analytics.deepEqual(window._fxm.push.args[1][0], [
          '_fxm.ecommerce.purchaseitem',
          'd370b4cd',
          'sony pulse',
          'tech',
          1,
          270,
          '3723ee8a'
        ]);
      });
    });
  });
});