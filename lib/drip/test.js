
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var sandbox = require('clear-env');
var Drip = require('./');

describe('Drip', function(){
  var analytics;
  var drip;
  var options = {
    account: '3826504'
  };

  beforeEach(function(){
    analytics = new Analytics();
    drip = new Drip(options);
    analytics.use(Drip);
    analytics.use(tester);
    analytics.add(drip);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    drip.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Drip, integration('Drip')
      .assumesPageview()
      .global('_dc')
      .global('_dcq')
      .global('_dcqi')
      .global('_dcs')
      .option('account', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(drip, 'load');
    });

    describe('#initialize', function(){
      it('should create window._dcq', function(){
        analytics.assert(!window._dcq);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._dcq instanceof Array);
      });

      it('should create window._dcs', function(){
        analytics.assert(!window._dcs);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._dcs);
        analytics.assert(window._dcs.account === options.account);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(drip.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(drip, done);
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
        analytics.stub(window._dcq, 'push');
      });

      it('should send event as the action', function(){
        analytics.track('event');
        analytics.called(window._dcq.push, ['track', 'event', {}]);
      });

      it('should convert and alias revenue', function(){
        analytics.track('event', { revenue: '$9.99' });
        analytics.called(window._dcq.push, ['track', 'event', { value: 999 }]);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._dcq, 'push');
      });

      it('should send identify with traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window._dcq.push, ['identify', { id: 'id', trait: true }]);
      });
    });
  });
});
