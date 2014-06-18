
var tester = require('analytics.js-integration-tester');
var intervals = require('clear-intervals');
var timeouts = require('clear-timeouts');
var analytics = require('analytics.js');
var ChurnBee = require('./index');
var assert = require('assert');
var equal = require('equals');
var sinon = require('sinon');

describe('ChurnBee', function(){
  var churnbee;
  var test;
  var settings = {
    apiKey: 'h_pEvkGaxoKEMgadS5-GlToHZJkGAXq70wlwUg87ZA0'
  };

  beforeEach(function(){
    analytics.use(ChurnBee);
    churnbee = new ChurnBee.Integration(settings);
    test = tester(churnbee);
  });

  afterEach(function(){
    intervals();
    timeouts();
    churnbee.reset();
  });

  it('should have the correct options', function(){
    test
      .name('ChurnBee')
      .readyOnInitialize()
      .global('_cbq')
      .global('ChurnBee')
      .option('apiKey', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      window._cbq = [];
      test.spy(window._cbq, 'push');
    });

    it('should call #load', function(){
      assert(!churnbee.load.called);
      churnbee.initialize();
      assert(churnbee.load.called);
    });

    it('should push the api key', function(){
      churnbee)
        .initialize()
        .called(window._cbq.push, [
          '_setApiKey', 
          'h_pEvkGaxoKEMgadS5-GlToHZJkGAXq70wlwUg87ZA0'
        ]);
    });
  });

  describe('#loaded', function(){
    it('should test window.ChurnBee', function(){
      assert(!test.loaded());
      window.ChurnBee = {};
      assert(test.loaded());
    });
  });

  describe('#load', function(){
    it('should change the loaded state', function(done){
      test.loads(done);
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      test.initialize();
      window._cbq = [];
      test.spy(window._cbq, 'push');
    });

    it('should ignore non standard events', function(){
      test
        .track('baz')
        .called(window._cbq.push);
    });

    it('should allow standard events', function(){
      test
        .track('login')
        .called(window._cbq.push, ['login', {}]);
    });

    it('should try and map non standard events using `events` option', function(){
      churnbee.options.events = { UserLoggedIn: 'login' };
      test
        .track('UserLoggedIn')
        .called(window._cbq.push, ['login', {}]);
    });

    it('should alias `revenue` to `amount`', function(){
      test
        .track('register', { revenue: 90 })
        .called(window._cbq.push, ['register', { amount: 90 }]);
    });
  });
});