
describe('SailThru Horizon', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var tick = require('next-tick');
  var Sailthru = require('integrations/lib/sailthru');

  var sailthru;
  var settings = {
    domain: 'horizon.example.com'
  };

  beforeEach(function () {
    analytics.use(Sailthru);
    sailthru = new Sailthru.Integration(settings);
    sailthru.initialize(); // noop
  });

  afterEach(function () {
    sailthru.reset();
  });

  it('should have the right settings', function () {
    test(sailthru)
      .name('Sailthru Horizon')
      .assumesPageview()
      .readyOnInitialize()
      .global('Sailthru')
      .option('domain', null)
      .option('concierge', null)
      .option('cookieDomain', null)
      .option('useStoredTags', null)
      .option('tags', null);
    });

  describe('#initialize', function () {
    beforeEach(function () {
      sailthru.load = sinon.spy();
    });

    it('should add metatags', function () {
      sailthru.initialize();
      var properties = sailthru.page.properties();
      if (properties) {
        var metas = document.getElementsByTagName('meta');
        for (var name in properties) {
          var found = false;
          for (i=0; i<metas.length; i++) {
            if (metas[i].getAttribute("name") == 'sailthru.'+name && metas[i].getAttribute('content') == properties[name]) {
              found = true;
              break;
            }
          }
          assert(found);
        }
      }
    });

    it('should call #load', function () {
      sailthru.initialize();
      assert(sailthru.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window.Sailthru', function () {
      window.Sailthru = {};
      assert(!sailthru.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(sailthru, 'load');
      sailthru.initialize();
      sailthru.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!sailthru.loaded());
      sailthru.load(function (err) {
        if (err) return done(err);
        assert(sailthru.loaded());
        return done();
      });
    });
  });
  
  describe('#page', function () {
    beforeEah(function () {
      sinon.stub(sailthru, 'page');
      sailthru.initialize();
      sailthru.load.restore();
    });
  
    it('should add metatags', function () {
      sailthru.initialize();
      var properties = sailthru.page.properties();
      if (properties) {
        var metas = document.getElementsByTagName('meta');
        for (var name in properties) {
          var found = false;
          for (i=0; i<metas.length; i++) {
            if (metas[i].getAttribute("name") == 'sailthru.'+name && metas[i].getAttribute('content') == properties[name]) {
              found = true;
              break;
            }
          }
          assert(found);
        }
      }
    });
  });
});