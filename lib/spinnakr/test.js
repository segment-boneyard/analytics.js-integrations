
describe('Spinnakr', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var Spinnakr = require('integrations/lib/spinnakr');
  var test = require('integration-tester');
  var tick = require('next-tick');
  var when = require('when');

  var spinnakr;
  var settings = {
    siteId: '668925604'
  };

  beforeEach(function(){
    analytics.use(Spinnakr);
    spinnakr = new Spinnakr.Integration(settings);
    spinnakr.initialize(); // noop
    // needed for spinnakr's script to set a global we can read
    window._spinnakr_development = true;
  });

  afterEach(function(){
    spinnakr.reset();
    delete window._spinnakr_development;
  });

  it('should store the right settings', function(){
    test(spinnakr)
      .name('Spinnakr')
      .assumesPageview()
      .readyOnLoad()
      .global('_spinnakr_site_id')
      .global('_spinnakr')
      .option('siteId', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      spinnakr.load = sinon.spy();
    });

    it('should set window._spinnakr_site_id', function(){
      assert(!window._spinnakr_site_id);
      spinnakr.initialize();
      assert(window._spinnakr_site_id === settings.siteId);
    });

    it('should call #load', function(){
      spinnakr.initialize();
      assert(spinnakr.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window._spinnakr', function(){
      assert(!spinnakr.loaded());
      window._spinnakr = {};
      assert(spinnakr.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(spinnakr, 'load');
      spinnakr.initialize();
      spinnakr.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!spinnakr.loaded());
      spinnakr.load(function (err) {
        if (err) return done(err);
        // it makes its own ajax request before it creates the global
        when(function(){
          return spinnakr.loaded();
        }, done);
      });
    });
  });
});