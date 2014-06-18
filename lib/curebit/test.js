
var test = require('analytics.js-integration-tester');
var intervals = require('clear-intervals');
var timeouts = require('clear-timeouts');
var analytics = require('analytics.js');
var iso = require('to-iso-string');
var Curebit = require('./index');
var assert = require('assert');
var domify = require('domify');
var equals = require('equals');
var sinon = require('sinon');

describe('Curebit', function(){
  var curebit;
  var test;
  var settings = {
    siteId: 'curebit-87ab995d-736b-45ba-ac41-71f4dbb5c74a',
    server: 'https://api.segment.io/track'
  };

  beforeEach(function(){
    analytics.use(Curebit);
    curebit = new Curebit.Integration(settings);
    test = tester(curebit);
  });

  afterEach(function(){
    timeouts();
    intervals();
    test.reset();
    analytics.user().reset();
    analytics.group().reset();
  });

  it('should have the correct settings', function(){
    test
      .name('Curebit')
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
      .option('server', 'https://www.curebit.com');
  });

  describe('#initialize', function(){
    it('should push settings', function(){
      test
        .initialize()
        .deepEqual(window._curebitq[0], ['init', {
          site_id: settings.siteId,
          server: 'https://api.segment.io/track'
        }]);
    });

    it('should call #load', function(){
      test
        .initialize()
        .called(curebit.load);
    });
  });

  describe('#loaded', function(){
    it('should test window.curebit', function(){
      assert(!test.loaded());
      window.curebit = {};
      assert(test.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      test.initialize();
      curebit.load.restore();
    });

    it('should change the loaded state', function(done){
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
      test
        .initialize()
        .spy(window._curebitq, 'push');
    });

    it('should not register affiliate when the url doesnt match', function(){
      curebit.options.campaigns = { '/share' : 'share, test' };
      test
        .page()
        .didntCall(window._curebitq.push);
    });

    it('should register affiliate when the url matches', function(){
      curebit.options.campaigns = { '/' : 'share,test' };
      curebit.options.iframeId = 'curebit_integration';
      test
        .page()
        .called(window._curebitq.push, ['register_affiliate', {
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
      analytics.identify('id', {
        firstName : 'john',
        lastName  : 'doe',
        email : 'my@email.com'
      });

      curebit.options.campaigns = { '/' : 'share,test' };
      test
        .page()
        .called(window._curebitq.push, ['register_affiliate', {
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
          email: 'my@email.com',
          first_name: 'john',
          last_name: 'doe',
          customer_id: 'id'
        }
      }]);
    });

    it('should throttle', function(){
      curebit.options.campaigns = { '/' : 'share,test' };
      test
        .page()
        .page()
        .page()
        .page()
        .page()
        .equal(1, window._curebitq.length);
    });
  });

  describe('#completedOrder', function(){
    beforeEach(function(){
      test
        .initialize()
        .spy(window._curebitq, 'push');
    });

    it('should send ecommerce data', function(){
      var date = new Date;
      test
        .track('completed order', {
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
        })
        .called(window._curebitq.push, ['register_purchase', {
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
