
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Rollbar', function(){
  var Rollbar = plugin;
  var rollbar;
  var analytics;
  var options = {
    accessToken: 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    environment: 'testenvironment',
  };

  beforeEach(function(){
    prevOnError = window.onerror;
    analytics = new Analytics;
    rollbar = new Rollbar(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(rollbar);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    sandbox();
    rollbar.reset();
  });

  it('should have the right settings', function(){
    analytics.compare(Rollbar, integration('Rollbar')
      .global('Rollbar')
      .option('accessToken', '')
      .option('identify', true));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(rollbar, 'load');
    });

    describe('#initialize', function(){
      it('should create the window.Rollbar object', function(){
        analytics.assert(!window.Rollbar);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.Rollbar);
      });

      it('should have all of the correct methods', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(window.Rollbar);
        analytics.assert(window.Rollbar.debug);
        analytics.assert(window.Rollbar.info);
        analytics.assert(window.Rollbar.warning);
        analytics.assert(window.Rollbar.error);
        analytics.assert(window.Rollbar.critical);
        analytics.assert(window.Rollbar.configure);
        analytics.assert(window.Rollbar.scope);
      });

      it('should set window.onerror', function(){
        var onerr = window.onerror;
        analytics.initialize();
        analytics.page();
        analytics.assert(window.onerror !== onerr);
        analytics.assert(typeof window.onerror === 'function');
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(rollbar.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(rollbar, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window, 'onerror');
        analytics.stub(window.Rollbar, 'configure');
      });

      it('should send an id', function(){
        analytics.identify('id', {});
        analytics.called(window.Rollbar.configure, {
          payload: { person: { id: 'id' } }
        });
      });

      it('should not send only traits', function(){
        analytics.identify({ trait: true });
        analytics.didNotCall(window.Rollbar.configure);
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.Rollbar.configure, {
          payload: { person: { id: 'id', trait: true } }
        });
      });
    });

    describe('window.onerror', function(){
      beforeEach(function(){
        analytics.stub(window.Rollbar, 'uncaughtError');
      });

      it("should call window.Rollbar.uncaughtError", function(){
        var err = new Error('testing');
        window.onerror(
          'test message',
          'http://foo.com',
          33,
          21,
          err
        );
        analytics.called(window.Rollbar.uncaughtError,
          'test message',
          'http://foo.com',
          33,
          21,
          err
        );
      });
    });
  });
});