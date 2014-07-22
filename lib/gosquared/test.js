
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');
var each = require('each');

describe('GoSquared', function(){
  var GoSquared = plugin;
  var gosquared;
  var analytics;
  var options = {
    siteToken: 'x'
  };

  beforeEach(function(){
    analytics = new Analytics;
    gosquared = new GoSquared(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(gosquared);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    gosquared.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(GoSquared, integration('GoSquared')
      .assumesPageview()
      .global('_gs')
      .option('siteToken', '')
      .option('anonymizeIP', false)
      .option('cookieDomain', null)
      .option('useCookies', true)
      .option('trackHash', false)
      .option('trackLocal', false)
      .option('trackParams', true));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(gosquared, 'load');
    });

    describe('#initialize', function(){
      it('should initialize the _gs global', function(){
        analytics.assert(!window._gs);
        analytics.initialize();
        analytics.page();
        analytics.assert(typeof window._gs === 'function');
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(gosquared.load);
      });

      it('should be configure the site token', function(){
        analytics.stub(window, '_gs');
        analytics.initialize();
        analytics.page();
        analytics.called(window._gs, options.siteToken);
      });

      it('should configure all defaults', function(){
        analytics.stub(window, '_gs');
        analytics.initialize();
        analytics.page();
        each(gosquared.options, function(name, value){
          if ('siteToken' == name) return;
          if (null == value) return;
          analytics.called(window._gs, 'set', name, value);
        });
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(gosquared, done);
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
        analytics.stub(window, '_gs');
      });

      it('should send a path and title', function(){
        analytics.page({ path: '/path', title: 'title' });
        analytics.called(window._gs, 'track', '/path', 'title');
      });

      it('should prefer a name', function(){
        analytics.page('name', { path: '/path', title: 'title' });
        analytics.called(window._gs, 'track', '/path', 'name');
      });

      it('should prefer a name and category', function(){
        analytics.page('category', 'name', { path: '/path', title: 'title' });
        analytics.called(window._gs, 'track', '/path', 'category name');
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window, '_gs');
      });

      it('should set an id', function(){
        analytics.identify('id');
        analytics.called(window._gs, 'set', 'visitorID', 'id');
      });

      it('should set traits', function(){
        analytics.identify({ trait: true });
        analytics.called(window._gs, 'set', 'visitor', { trait: true });
      });

      it('should set an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window._gs, 'set', 'visitorID', 'id')
        analytics.called(window._gs, 'set', 'visitor', {
          userID: 'id',
          trait: true,
          id: 'id'
        });
      });

      it('should prefer an email for visitor name', function(){
        analytics.identify('id', {
          email: 'email@example.com',
          username: 'username'
        });
        analytics.called(window._gs, 'set', 'visitorName', 'email@example.com');
      });

      it('should also prefer a username for visitor name', function(){
        analytics.identify('id', { username: 'username' });
        analytics.called(window._gs, 'set', 'visitorName', 'username');
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window, '_gs');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window._gs, 'event', 'event', {});
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window._gs, 'event', 'event', { property: true });
      });
    });

    describe('ecommerce', function(){
      beforeEach(function(){
        analytics.stub(window, '_gs');
      });

      it('should send a transaction', function(){
        analytics.track('completed order', {
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

        analytics.called(window._gs, 'transaction', 'a9173991', {
          revenue: 90,
          track: true
        }, [{
          name: 'my-product',
          category: 'my category',
          quantity: 10,
          price: 9
        }]);
      })
    });
  });
});