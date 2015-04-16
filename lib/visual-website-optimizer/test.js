
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var tick = require('next-tick');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Visual Website Optimizer', function(){
  var VWO = plugin;
  var vwo;
  var analytics;
  var options = {};

  beforeEach(function(){
    analytics = new Analytics;
    vwo = new VWO(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(vwo);

    // set up fake VWO data to simulate the replay
    window._vwo_exp_ids = [1];
    window._vwo_exp = { 1: { comb_n: { 1: 'Variation' }, combination_chosen: 1 } };
    window._vis_opt_queue = [];
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    vwo.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(VWO, integration('Visual Website Optimizer')
      .option('replay', true));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(vwo, 'replay');
    });

    describe('#initialize', function(){
      it('should call replay', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(vwo.replay);
      });
    });

    describe('#replay', function(){
      it('should replay variation data');
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
        analytics.stub(window._vis_opt_queue, 'push');
        analytics.stub(window, '_vis_opt_revenue_conversion');
      });

      it('should track completed order', function(){
        analytics.track('completed order', {
          orderId: '12074d48',
          tax: 16,
          total: 166,
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

        window._vis_opt_queue.push.args[0][0]()
        analytics.assert.equal(window._vis_opt_revenue_conversion.args[0][0], 166);
      });
    });
  });

});