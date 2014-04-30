
describe('ClickTale', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var ClickTale = require('integrations/lib/clicktale');
  var date = require('load-date');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var clicktale;
  var settings = {
    partitionId: 'www14',
    projectId: '19370',
    recordingRatio: '0.0089'
  };

  beforeEach(function(){
    analytics.use(ClickTale);
    clicktale = new ClickTale.Integration(settings);
    clicktale.initialize(); // noop
  });

  afterEach(function(){
    clicktale.reset();
  });

  it('should have the right settings', function(){
    test(clicktale)
      .name('ClickTale')
      .assumesPageview()
      .readyOnLoad()
      .global('WRInitTime')
      .option('httpCdnUrl', 'http://s.clicktale.net/WRe0.js')
      .option('httpsCdnUrl', '')
      .option('projectId', '')
      .option('recordingRatio', 0.01)
      .option('partitionId', '');
  });

  describe('#initialize', function(){
    it('should store the load time', function(){
      assert(!window.WRInitTime);
      clicktale.initialize();
      assert('number' === typeof window.WRInitTime);
    });

    it('should append the clicktale div', function(){
      clicktale.initialize();
      assert(document.getElementById('ClickTaleDiv'));
    });

    it('should call #load', function(){
      clicktale.load = sinon.spy();
      clicktale.initialize();
      assert(clicktale.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.ClickTale', function(){
      assert(!clicktale.loaded());
      window.ClickTale = document.createElement('div');
      assert(!clicktale.loaded());
      window.ClickTale = {};
      assert(!clicktale.loaded());
      window.ClickTale = function(){};
      assert(clicktale.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(clicktale, 'load');
      clicktale.initialize();
      clicktale.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!clicktale.loaded());
      clicktale.load(function (err) {
        if (err) return done(err);
        assert(clicktale.loaded());
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      window.ClickTaleSetUID = sinon.spy();
      window.ClickTaleField = sinon.spy();
    });

    it('should send an id', function(){
      test(clicktale)
      .identify('id')
      .called(window.ClickTaleSetUID)
      .with('id');
    });

    it('should send traits', function(){
      test(clicktale)
      .identify(null, { trait: true })
      .called(window.ClickTaleField)
      .with('trait', true);
    });

    it('should send an id and traits', function(){
      test(clicktale)
      .identify('id', { trait: true })
      .called(window.ClickTaleSetUID)
      .with('id')
      .called(window.ClickTaleField)
      .with('trait', true);
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      window.ClickTaleEvent = sinon.spy();
    });

    it('should send an event', function(){
      test(clicktale)
      .track('event')
      .called(window.ClickTaleEvent)
      .with('event');
    });
  });

});
