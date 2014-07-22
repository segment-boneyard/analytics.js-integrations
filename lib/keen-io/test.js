
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Keen IO', function(){
  var Keen = plugin;
  var keen;
  var analytics;
  var options = {
    projectId: '510c82172975160344000002',
    writeKey: '1ab6cabb3be05b956d1044c67e02ae6eb2952e6801cedd8303608327c45a1308ecf5ae294e4c45c566678e6f3eefea3e685b8a789e032050b6fb228c72e22b210115f2dbd50caed0454285f37ecec4cda52832e8792d766817e0d11e7f935b92aee73c0c62770f528b8b65d5b7de24a4'
  };

  beforeEach(function(){
    analytics = new Analytics;
    keen = new Keen(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(keen);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    keen.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Keen, integration('Keen IO')
      .global('Keen')
      .option('projectId', '')
      .option('readKey', '')
      .option('writeKey', '')
      .option('trackNamedPages', true)
      .option('trackAllPages', false));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(keen, 'load');
    });

    describe('#initialize', function(){
      it('should create window.Keen', function(){
        analytics.assert(!window.Keen);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.Keen);
      });

      it('should configure Keen', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window.Keen._cf, {
          projectId: options.projectId,
          writeKey: options.writeKey,
          readKey: ''
        });
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(keen.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(keen, done);
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
        analytics.stub(window.Keen, 'addEvent');
      });

      it('should not track anonymous pages by default', function(){
        analytics.page();
        analytics.didNotCall(window.Keen.addEvent);
      });

      it('should track anonymous pages when the option is on', function(){
        keen.options.trackAllPages = true;
        analytics.page();
        analytics.called(window.Keen.addEvent, 'Loaded a Page');
      });

      it('should track named pages by default', function(){
        analytics.page('Name');
        analytics.called(window.Keen.addEvent, 'Viewed Name Page');
      });

      it('should track named pages with categories', function(){
        analytics.page('Category', 'Name');
        analytics.called(window.Keen.addEvent, 'Viewed Category Name Page');
      });

      it('should track categorized pages by default', function(){
        analytics.page('Category', 'Name');
        analytics.called(window.Keen.addEvent, 'Viewed Category Page');
      });

      it('should not track a named or categorized page when the option is off', function(){
        keen.options.trackNamedPages = false;
        keen.options.trackCategorizedPages = false;
        analytics.page('Name');
        analytics.page('Category', 'Name');
        analytics.didNotCall(window.Keen.addEvent);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.Keen, 'addEvent');
      });

      it('should pass an id', function(){
        analytics.identify('id');
        var user = window.Keen.client.globalProperties().user;
        analytics.deepEqual(user, { userId: 'id', traits: { id: 'id' } });
      });

      it('should pass a traits', function(){
        analytics.identify({ trait: true });
        var user = window.Keen.client.globalProperties().user;
        analytics.deepEqual(user, { traits: { trait: true }});
      });

      it('should pass an id and traits', function(){
        analytics.identify('id', { trait: true });
        var user = window.Keen.client.globalProperties().user;
        analytics.deepEqual(user, { userId: 'id', traits: { trait: true, id: 'id' }});
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.Keen, 'addEvent');
      });

      it('should pass an event', function(){
        analytics.track('event');
        analytics.called(window.Keen.addEvent, 'event');
      });

      it('should pass an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window.Keen.addEvent, 'event', { property: true });
      });
    });
  });
});