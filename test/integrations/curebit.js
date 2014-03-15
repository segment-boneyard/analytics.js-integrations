
describe('Curebit', function(){

  var Curebit = require('integrations/lib/curebit');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var equals = require('equals');
  var sinon = require('sinon');
  var timeouts = require('clear-timeouts');
  var intervals = require('clear-intervals');
  var iso = require('to-iso-string');

  var curebit;
  var settings = {
    siteId: 'curebit-87ab995d-736b-45ba-ac41-71f4dbb5c74a',
    server: 'https://api.segment.io/track'
  };

  beforeEach(function(){
    analytics.use(Curebit);
    curebit = new Curebit.Integration(settings);
  })

  afterEach(function(){
    timeouts();
    intervals();
    curebit.reset();
  })

  it('should have the correct settings', function(){
    test(curebit)
      .name('Curebit')
      .readyOnInitialize()
      .global('_curebitq')
      .global('curebit')
      .option('siteId', '')
      .option('iframeBorder', 0)
      .option('iframeHeight', '480')
      .option('iframeWidth', '100%')
      .option('responsive', true)
      .option('device', '')
      .option('insertIntoId', '')
      .option('campaigns', {})
      .option('server', 'https://www.curebit.com');
  })

  describe('#initialize', function(){
    beforeEach(function(){
      curebit.load = sinon.spy();
    })

    it('should push settings', function(){
      test(curebit)
        .initialize()
        .changed(window._curebitq[0])
        .to(['init', {
          site_id: settings.siteId,
          server: 'https://api.segment.io/track'
        }]);
    })

    it('should call #load', function(){
      test(curebit)
        .initialize()
        .called(curebit.load);
    })
  })

  describe('#loaded', function(){
    it('should test window.curebit', function(){
      assert(!curebit.loaded());
      window.curebit = {};
      assert(curebit.loaded());
    })
  })

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(curebit, 'load');
      curebit.initialize();
      curebit.load.restore();
    })

    it('should change the loaded state', function(done){
      if (curebit.loaded()) return done(new Error('curebit already loaded'));
      curebit.load(function(err){
        if (err) return done(err);
        assert(curebit.loaded());
        done();
      })
    })
  })

  describe('#register-affiliate', function(){
    it('should not register affiliate when the url doesnt match', function(){
      curebit.options.campaigns = { '/share' : 'share' };
      curebit.initialize();
      equals(window._curebitq.length, 1);
    })

    it('should register affiliate when the url matches', function(){
      curebit.options.campaigns = { '/' : 'share' };
      curebit.options.iframeId = 'curebit-iframe';
      curebit.initialize();
      sinon.spy(window._curebitq, 'push');
      window._curebitq.push.calledWith(['register_affiliate', {
          responsive: true,
          device: '',
          iframe: {
            width: '100%',
            height: '480',
            id: 'curebit-iframe',
            frameborder: 0
          },
          campaign_tags : 'share'
      }]);


    })

    it('should register affiliate with affiliate member info', function(){
      curebit.options.campaigns = { '/' : 'share' };
      curebit.options.iframeId = 'curebit-iframe';
      analytics.identify('id', {
        firstName : 'john',
        lastName  : 'doe',
        email : 'my@email.com'
      });
      curebit.initialize();
      sinon.spy(window._curebitq, 'push');
      window._curebitq.push.calledWith(['register_affiliate', {
        responsive: true,
        device: '',
        iframe: {
          height: '100%',
          width: '480',
          id: 'curebit-iframe',
          frameborder: 0
        },
        campaign_tags : 'share',
        affiliate_member: {
          email: 'my@email.com',
          first_name: 'john',
          last_name: 'doe',
          customer_id: 'id'
        }
      }]);
    })
  })

  describe('ecommerce', function(){
    beforeEach(function(){
      analytics.user().reset();
      curebit.initialize();
      sinon.spy(window._curebitq, 'push');
    });

    afterEach(function(){
      window._curebitq.push.restore();
    })

    it('should send ecommerce data', function(){
      var date = new Date;

      test(curebit).track('completed order', {
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

      assert(window._curebitq.push.calledWith(['register_purchase', {
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
      }]))
    })
  })
})
