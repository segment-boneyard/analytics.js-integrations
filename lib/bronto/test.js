
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');
var location = require('location-stub');

describe('Bronto', function(){
  var Bronto = plugin;
  var bronto;
  var analytics;
  var options = {
    siteId: 'arvdsiahdyhbxhukvignflhdknldben'
  };

  beforeEach(function(){
    analytics = new Analytics;
    bronto = new Bronto(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(bronto);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    bronto.reset();
    sandbox();
    location.reset();
  });

  it('should have the correct settings', function(){
    analytics.compare(Bronto, integration('Bronto')
      .option('siteId', '')
      .option('host', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(bronto, 'load');
      analytics.stub(bronto, 'debug');
    });

    afterEach(function(){
      analytics.debug(false);
    });

    describe('#initialize', function(){
      it('should warn that _bta_tid and _bta_c arent found if debugger is on', function(){
        analytics.debug();
        analytics.initialize();
        analytics.page();
        analytics.called(
          bronto.debug,
          'missing tracking URL parameters `_bta_tid` and `_bta_c`.'
        );
      });

      it('should not warn if _bta_tid and _bta_c are found', function(){
        location.search += '&_bta_tid=abc&bta_c=123';
        analytics.debug();
        analytics.initialize();
        analytics.page();
        analytics.didNotCall(bronto.debug, 'missing tracking URL parameters `_bta_tid` and `_bta_c`.');
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(bronto, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#completedOrder', function(){
      beforeEach(function(){
        analytics.stub(bronto.bta, 'addOrder');
      });

      it('should send ecommerce data', function(){
        analytics.identify({ email: 'lance@segment.io' });
        analytics.track('completed order', {
          products: [{ sku: 'c546c96', quantity: 8, name: 'my-product', price: 99.99 }],
          orderId: '55c497bf'
        });

        analytics.deepEqual(bronto.bta.addOrder.args[0][0], {
          email: 'lance@segment.io',
          items: [{ item_id: 'c546c96', quantity: 8, desc: 'my-product', amount: 99.99 }],
          order_id: '55c497bf'
        });
      });
    });
  });
});