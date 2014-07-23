
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Improvely', function(){
  var Improvely = plugin;
  var improvely;
  var analytics;
  var options = {
    domain: 'demo',
    projectId: 1
  };

  beforeEach(function(){
    analytics = new Analytics;
    improvely = new Improvely(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(improvely);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    improvely.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Improvely, integration('Improvely')
      .assumesPageview()
      .global('_improvely')
      .global('improvely')
      .option('domain', '')
      .option('projectId', null));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(improvely, 'load');
    });

    describe('#initialize', function(){
      it('should create window._improvely', function(){
        analytics.assert(!window._improvely);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._improvely instanceof Array);
      });

      it('should create window.improvely', function(){
        analytics.assert(!window.improvely);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.improvely);
      });

      it('should init with a domain and project id', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._improvely[0], ['init', options.domain, options.projectId]);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(improvely.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(improvely, done);
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
        analytics.stub(window.improvely, 'label');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.improvely.label, 'id');
      });

      it('should not send if id is empty', function(){
        analytics.identify();
        analytics.didNotCall(window.improvely.label);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.improvely, 'goal');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.improvely.goal, { type: 'event' });
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window.improvely.goal, {
          type: 'event',
          property: true
        });
      });

      it('should alias revenue to amount', function(){
        analytics.track('event', { revenue: 42.99 });
        analytics.called(window.improvely.goal, {
          type: 'event',
          amount: 42.99
        });
      });
    });
  });
});