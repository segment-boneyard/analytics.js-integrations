
describe('GoSquared', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var GoSquared = require('integrations/lib/gosquared');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var each = require('each');

  var gosquared;
  var settings = {
    siteToken: 'x'
  };

  beforeEach(function(){
    analytics.use(GoSquared);
    gosquared = new GoSquared.Integration(settings);
    gosquared.initialize(); // noop
  });

  afterEach(function(){
    gosquared.reset();
    analytics.user().reset();
  });

  it('should have the right settings', function(){
    test(gosquared)
      .name('GoSquared')
      .assumesPageview()
      .readyOnLoad()
      .global('_gs')
      .option('siteToken', '')
      .option('anonymizeIP', false)
      .option('cookieDomain', null)
      .option('useCookies', true)
      .option('trackHash', false)
      .option('trackLocal', false)
      .option('trackParams', true);
  });

  describe('#initialize', function(){
    beforeEach(function(){
      gosquared.load = sinon.spy();
    });

    it('should initialize the _gs global', function(){
      assert(!window._gs);
      gosquared.initialize();
      assert(typeof window._gs === 'function');
    });

    it('should call #load', function(){
      gosquared.initialize();
      assert(gosquared.load.called);
    });

    it('should be configure the site token', function(){
      window._gs = sinon.spy();
      test(gosquared)
        .initialize()
        .called(window._gs)
        .with(settings.siteToken);
    })

    it('should configure all defaults', function(){
      window._gs = sinon.spy();
      var assert = test(gosquared).initialize();
      each(gosquared.options, function(name, value){
        if ('siteToken' == name) return;
        if (null == value) return;
        assert.called(window._gs).with('set', name, value);
      });
    })
  });

  describe('#loaded', function(){
    it('should test window._gs.v', function(){
      assert(!gosquared.loaded());
      window._gs = { v: 'version-here' };
      assert(gosquared.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(gosquared, 'load');
      gosquared.initialize();
      gosquared.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!gosquared.loaded());
      gosquared.load(function (err) {
        if (err) return done(err);
        assert(gosquared.loaded());
        done();
      });
    });
  });

  describe('#page', function(){
    beforeEach(function (done) {
      gosquared.initialize();
      gosquared.once('load', function(){
        window._gs = sinon.spy();
        done();
      });
    });

    it('should send a path and title', function(){
      test(gosquared).page(null, null, { path: '/path', title: 'title' });
      assert(window._gs.calledWith('track', '/path', 'title'));
    });

    it('should prefer a name', function(){
      test(gosquared).page(null, 'name', { path: '/path', title: 'title' });
      assert(window._gs.calledWith('track', '/path', 'name'));
    });

    it('should prefer a name and category', function(){
      test(gosquared).page('category', 'name', { path: '/path', title: 'title' });
      assert(window._gs.calledWith('track', '/path', 'category name'));
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      gosquared.initialize();
      window._gs = sinon.spy();
    });

    it('should set an id', function(){
      test(gosquared)
        .identify('id')
        .called(window._gs)
        .with('set', 'visitorID', 'id');
    });

    it('should set traits', function(){
      test(gosquared)
        .identify(null, { trait: true })
        .called(window._gs)
        .with('set', 'visitor', { trait: true });
    });

    it('should set an id and traits', function(){
      test(gosquared)
        .identify('id', { trait: true })
        .called(window._gs)
        .with('set', 'visitorID', 'id')
        .called(window._gs)
        .with('set', 'visitor', {
          userID: 'id',
          trait: true,
          id: 'id'
        });
    });

    it('should prefer an email for visitor name', function(){
      test(gosquared)
        .identify('id', {
          email: 'email@example.com',
          username: 'username'
        })
        .called(window._gs)
        .with('set', 'visitorName', 'email@example.com');
    });

    it('should also prefer a username for visitor name', function(){
      test(gosquared)
        .identify('id', { username: 'username' })
        .called(window._gs)
        .with('set', 'visitorName', 'username');
    });
  });

  describe('#track', function(){
    beforeEach(function (done) {
      gosquared.initialize();
      gosquared.once('load', function(){
        window._gs = sinon.spy();
        done();
      });
    });

    it('should send an event', function(){
      test(gosquared).track('event');
      assert(window._gs.calledWith('event', 'event', {}));
    });

    it('should send an event and properties', function(){
      test(gosquared).track('event', { property: true });
      assert(window._gs.calledWith('event', 'event', { property: true }));
    });
  });

  describe('ecommerce', function(){
    beforeEach(function(done){
      gosquared.initialize();
      gosquared.once('load', function(){
        window._gs = sinon.spy();
        done();
      });
    })

    it('should send a transaction', function(){
      test(gosquared)
        .track('completed order', {
          id: 'a9173991',
          total: 90,
          quantity: 10,
          products: [{
            category: 'my category',
            name: 'my-product',
            quantity: 10,
            price: 9
          }]
        });

      assert(window._gs.calledWith('transaction', 'a9173991', {
        revenue: 90,
        track: true
      }, [{
        name: 'my-product',
        category: 'my category',
        quantity: 10,
        price: 9
      }]));
    })
  })

});
