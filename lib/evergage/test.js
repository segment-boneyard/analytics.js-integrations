
describe('Evergage', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Evergage = require('integrations/lib/evergage');
  var equal = require('equals');
  var jquery = require('jquery');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var evergage;
  var settings = {
    account: 'segmentiotest',
    dataset: 'segio_b2b_anon'
  };

  beforeEach(function(){
    analytics.use(Evergage);
    evergage = new Evergage.Integration(settings);
    evergage.initialize(); // noop
  });

  afterEach(function(){
    evergage.reset();
  });

  it('should have the right settings', function(){
    test(evergage)
      .name('Evergage')
      .assumesPageview()
      .readyOnInitialize()
      .global('_aaq')
      .option('account', '')
      .option('dataset', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      evergage.load = sinon.spy();
    });

    it('should create window._aaq', function(){
      assert(!window._aaq);
      evergage.initialize();
      assert(window._aaq);
    });

    it('should push the account', function(){
      evergage.initialize();
      assert(equal(window._aaq[0], ['setEvergageAccount', settings.account]));
    });

    it('should push the dataset', function(){
      evergage.initialize();
      assert(equal(window._aaq[1], ['setDataset', settings.dataset]));
    });

    it('should push use site config', function(){
      evergage.initialize();
      assert(equal(window._aaq[2], ['setUseSiteConfig', true]));
    });

    it('should call #load', function(){
      evergage.initialize();
      assert(evergage.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window._aaq.push', function(){
      window._aaq = [];
      assert(!evergage.loaded());
      window._aaq.push = function(){};
      assert(evergage.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(evergage, 'load');
      evergage.initialize();
      evergage.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!evergage.loaded());
      evergage.load(function (err) {
        if (err) return done(err);
        assert(evergage.loaded());
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      evergage.initialize();
      window._aaq.push = sinon.spy();
    });

    it('should send an id', function(){
      test(evergage)
      .identify('id')
      .called(window._aaq.push)
      .with(['setUser', 'id']);
    });

    it('should not send just traits', function(){
      test(evergage).identify(null, { trait: true });
      assert(!window._aaq.push.called);
    });

    it('should send an id and traits', function(){
      test(evergage)
      .identify('id', { trait: true })
      .called(window._aaq.push)
      .with(['setUserField', 'trait', true, 'page'])
      .called(window._aaq.push)
      .with(['setUser', 'id']);
    });

    it('should send an email', function(){
      test(evergage)
      .identify('id', { email: 'name@example.com' })
      .called(window._aaq.push)
      .with(['setUserField', 'userEmail', 'name@example.com', 'page'])
      .called(window._aaq.push)
      .with(['setUser', 'id']);
    });

    it('should send a name', function(){
      test(evergage)
      .identify('id', { name: 'name' })
      .called(window._aaq.push)
      .with(['setUserField', 'userName', 'name', 'page'])
      .called(window._aaq.push)
      .with(['setUser', 'id']);
    });
  });

  describe('#group', function(){
    beforeEach(function(){
      evergage.initialize();
      window._aaq.push = sinon.spy();
    });

    it('should send an id', function(){
      test(evergage)
      .group('id')
      .called(window._aaq.push)
      .with(['setCompany', 'id']);
    });

    it('should not send just properties', function(){
      test(evergage).group(null, { property: true });
      assert(!window._aaq.push.called);
    });

    it('should send an id and properties', function(){
      test(evergage)
      .group('id', { property: true })
      .called(window._aaq.push)
      .with(['setAccountField', 'property', true, 'page'])
      .called(window._aaq.push)
      .with(['setCompany', 'id'])
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      evergage.initialize();
      window._aaq.push = sinon.spy();
    });

    it('should send an event', function(){
      test(evergage)
      .track('event')
      .called(window._aaq.push)
      .with(['trackAction', 'event', {}]);
    });

    it('should send an event and properties', function(){
      test(evergage)
      .track('event', { property: true })
      .called(window._aaq.push)
      .with(['trackAction', 'event', { property: true }]);
    });
  });

  describe('#page', function(){
    beforeEach(function (done) {
      evergage.once('load', function(){
        window.Evergage.init = sinon.spy();
        window._aaq.push = sinon.spy();
        done();
      });
      evergage.initialize();
    });

    it('should send a page view', function(){
      test(evergage).page();
      assert(!window._aaq.push.called);
      assert(window.Evergage.init.calledWith(true));
    });

    it('should send page properties', function(){
      test(evergage)
      .page('category', 'name', { property: true })
      .called(window._aaq.push)
      .with(['namePage', 'name'])
      .called(window._aaq.push)
      .with(['setCustomField', 'property', true, 'page']);
    });
  });

});
