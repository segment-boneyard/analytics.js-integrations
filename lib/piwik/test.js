describe('Piwik', function(){

  var Piwik     = require('integrations/lib/piwik'),
      analytics = require('analytics'),
      assert    = require('assert'),
      equal     = require('equals'),
      sinon     = require('sinon'),
      each      = require('each'),
      test      = require('integration-tester'),
      piwik,
      settings  = {
        siteId: 42,
        url: 'https://demo.piwik.org'
      };

  beforeEach(function(){
    analytics.use(Piwik);
    piwik = new Piwik.Integration(settings);
    piwik.initialize(); // noop
  });

  afterEach(function(){
    piwik.reset();
  });

  it('should have the right settings', function(){
    test(piwik)
      .name('Piwik')
      .global('_paq')
      .option('siteId', '')
      .option('url', null)
      .assumesPageview()
      .readyOnInitialize();
  });

  describe('#initialize', function(){
    beforeEach(function(){
      piwik.load = sinon.spy();
    });

    it('should call #load', function(){
      piwik.initialize();
      assert(piwik.load.called);
    });

    it('should push the id onto window._paq', function(){
      piwik.initialize();
      assert(equal(window._paq[0], ['setSiteId', settings.siteId]));
    });

    it('should push the url onto window._paq', function(){
      piwik.initialize();
      assert(equal(window._paq[1], ['setTrackerUrl', settings.url + "/piwik.php"]));
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(piwik, 'load');
      piwik.initialize();
      piwik.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!piwik.loaded());
      piwik.load(function (err) {
        if (err) return done(err);
        assert(piwik.loaded());
        done();
      });
    });
  });

  describe('#page', function() {
    beforeEach(function(){
      piwik.initialize();
    });

    it('should send a page view', function(){
      test(piwik).page();
    });
  });
});
