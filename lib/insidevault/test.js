
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');

describe('InsideVault', function(){
  var InsideVault = plugin;
  var iv;
  var analytics;
  var options = {
    clientId: 'test17',
    domain: 'testdomain.com'
  };

  beforeEach(function(){
    analytics = new Analytics;
    iv = new InsideVault(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(iv);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    iv.reset();
  });

  it('should have the right settings', function(){
    analytics.compare(InsideVault, integration('InsideVault')
      .global('_iva')
      .option('clientId', '')
      .option('domain', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(iv, 'load');
    });

    afterEach(function(){
      iv.reset();
    });

    describe('#initialize', function(){
      it('should create window._iva and call load', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(window._iva instanceof Array);
        analytics.called(iv.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(iv, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window._iva, 'push');
      });

      it('should not make any event calls', function(){
        analytics.page();
        analytics.didNotCall(window._iva.push);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._iva, 'push');
      });

      it('should track an event', function(){
        analytics.track('event1');
        analytics.called(window._iva.push, ['trackEvent', 'event1', 0, '']);
      });

      it('should track an event with revenue', function(){
        analytics.track('event2', { revenue: '0.75' });
        analytics.called(window._iva.push, ['trackEvent', 'event2', 0.75, '']);
      });

      it('should track an event with value', function(){
        analytics.track('event3', { value: 1.23 });
        analytics.called(window._iva.push, ['trackEvent', 'event3', 1.23, '']);
      });

      it('should track an event with revenue and order id', function(){
        analytics.track('event4', { revenue: '89.7', orderId: 'abc123' });
        analytics.called(window._iva.push, ['trackEvent', 'event4', 89.7, 'abc123']);
      });

      it('should not track a "sale" event', function(){
        analytics.track('sale');
        analytics.didNotCall(window._iva.push);
      });
    });
  });
});