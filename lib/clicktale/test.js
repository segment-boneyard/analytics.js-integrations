
var test = require('analytics.js-integration-tester');
var analytics = require('analytics.js');
var ClickTale = require('./index');
var date = require('load-date');
var assert = require('assert');
var sinon = require('sinon');

describe('ClickTale', function(){
  var clicktale;
  var test;
  var settings = {
    partitionId: 'www14',
    projectId: '19370',
    recordingRatio: '0.0089'
  };

  beforeEach(function(){
    analytics.use(ClickTale);
    clicktale = new ClickTale.Integration(settings);
    test = tester(clicktale);
  });

  afterEach(function(){
    test.reset();
  });

  it('should have the right settings', function(){
    test
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
      test.initialize();
      assert('number' === typeof window.WRInitTime);
    });

    it('should append the clicktale div', function(){
      test.initialize();
      assert(document.getElementById('ClickTaleDiv'));
    });

    it('should call #load', function(){
      test
        .initialize()
        .called(clicktale.load);
    });
  });

  describe('#loaded', function(){
    it('should test window.ClickTale', function(){
      assert(!test.loaded());
      window.ClickTale = document.createElement('div');
      assert(!test.loaded());
      window.ClickTale = {};
      assert(!test.loaded());
      window.ClickTale = function(){};
      assert(test.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      test.initialize();
      clicktale.load.restore();
    });

    it('should change loaded state', function(done){
      assert(!test.loaded());
      test.load(function(err){
        if (err) return done(err);
        assert(test.loaded());
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      test
        .spy(window, 'ClickTaleSetUID')
        .spy(window, 'ClickTaleField');
    });

    it('should send an id', function(){
      test
        .identify('id')
        .called(window.ClickTaleSetUID, 'id');
    });

    it('should send traits', function(){
      test
        .identify(null, { trait: true })
        .called(window.ClickTaleField, 'trait', true);
    });

    it('should send an id and traits', function(){
      test
        .identify('id', { trait: true })
        .called(window.ClickTaleSetUID, 'id')
        .called(window.ClickTaleField, 'trait', true);
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      test.spy(window, 'ClickTaleEvent');
    });

    it('should send an event', function(){
      test
        .track('event')
        .called(window.ClickTaleEvent, 'event');
    });
  });
});