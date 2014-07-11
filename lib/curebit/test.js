
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var iso = require('to-iso-string');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');

describe('Curebit', function(){
  var Curebit = plugin.Integration;
  var curebit;
  var analytics;
  var options = {
    siteId: 'curebit-87ab995d-736b-45ba-ac41-71f4dbb5c74a',
    server: 'https://api.segment.io/track'
  };

  beforeEach(function(){
    analytics = new Analytics;
    curebit = new Curebit(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(curebit);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    curebit.reset();
  });

  var timeouts = require('clear-timeouts');
  var intervals = require('clear-intervals');
  after(function(){
    timeouts();
    intervals();
  });

  it('should have the correct settings', function(){
    analytics.compare(Curebit, integration('Curebit')
      .readyOnLoad()
      .global('_curebitq')
      .global('curebit')
      .option('siteId', '')
      .option('iframeBorder', 0)
      .option('iframeId', 'curebit_integration')
      .option('iframeHeight', '480')
      .option('iframeWidth', '100%')
      .option('responsive', true)
      .option('device', '')
      .option('insertIntoId', '')
      .option('campaigns', {})
      .option('server', 'https://www.curebit.com'));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(curebit, 'load');
    });

    afterEach(function(){
      curebit.reset();
    });

    describe('#initialize', function(){
      it('should push settings', function(){
        analytics.initialize();
        analytics.deepEqual(window._curebitq, [['init', {
          site_id: options.siteId,
          server: 'https://api.segment.io/track'
        }]]);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.called(curebit.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(curebit, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#page', function(){
      var campaigns;

      beforeEach(function(){
        var path = window.location.pathname;
        campaigns = {};
        campaigns[path] = 'share,test';
        analytics.stub(window._curebitq, 'push');
      });

      it('should not register affiliate when the url doesnt match', function(){
        curebit.options.campaigns = { '/share': 'share,test' };
        analytics.page();
        analytics.didNotCall(window._curebitq.push);
      });

      it('should register affiliate when the url matches', function(){
        curebit.options.campaigns = campaigns;
        curebit.options.iframeId = 'curebit_integration';
        analytics.page();
        analytics.called(window._curebitq.push, ['register_affiliate', {
          responsive: true,
          device: '',
          campaign_tags : ['share', 'test'],
          iframe: {
            container: '',
            frameborder: 0,
            height: '480',
            id: 'curebit_integration',
            width: '100%'
          },
        }]);
      });

      it('should register affiliate with affiliate member info', function(){
        curebit.options.campaigns = campaigns;
        analytics.identify('id', {
          name: 'first last',
          email: 'name@example.com'
        });
        analytics.page();
        analytics.called(window._curebitq.push, ['register_affiliate', {
          responsive: true,
          device: '',
          campaign_tags : ['share', 'test'],
          iframe: {
            container: '',
            frameborder: 0,
            width: '100%',
            id: 'curebit_integration',
            height: '480',
          },
          affiliate_member: {
            email: 'name@example.com',
            first_name: 'first',
            last_name: 'last',
            customer_id: 'id'
          }
        }]);
      });

      it('should throttle', function(){
        window._curebitq = [];
        curebit.options.campaigns = campaigns;
        analytics.page();
        analytics.page();
        analytics.page();
        analytics.page();
        analytics.page();
        analytics.equal(window._curebitq.length, 1);
      });
    });

    describe('#completedOrder', function(){
      beforeEach(function(){
        analytics.stub(window._curebitq, 'push');
      });

      it('should send ecommerce data', function(){
        var date = new Date;

        analytics.track('completed order', {
          orderId: 'ab535a52',
          coupon: 'save20',
          date: date,
          total: 647.92,
          products: [{
            sku: '5be59f56',
            quantity: 8,
            price: 80.99,
            name: 'my-product',
            url: '//products.io/my-product',
            image: '//products.io/my-product.webp'
          }]
        });

        analytics.called(window._curebitq.push, ['register_purchase', {
          coupon_code: 'save20',
          customer_id: null,
          email: undefined,
          order_date: iso(date),
          first_name: undefined,
          last_name: undefined,
          order_number: 'ab535a52',
          subtotal: 647.92,
          items: [{
            product_id: '5be59f56',
            quantity: 8,
            price: 80.99,
            title: 'my-product',
            url: '//products.io/my-product',
            image_url: '//products.io/my-product.webp',
          }]
        }]);
      });
    });
  });
});
