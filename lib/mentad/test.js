var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('MentAd', function(){
  var MentAd = plugin;
  var mentAd;
  var analytics;
  var options = {
      mentad_website_id: "1",
      mentad_purchase_items: [{ category: "cat", quantity: 1, price: 5, name: "name", sku: 1, currency: "USD" }],
      mentad_shopper_info: { first_name: "first", last_name: "last", address: "address", email: "some@email.com", phone: "055-12345678" },
      mentad_purchase_currency: 'USD',
      mentad_purchase_total: '5',
      mentad_purchase_order_id: '1',
      mentad_purchase_type: 'purchase'
  };

  beforeEach(function(){
    analytics = new Analytics;
    mentAd = new MentAd(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(mentAd);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    mentAd.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(MentAd, integration('MentAd')
      .global('mentad_website_id')
      .global('mentad_purchase_items')
      .global('mentad_shopper_info')
      .global('mentad_purchase_currency')
      .global('mentad_purchase_total')
      .global('mentad_purchase_order_id')
      .global('mentad_purchase_type')
      .option('mentad_website_id', "###")
      .option('mentad_purchase_currency', "###")
      .option('mentad_purchase_total', '###')
      .option('mentad_purchase_order_id', '###')
      .option('mentad_purchase_type', '###'))
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(mentAd, 'load');
      analytics.stub(mentAd, 'debug');
    });

    afterEach(function(){
      mentAd.reset();
    });

    describe('#initialize', function(){
      it('should initialize', function(){
        analytics.debug();
        analytics.initialize();
      });
    });

  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(mentAd, done);
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
        analytics.stub(window.mentad_shopper_info, {});
        analytics.stub(window.mentad_purchase_items, []);
      });

      it('should send ecommerce data', function(){
        analytics.identify('id', {
                            email: 'some@email.com',
                            first_name: 'first',
                            last_name: 'last',
                            address: 'address',
                            phone: '055-12345678' });
        analytics.track('completed order', {
          products: [{ sku: '1', quantity: 1, name: 'name', price: 5, category: 'cat' }],
          orderId: '1'
        });

        analytics.deepEqual(window.mentad_purchase_items, [{
                sku: '1',
                quantity: 1,
                name: 'name',
                price: 5,
                category: 'cat',
                currency: 'USD'
        }]);
        analytics.deepEqual(window.mentad_shopper_info, {
                            email: 'some@email.com',
                            first_name: 'first',
                            last_name: 'last',
                            address: 'address',
                            phone: '055-12345678' });
      });
    });
  });
});
