
var tester = require('analytics.js-integration-tester');
var analytics = require('analytics.js');
var Chartbeat = require('./index');
var defaults = require('defaults');
var assert = require('assert');
var equal = require('equals');

describe('Chartbeat', function(){
  var chartbeat;
  var test;
  var settings = {
    uid: 'x',
    domain: 'example.com'
  };

  beforeEach(function(){
    analytics.use(Chartbeat);
    chartbeat = new Chartbeat.Integration(settings);
    test = tester(chartbeat);
  });

  afterEach(function(){
    test.reset();
  });

  it('should have the right settings', function(){
    test
      .name('Chartbeat')
      .assumesPageview()
      .readyOnLoad()
      .global('_sf_async_config')
      .global('_sf_endpt')
      .global('pSUPERFLY')
      .option('domain', '')
      .option('uid', null);
  });

  describe('#initialize', function(){
    afterEach(function(){
      window._sf_async_config = undefined;
    });

    it('should create window._sf_async_config', function(){
      var expected = defaults(settings, { useCanonical: true });
      test
        .initialize()
        .deepEqual(window._sf_async_config, expected);
    });

    it('should inherit global window._sf_async_config defaults', function(){
      window._sf_async_config = {
        sponsorName: 'exampleSponsor',
        authors: 'exampleAuthors'
      };
      var expected = defaults(settings, window._sf_async_config, {
        useCanonical: true
      });

      test
        .initialize()
        .deepEqual(window._sf_async_config, expected);
    });

    it('should allow overriding global window._sf_async_config', function(){
      window._sf_async_config = {
        sponsorName: 'exampleSponsor',
        authors: 'exampleAuthors'
      };
      var expected = defaults(settings, window._sf_async_config, {
        useCanonical: true,
        sponsorName: 'overrideSponsor'
      });
      test
        .initialize({ sponsorName: 'overrideSponsor' })
        .deepEqual(window._sf_async_config, expected);
    });

    it('should call #load', function(){
      test
        .initialize()
        .called(chartbeat.load);
    });

    it('should create window._sf_endpt', function(){
      test.initialize();
      assert('number' === typeof window._sf_endpt);
    });
  });

  describe('#loaded', function(){
    it('should test window.pSUPERFLY', function(){
      assert(!test.loaded());
      window.pSUPERFLY = {};
      assert(test.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function (){
      test.initialize();
      chartbeat.load.restore();
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
      window.pSUPERFLY = {};
      test
        .initialize()
        .stub(window.pSUPERFLY, 'virtualPage');
    });

    it('should send a path and title', function(){
      test
        .page(null, null, { path: '/path', title: 'title' })
        .called(window.pSUPERFLY.virtualPage, '/path', 'title');
    });

    it('should prefer a name', function(){
      test
        .page(null, 'name', { path: '/path', title: 'title' })
        .called(window.pSUPERFLY.virtualPage, '/path', 'name');
    });

    it('should prefer a name and category', function(){
      test
        .page('category', 'name', { path: '/path', title: 'title' })
        .called(window.pSUPERFLY.virtualPage, '/path', 'category name');
    });
  });
});