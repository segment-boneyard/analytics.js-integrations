
describe('Visual Website Optimizer', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var tick = require('next-tick');
  var VWO = require('integrations/lib/visual-website-optimizer');

  var vwo;
  var settings = {};

  beforeEach(function(){
    analytics.use(VWO);
    vwo = new VWO.Integration(settings);
    // set up fake VWO data to simulate the replay
    window._vwo_exp_ids = [1];
    window._vwo_exp = { 1: { comb_n: { 1: 'Variation' }, combination_chosen: 1 } };
  });

  afterEach(function(){
    vwo.reset();
  });

  it('should have the right settings', function(){
    test(vwo)
      .readyOnInitialize()
      .option('replay', true);
  });

  describe('#initialize', function(){
    it('should call replay', function(){
      vwo.replay = sinon.stub(vwo, 'replay');
      vwo.initialize();
      assert(vwo.replay.called);
      vwo.replay.restore();
    });
  });

  describe('#replay', function(){
    beforeEach(function(){
      sinon.stub(analytics, 'identify');
    });

    afterEach(function(){
      analytics.identify.restore();
    });

    it('should replay variation data');
  });

});