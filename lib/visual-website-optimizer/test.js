
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
  var options = {
    events: {
      'Test': '102',
      'Completed Order': '3'
    }
  };

  beforeEach(function(){
    analytics = new Analytics;
    vwo = new VWO(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(vwo);

    // set up fake VWO data to simulate the replay
    window._vwo_exp_ids = [1];
    window._vwo_exp = { 1: { comb_n: { 1: 'Variation' }, combination_chosen: 1 } };
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    vwo.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(VWO, integration('Visual Website Optimizer')
      .option('replay', true)
      .mapping('events'));
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
    });

    describe('#track', function(){
      beforeEach(function(){
        window._vis_opt_queue = window._vis_opt_queue || [];
        analytics.stub(window._vis_opt_queue, 'push');
      })

      it('should not send if event is not defined', function(){
        analytics.track('toString', {});
        analytics.didNotCall( window._vis_opt_queue.push )
      });

      it('should send event if it is defined', function(){
        analytics.track('Test', {});
        analytics.called( window._vis_opt_queue.push );

        // analytics.called( window._vis_opt_queue.push , function() {
        //   _vis_opt_goal_conversion('102')
        // });

      });

      it('should send event if revenue is defined', function(){
        analytics.track('Other', { revenue: 12 });
        analytics.called( window._vis_opt_queue.push );

        // analytics.called( window._vis_opt_queue.push , function() {
        //   _vis_opt_revenue_conversion(12)
        // });

      });

      it('should send both if revenue & event are defined', function(){
        analytics.track('Completed Order', { revenue: 12 });
        analytics.calledTwice( window._vis_opt_queue.push );

        // analytics.called( window._vis_opt_queue.push , function() {
        //   _vis_opt_goal_conversion('3')
        // });

        // analytics.called( window._vis_opt_queue.push , function() {
        //   _vis_opt_revenue_conversion(12)
        // });

      });
    });
  });
});