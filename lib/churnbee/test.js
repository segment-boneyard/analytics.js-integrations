
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('ChurnBee', function(){
  var ChurnBee = plugin;
  var churnbee;
  var analytics;
  var options = {
    apiKey: 'h_pEvkGaxoKEMgadS5-GlToHZJkGAXq70wlwUg87ZA0',
    events: {
      'Logged In': 'login'
    }
  };

  beforeEach(function(){
    analytics = new Analytics;
    churnbee = new ChurnBee(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(churnbee);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    churnbee.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(ChurnBee, integration('ChurnBee')
      .global('_cbq')
      .global('ChurnBee')
      .option('apiKey', '')
      .mapping('events'));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(churnbee, 'load');
    });

    describe('#initialize', function(){
      beforeEach(function(){
        window._cbq = [];
        analytics.stub(window._cbq, 'push');
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.called(churnbee.load);
      });

      it('should push the api key', function(){
        analytics.initialize();
        analytics.called(window._cbq.push, [
          '_setApiKey',
          'h_pEvkGaxoKEMgadS5-GlToHZJkGAXq70wlwUg87ZA0'
        ]);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(churnbee, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._cbq, 'push');
      });

      it('should ignore non standard events', function(){
        analytics.track('non-standard');
        analytics.didNotCall(window._cbq.push);
      });

      it('should allow standard events', function(){
        analytics.track('login');
        analytics.called(window._cbq.push, ['login', {}]);
      });

      it('should try and map non standard events using `events` option', function(){
        analytics.track('Logged In');
        analytics.called(window._cbq.push, ['login', {}]);
      });

      it('should support array events', function(){
        churnbee.options.events = [{ key: 'event', value: 'login' }];
        analytics.track('event');
        analytics.called(window._cbq.push, ['login', {}]);
      })

      it('should alias `revenue` to `amount`', function(){
        analytics.track('register', { revenue: 90 });
        analytics.called(window._cbq.push, ['register', { amount: 90 }]);
      });
    });
  });
});
