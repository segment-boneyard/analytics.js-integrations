
describe('Chartbeat', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Chartbeat = require('integrations/lib/chartbeat');
  var defaults = require('defaults');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var chartbeat;

  // Custom settings passed to constructor.
  var settings = {
    uid: 'x',
    domain: 'example.com'
  };

  beforeEach(function () {
    analytics.use(Chartbeat);
    chartbeat = new Chartbeat.Integration(settings);
    chartbeat.initialize();
  });

  afterEach(function(){
    chartbeat.reset();
  });

  it('should have the right settings', function(){
    test(chartbeat)
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
    beforeEach(function(){
      chartbeat.load = sinon.spy();
    });

    afterEach(function(){
      window._sf_async_config = undefined;
    });

    it('should create window._sf_async_config', function(){
      chartbeat.initialize();
      var expected = defaults(settings, { useCanonical: true });
      assert(equal(window._sf_async_config, expected));
    });

    it('should inherit global window._sf_async_config defaults', function(){
      window._sf_async_config = {
        sponsorName: 'exampleSponsor',
        authors: 'exampleAuthors'
      };
      chartbeat.initialize();
      var expected = defaults(settings, window._sf_async_config, {
        useCanonical: true
      });
      assert(equal(window._sf_async_config, expected));
    });

    it('should allow overriding global window._sf_async_config', function(){
      window._sf_async_config = {
        sponsorName: 'exampleSponsor',
        authors: 'exampleAuthors'
      };
      chartbeat.initialize({
        sponsorName: 'overrideSponsor'
      });
      var expected = defaults(settings, window._sf_async_config, {
        useCanonical: true,
        sponsorName: 'overrideSponsor'
      });
      assert(equal(window._sf_async_config, expected));
    });

    it('should call #load', function(){
      chartbeat.initialize();
      assert(chartbeat.load.called);
    });

    it('should create window._sf_endpt', function(){
      chartbeat.initialize();
      assert('number' === typeof window._sf_endpt);
    });

    it('should call #load', function(){
      chartbeat.initialize();
      assert(chartbeat.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.pSUPERFLY', function(){
      assert(!chartbeat.loaded());
      window.pSUPERFLY = {};
      assert(chartbeat.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function (){
      sinon.stub(chartbeat, 'load');
      chartbeat.initialize();
      chartbeat.load.restore();
    });

    it('should change loaded state', function(done){
      assert(!chartbeat.loaded());
      chartbeat.load(function (err) {
        if (err) return done(err);
        assert(chartbeat.loaded());
        done();
      });
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      chartbeat.initialize();
      window.pSUPERFLY = { virtualPage: sinon.spy() };
    });

    it('should send a path and title', function(){
      test(chartbeat)
        .page(null, null, { path: '/path', title: 'title' })
        .called(window.pSUPERFLY.virtualPage)
        .with('/path', 'title');
    });

    it('should prefer a name', function(){
      test(chartbeat)
        .page(null, 'name', { path: '/path', title: 'title' })
        .called(window.pSUPERFLY.virtualPage)
        .with('/path', 'name');
    });

    it('should prefer a name and category', function(){
      test(chartbeat)
        .page('category', 'name', { path: '/path', title: 'title' })
        .called(window.pSUPERFLY.virtualPage)
        .with('/path', 'category name');
    });
  });

});
