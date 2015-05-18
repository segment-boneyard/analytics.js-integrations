
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Elevio', function(){
  var Elevio = plugin;
  var elevio;
  var analytics;
  var options = {
    accountId: 'konami'
  };

  beforeEach(function(){
    analytics = new Analytics;
    elevio = new Elevio(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(elevio);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    elevio.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    // TODO: add any additional options or globals from the source file itself
    // to this list, and they will automatically get tested against, like:
    integration('Elevio')
      .option('accountId', '')
      .global('_elev')
    analytics.compare(Elevio, integration('Elevio')
      .assumesPageview())
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(elevio, done);
    });
    it('should create window._elev', function(done){
      analytics.load(elevio, done);
      analytics.assert(window._elev instanceof Object);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.load(elevio, done);
      // analytics.page();
    });

    describe('#identify', function(){
      beforeEach(function(){
        // TODO: stub the integration global api.
        // For example:
        // analytics.stub(window.api, 'identify');
      });

      it('should send an email', function(){
        analytics.identify(undefined, { email: 'name@example.com' });
        analytics.assert(window._elev.user.email === 'name@example.com');
      });

      it('should send a full name', function(){
        analytics.identify(undefined, { name: 'Test Person' });
        analytics.assert(window._elev.user.name === 'Test Person');
      });

      it('should not send name', function(){
        analytics.identify(undefined);
        analytics.assert(window._elev.user.name === undefined);
      });

      it('should send a first name', function(){
        analytics.identify(undefined, { firstName: 'Test' });
        analytics.assert(window._elev.user.name === 'Test');
      });

      it('should send a combined name', function(){
        analytics.identify(undefined, { firstName: 'Test', lastName: 'Person' });
        analytics.assert(window._elev.user.name === 'Test Person');
      });

      it('should send their plan', function(){
        analytics.identify(undefined, { plan: 'gold' });
        analytics.assert(window._elev.user.plan instanceof Array);
        analytics.assert(window._elev.user.plan[0] === 'gold');
      });
    });

  });
});
