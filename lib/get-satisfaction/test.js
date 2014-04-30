
describe('Get Satisfaction', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var GetSatisfaction = require('integrations/lib/get-satisfaction');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var gs;
  var settings = {
    widgetId: 5005
  };

  beforeEach(function(){
    analytics.use(GetSatisfaction);
    gs = new GetSatisfaction.Integration(settings);
    gs.initialize(); // noop
  });

  afterEach(function(){
    gs.reset();
  });

  it('should have the right settings', function(){
    test(gs)
      .name('Get Satisfaction')
      .assumesPageview()
      .readyOnLoad()
      .global('GSFN')
      .option('widgetId', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      gs.load = sinon.spy();
    });

    it('should add the get satisfaction widget to the dom', function(){
      gs.initialize();
      assert(document.getElementById('getsat-widget-' + settings.widgetId));
    });

    it('should call #load', function(){
      gs.initialize();
      assert(gs.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.GSFN', function(){
      assert(!gs.loaded());
      window.GSFN = {};
      assert(gs.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(gs, 'load');
      gs.initialize();
      gs.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!gs.loaded());
      gs.load(function (err) {
        if (err) return done(err);
        assert(gs.loaded());
        done();
      });
    });
  });

});