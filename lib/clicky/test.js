
var tester = require('analytics.js-integration-tester');
var analytics = require('analytics.js');
var Clicky = require('./index');
var assert = require('assert');
var equal = require('equals');
var sinon = require('sinon');

describe('Clicky', function(){
  var clicky;
  var test;
  var settings = {
    siteId: 100649848
  };

  beforeEach(function(){
    analytics.use(Clicky);
    clicky = new Clicky.Integration(settings);
    test = tester(clicky);
  });

  afterEach(function(){
    test.reset();
    analytics.user().reset();
  });

  after(function(){
    // set up global vars so clicky doesn't error other tests
    window.clicky_custom = {};
  });

  it('should have the right settings', function(){
    test
      .name('Clicky')
      .assumesPageview()
      .readyOnLoad()
      .global('clicky_site_ids')
      .option('siteId', null);
  });

  describe('#initialize', function(){
    it('should initialize the clicky global', function(){
      test
        .initialize()
        .deepEqual(window.clicky_site_ids, [settings.siteId]);
    });

    it('should call #load', function(){
      test
        .initialize()
        .called(clicky.load);
    });
  });

  describe('#loaded', function(){
    it('should test window.clicky', function(){
      assert(!test.loaded());
      window.clicky = document.createElement('div');
      assert(!test.loaded());
      window.clicky = {};
      assert(test.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      test.initialize();
      clicky.load.restore();
    });

    it('should change loaded state', function(done){
      assert(!test.loaded());
      test.load(function(err){
        if (err) return done(err);
        assert(test.loaded());
        done();
      });
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      window.clicky = {};
      test
        .initialize()
        .spy(window.clicky, 'log');
    });

    it('should send a path and title', function(){
      test
        .page(null, null, { path: '/path', title: 'title' })
        .called(window.clicky.log, '/path', 'title');
    });

    it('should prefer a name', function(){
      test
        .page(null, 'name', { path: '/path', title: 'title' })
        .called(window.clicky.log, '/path', 'name');
    });

    it('should prefer a name and category', function(){
      test
        .page('category', 'name', { path: '/path', title: 'title' })
        .called(window.clicky.log, '/path', 'category name');
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      test.initialize();
    });

    it('should set an id', function(){
      test
        .identify('id', {})
        .deepEqual(window.clicky_custom.session, { id: 'id' });
    });

    it('should set traits', function(){
      test
        .identify(null, { trait: true })
        .deepEqual(window.clicky_custom.session, { trait: true });
    });

    it('should set an id and traits', function(){
      test
        .identify('id', { trait: true })
        .deepEqual(window.clicky_custom.session, { id: 'id', trait: true });
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      window.clicky = {};
      test.spy(window.clicky, 'goal');
    });

    it('should send an event', function(){
      test
        .track('event', {})
        .called(window.clicky.goal, 'event');
    });

    it('should send revenue', function(){
      test
        .track('event', { revenue: 42.99 })
        .called(window.clicky.goal, 'event', 42.99);
    });
  });
});