
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var plugin = require('./');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');

describe('Route', function(){
  var Route = plugin;
  var route;
  var analytics;
  var options = {
    organizationId: '553e9be7ab3e3a16d07a2432'
  };

  beforeEach(function(){
    analytics = new Analytics;
    route = new Route(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(route);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    route.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Route, integration('Route')
      .global('_rq')
      .global('_route')
      .option('organizationId', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(route, 'load');
    });

    afterEach(function(){
      route.reset();
    });

    describe('#initialize', function(){
      it('should create window._rq and window._route objects', function(){
        analytics.assert(!window._rq && !window._route);
        analytics.initialize();
        analytics.assert(!!window._rq && !!window._route);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.called(route.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(route, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._route, 'identify');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window._route.identify, { id: 'id' });
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        analytics.called(window._route.identify, { trait: true });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window._route.identify, { id: 'id', trait: true });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._route, 'track');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window._route.track, 'event');
      });
    });
  });
});
