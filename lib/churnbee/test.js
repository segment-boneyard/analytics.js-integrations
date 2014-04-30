
describe('ChurnBee', function(){

  var ChurnBee = require('integrations/lib/churnbee');
  var intervals = require('clear-intervals');
  var timeouts = require('clear-timeouts');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var sinon = require('sinon');
  var churnbee;

  var settings = {
    apiKey: 'h_pEvkGaxoKEMgadS5-GlToHZJkGAXq70wlwUg87ZA0'
  };

  beforeEach(function(){
    analytics.use(ChurnBee);
    churnbee = new ChurnBee.Integration(settings);
  })

  afterEach(function(){
    intervals();
    timeouts();
    churnbee.reset();
  })

  it('should have the correct options', function(){
    test(churnbee)
      .name('ChurnBee')
      .readyOnInitialize()
      .global('_cbq')
      .global('ChurnBee')
      .option('apiKey', '');
  })

  describe('#initialize', function(){
    beforeEach(function(){
      window._cbq = [];
      window._cbq.push = sinon.spy();
      churnbee.load = sinon.spy();
    })

    afterEach(function(){
      window._cbq.push.reset();
    })

    it('should call #load', function(){
      assert(!churnbee.load.called);
      churnbee.initialize();
      assert(churnbee.load.called);
    })

    it('should push the api key', function(){
      test(churnbee)
        .initialize()
        .called(window._cbq.push)
        .with(['_setApiKey', 'h_pEvkGaxoKEMgadS5-GlToHZJkGAXq70wlwUg87ZA0']);
    })
  })

  describe('#loaded', function(){
    it('should test window.ChurnBee', function(){
      assert(!churnbee.loaded());
      window.ChurnBee = {};
      assert(churnbee.loaded());
    })
  })

  describe('#load', function(){
    it('should change the loaded state', function(done){
      test(churnbee).loads(done);
    })
  })

  describe('#track', function(){
    beforeEach(function(){
      churnbee.initialize();
      window._cbq = [];
      window._cbq.push = sinon.spy();
    })

    afterEach(function(){
      window._cbq.push.reset();
    })

    it('should ignore non standard events', function(){
      test(churnbee).track('baz');
      assert(!window._cbq.push.called);
    })

    it('should allow standard events', function(){
      test(churnbee)
        .track('login')
        .called(window._cbq.push)
        .with(['login', {}]);
    })

    it('should try and map non standard events using `events` option', function(){
      churnbee.options.events = { UserLoggedIn: 'login' };
      test(churnbee)
        .track('UserLoggedIn')
        .called(window._cbq.push)
        .with(['login', {}]);
    })

    it('should alias `revenue` to `amount`', function(){
      test(churnbee)
        .track('register', { revenue: 90 })
        .called(window._cbq.push)
        .with(['register', { amount: 90 }]);
    })
  })
})
