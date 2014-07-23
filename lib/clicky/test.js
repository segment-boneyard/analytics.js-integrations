
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Clicky', function(){
  var Clicky = plugin;
  var clicky;
  var analytics;
  var options = {
    siteId: 100649848
  };

  beforeEach(function(){
    analytics = new Analytics;
    clicky = new Clicky(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(clicky);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    clicky.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Clicky, integration('Clicky')
      .assumesPageview()
      .global('clicky_site_ids')
      .option('siteId', null));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(clicky, 'load');
    });

    describe('#initialize', function(){
      it('should initialize the clicky global', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window.clicky_site_ids, [ options.siteId ]);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(clicky, done);
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
        analytics.stub(window.clicky, 'log');
      });

      it('should send a path and title', function(){
        analytics.page({ path: '/path', title: 'title' });
        analytics.called(window.clicky.log, '/path', 'title');
      });

      it('should prefer a name', function(){
        analytics.page('name', { path: '/path', title: 'title' });
        analytics.called(window.clicky.log, '/path', 'name');
      });

      it('should prefer a name and category', function(){
        analytics.page('category', 'name', { path: '/path', title: 'title' });
        analytics.called(window.clicky.log, '/path', 'category name');
      });
    });

    describe('#identify', function(){
      afterEach(function(){
        delete window.clicky_custom.session;
      });

      it('should set an id', function(){
        analytics.identify('id');
        analytics.deepEqual(window.clicky_custom.session, { id: 'id' });
      });

      it('should set traits', function(){
        analytics.identify({ trait: true });
        analytics.deepEqual(window.clicky_custom.session, { trait: true });
      });

      it('should set an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.deepEqual(window.clicky_custom.session, { id: 'id', trait: true });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.clicky, 'goal');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.clicky.goal, 'event');
      });

      it('should send revenue', function(){
        analytics.track('event', { revenue: 42.99 });
        analytics.called(window.clicky.goal, 'event', 42.99);
      });
    });
  });
});
