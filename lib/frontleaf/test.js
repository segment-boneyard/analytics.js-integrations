
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Frontleaf', function(){
  var Frontleaf = plugin;
  var frontleaf;
  var analytics;
  var options = {
    baseUrl: 'https://demo.frontleaf.com',
    token: 'alHTmBjMiewZnPLycFeBQxaidbBeouXG',
    stream: 'segment.io'
  };

  beforeEach(function(){
    analytics = new Analytics;
    frontleaf = new Frontleaf(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(frontleaf);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    frontleaf.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Frontleaf, integration('Frontleaf')
      .assumesPageview()
      .global('_fl')
      .global('_flBaseUrl')
      .option('token', '')
      .option('stream', '')
      .option('trackNamedPages', false)
      .option('trackCategorizedPages', false));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(frontleaf, 'load');
    });

    describe('#initialize', function(){
      it('should create window._fl', function(){
        analytics.assert(!window._fl);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._fl);
      });

      it('should create window._flBaseUrl', function(){
        analytics.assert(!window._flBaseUrl);
        analytics.initialize();
        analytics.page();
        analytics.equal(window._flBaseUrl, options.baseUrl);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(frontleaf, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(frontleaf, '_push');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(frontleaf._push, 'setUser', {
          id: 'id',
          name: undefined,
          data: {}
        });
      });

      it('should send traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(frontleaf._push, 'setUser', {
          id: 'id',
          name: undefined,
          data: { trait: true }
        });
      });

      it('should send a name', function(){
        analytics.identify('id', { name: 'name' });
        analytics.called(frontleaf._push, 'setUser', {
          id: 'id',
          name: 'name',
          data: {}
        });
      });

      it('should send a username', function(){
        analytics.identify('id', { username: 'username' });
        analytics.called(frontleaf._push, 'setUser', {
          id: 'id',
          name: 'username',
          data: { username: 'username' }
        });
      });
    });

    describe('#group', function(){
      beforeEach(function(){
        analytics.stub(frontleaf, '_push');
      });

      it('should not send without an id', function(){
        analytics.group();
        analytics.didNotCall(frontleaf._push);
      });

      it('should send an id', function(){
        analytics.group('id');
        analytics.called(frontleaf._push, 'setAccount', {
          id: 'id',
          name: undefined,
          data: {}
        });
      });

      it('should send traits', function(){
        analytics.group('id', { trait: true });
        analytics.called(frontleaf._push, 'setAccount', {
          id: 'id',
          name: undefined,
          data: { trait: true }
        });
      });

      it('should send a name', function(){
        analytics.group('id', { name: 'name' });
        analytics.called(frontleaf._push, 'setAccount', {
          id: 'id',
          name: 'name',
          data: {}
        });
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(frontleaf, '_push');
      });

      it('should not track anonymous pages by default', function(){
        analytics.page();
        analytics.didNotCall(frontleaf._push);
      });

      it('should track named pages when the option is on', function(){
        frontleaf.options.trackNamedPages = true;
        analytics.page('Name');
        analytics.didNotCall(frontleaf._push, 'event', 'Viewed Category Page');
        analytics.called(frontleaf._push, 'event', 'Viewed Name Page');
      });

      it('should track named pages with categories when the options are on', function(){
        frontleaf.options.trackNamedPages = true;
        frontleaf.options.trackCategorizedPages = true;
        analytics.page('Category', 'Name');
        analytics.didNotCall(frontleaf._push, 'event', 'Viewed Name Page');
        analytics.called(frontleaf._push, 'event', 'Viewed Category Page');
        analytics.called(frontleaf._push, 'event', 'Viewed Category Name Page');
      });

      it('should track categorized pages when the option is on', function(){
        frontleaf.options.trackCategorizedPages = true;
        analytics.page('Category', 'Name');
        analytics.didNotCall(frontleaf._push, 'event', 'Viewed Name Page');
        analytics.called(frontleaf._push, 'event', 'Viewed Category Page');
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(frontleaf, '_push');
      });

      it('should send an event', function(){
        analytics.track('login');
        analytics.called(frontleaf._push, 'event', 'login');
      });

      it('should send properties', function(){
        analytics.track('login', { property: true });
        analytics.called(frontleaf._push, 'event', 'login', { property: true });
      });
    });
  });
});
