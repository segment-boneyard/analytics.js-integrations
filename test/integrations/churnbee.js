
describe('ChurnBee', function(){

  var Churnbee = require('integrations/lib/churnbee');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var sinon = require('sinon');

  var churnbee;
  var options = {
    _setApiKey: 'h_pEvkGaxoKEMgadS5-GlToHZJkGAXq70wlwUg87ZA0',
  };

  beforeEach(function(){
    analytics.use(Churnbee);
    churnbee = new Churnbee.Integration(options);
  })

  afterEach(function(){
    churnbee.reset();
  })

  it('should have the correct options', function(){
    test(churnbee)
    .name('ChurnBee')
    .assumesPageView()
    .readyOnLoad()
    .global('_cbq')
    .global('ChurnBee')
    .option('_setApiKey', '');
  })

  describe('#initialize', function(){
    beforeEach(function(){
      churnbee.load = sinon.spy();
    })

    it('should create window._cbq', function(){
      assert(!window._cbq);
      churnbee.initialize();
      assert(window._cbq);
      assert(window._cbq.constructor == Array);
    })

    it('should set the api key', function(){
      assert(!window._cbq);
      churnbee.initialize();
      assert('_setApiKey' == window._cbq[0][0]);
      assert(churnbee.options._setApiKey == window._cbq[0][1]);
    })

    it('should call #load', function(){
      churnbee.initialize();
      assert(churnbee.load.called);
    })
  })

  describe('#loaded', function(){
    beforeEach(function(){
      churnbee.initialize();
    })

    it('should test window.ChurnBee', function(){
      assert(!window.ChurnBee);
      assert(!churnbee.loaded());
      window.ChurnBee = {};
      assert(churnbee.loaded());
    })
  })

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(churnbee, 'load');
      churnbee.initialize();
      churnbee.load.restore();
    })

    it('should load churnbee', function(done){
      if (churnbee.loaded()) return done(new Error('#loaded before #load'));
      churnbee.load(function(err){
        if (err) return done(err);
        assert(churnbee.loaded());
        done();
      })
    })
  })

  describe('#track', function(){
    beforeEach(function(){
      churnbee.initialize();
      sinon.stub(window._cbq, 'push');
    })

    it('should call _cbq.push', function(){
      var props = { userId: 'baz' };
      churnbee.track('register', props);
      assert(window._cbq.push.calledWith(['register', props]));
    })
  })


})
