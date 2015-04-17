
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');
var each = require('each');

describe('Outbound', function(){
  var Outbound = plugin;
  var outbound;
  var analytics;
  var options = {
    publicApiKey: 'pub-7d8f3bb0e6613fd9bce6646bae622a6f'
  };

  beforeEach(function(){
    analytics = new Analytics();
    outbound = new Outbound(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(outbound);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    outbound.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Outbound, integration('Outbound')
      .global('outbound')
      .option('publicApiKey', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(outbound, 'load');
    });

    describe('#initialize', function(){
      it('should create initialize outbound', function(){
        analytics.assert(!window.outbound);
        analytics.initialize();
        analytics.assert(window.outbound);
      });

      it('should extend window.outbound with methods', function(){
        var methods = ['identify', 'track'];
        analytics.assert(!window.outbound);
        analytics.initialize();
        for (var method in methods){
          analytics.assert(window.outbound.methods[method]);
        }
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.called(outbound.load);
      });

    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(outbound, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.outbound, 'identify');
      });

      it('should send an id', function(){
        analytics.identify("testUser");
        analytics.called(window.outbound.identify);
      });

      it('should send traits as attributes, with user_id', function(){
        var traits = {
          email: "testing@outbound.io"
        }
        var attributes = {
          email: "testing@outbound.io",
          attributes: {}
        }
        var userId = "testUser"
        analytics.identify(userId, traits);
        analytics.called(window.outbound.identify, userId, attributes);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.outbound, 'track');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.outbound.track, 'event');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
      });
    });
  });
});
