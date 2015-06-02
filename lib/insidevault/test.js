
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var InsideVault = require('./');

describe('InsideVault', function() {
  var analytics;
  var insideVault;
  var options = {
    clientId: 'test17',
    domain: 'testdomain.com',
    events: {
      'sign up': 'event1',
      'completed order': 'event2'
    }
  };

  beforeEach(function() {
    analytics = new Analytics();
    insideVault = new InsideVault(options);
    analytics.use(InsideVault);
    analytics.use(tester);
    analytics.add(insideVault);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    insideVault.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(InsideVault, integration('InsideVault')
      .global('_iva')
      .option('clientId', '')
      .option('domain', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(insideVault, 'load');
    });

    describe('#initialize', function() {
      it('should create window._iva and call load', function() {
        analytics.initialize();
        analytics.page();
        analytics.assert(window._iva instanceof Array);
        analytics.called(insideVault.load);
      });

      it('should pass in clientId', function() {
        window._iva = [];
        analytics.stub(window._iva, 'push');
        analytics.initialize();
        analytics.page();
        analytics.called(window._iva.push, ['setClientId', insideVault.options.clientId]);
      });

      it('should pass in userId', function() {
        window._iva = [];
        analytics.stub(window._iva, 'push');
        analytics.user().anonymousId('user-id');
        analytics.initialize();
        analytics.page();
        analytics.called(window._iva.push, ['setUserId', 'user-id']);
      });

      it('should pass in domain if present', function() {
        window._iva = [];
        analytics.stub(window._iva, 'push');
        analytics.initialize();
        analytics.page();
        analytics.called(window._iva.push, ['setDomain', insideVault.options.domain]);
      });

      it('should not pass in domain if blank', function() {
        window._iva = [];
        insideVault.options.domain = null;
        analytics.stub(window._iva, 'push');
        analytics.initialize();
        analytics.page();
        analytics.didNotCall(window._iva.push, ['setDomain', insideVault.options.domain]);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(insideVault, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function() {
      beforeEach(function() {
        analytics.stub(window._iva, 'push');
      });

      it('should send "click" event', function() {
        analytics.page();
        analytics.called(window._iva.push, ['trackEvent', 'click']);
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window._iva, 'push');
      });

      it('should track an event', function() {
        analytics.user().anonymousId('id');
        analytics.track('sign up');
        analytics.called(window._iva.push, ['trackEvent', 'event1', 0, 'id']);
      });

      it('should track an event with revenue', function() {
        analytics.user().anonymousId('id');
        analytics.track('completed order', { revenue: '0.75' });
        analytics.called(window._iva.push, ['trackEvent', 'event2', 0.75, 'id']);
      });

      it('should track an event with value', function() {
        analytics.user().anonymousId('id');
        analytics.track('completed order', { value: 1.23 });
        analytics.called(window._iva.push, ['trackEvent', 'event2', 1.23, 'id']);
      });

      it('should track an event with revenue and order id', function() {
        analytics.track('completed order', { revenue: '89.7', orderId: 'abc123' });
        analytics.called(window._iva.push, ['trackEvent', 'event2', 89.7, 'abc123']);
      });

      it('should track an event with userId and orderId, using orderId', function() {
        analytics.user().anonymousId('id');
        analytics.track('completed order', { orderId: 'abc123' });
        analytics.called(window._iva.push, ['trackEvent', 'event2', 0, 'abc123']);
      });

      it('should fall back to userId if no orderId', function() {
        analytics.user().anonymousId('id');
        analytics.track('sign up');
        analytics.called(window._iva.push, ['trackEvent', 'event1', 0, 'id']);
      });

      it('should track multiple events', function() {
        insideVault.options.events = [
          { key: 'completed order', value: 'event1' },
          { key: 'completed order', value: 'event2' }
        ];

        window._iva = [];
        analytics.track('completed order', { orderId: 'id', revenue: 9.99 });
        analytics.assert.deepEqual(window._iva, [
          ['trackEvent', 'event1', 9.99, 'id'],
          ['trackEvent', 'event2', 9.99, 'id']
        ]);
      });

      it('should not track a "sale" event', function() {
        analytics.track('sale');
        analytics.didNotCall(window._iva.push);
      });

      it('should not track unmapped event', function() {
        analytics.track('event');
        analytics.didNotCall(window._iva.push);
      });
    });
  });
});
