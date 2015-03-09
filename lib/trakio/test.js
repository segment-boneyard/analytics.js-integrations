
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');
var tick = require('next-tick');
var when = require('when');

describe('trak.io', function(){
  var Trakio = plugin;
  var trakio;
  var analytics;
  var options = {
    token: '740d36a79fb593bbc034a3ac934bc04f5a591c0c'
  };

  beforeEach(function(){
    analytics = new Analytics;
    trakio = new Trakio(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(trakio);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    trakio.reset();
    sandbox();
  });

  it('should store the right settings', function(){
    analytics.compare(Trakio, integration('trak.io')
      .assumesPageview()
      .global('trak')
      .option('token', '')
      .option('trackNamedPages', true));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(trakio, 'load');
    });

    describe('#initialize', function(){
      it('should set up the window.trak.io variables', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(window.trak.io);
        analytics.assert(window.trak.io.identify);
        analytics.assert(window.trak.io.track);
        analytics.assert(window.trak.io.alias);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(trakio.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(trakio, done);
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
        analytics.stub(window.trak.io, 'page_view');
        analytics.stub(window.trak.io, 'track');
      });

      it('should call page_view', function(){
        analytics.page();
        analytics.called(window.trak.io.page_view);
      });

      it('should send a path and title', function(){
        analytics.page({ path: '/path', title: 'title' });
        analytics.called(window.trak.io.page_view, '/path', 'title');
      });

      it('should prefer a name', function(){
        analytics.page('name', { title: 'title' });
        analytics.called(window.trak.io.page_view, window.location.pathname, 'name');
      });

      it('should prefer a category and name', function(){
        analytics.page('category', 'name', { title: 'title' });
        analytics.called(window.trak.io.page_view, window.location.pathname, 'category name');
      });

      it('should track named pages by default', function(){
        analytics.page('Name');
        analytics.called(window.trak.io.track, 'Viewed Name Page');
      });

      it('should track named pages with categories', function(){
        analytics.page('Category', 'Name');
        analytics.called(window.trak.io.track, 'Viewed Category Name Page');
      });

      it('should track categorized pages by default', function(){
        analytics.page('Category', 'Name');
        analytics.called(window.trak.io.track, 'Viewed Category Page');
      });

      it('should not track named or categorized pages if the option is off', function(){
        trakio.options.trackNamedPages = false;
        trakio.options.trackCategorizedPages = false;
        analytics.page('Name');
        analytics.page('Category', 'Name');
        analytics.didNotCall(window.trak.io.track);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.trak.io, 'identify');
      });

      it('should send id', function(){
        analytics.identify('id');
        analytics.called(window.trak.io.identify, 'id', { id: 'id' });
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        analytics.called(window.trak.io.identify, { trait: true });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.trak.io.identify, 'id', { trait: true, id: 'id' });
      });

      it('should alias traits', function(){
        analytics.identify({
          avatar: 'avatar',
          firstName: 'first',
          lastName: 'last'
        });
        analytics.called(window.trak.io.identify, {
          avatar_url: 'avatar',
          first_name: 'first',
          last_name: 'last'
        });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.trak.io, 'track');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.trak.io.track, 'event');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window.trak.io.track, 'event', { property: true });
      });
    });

    describe('#alias', function(){
      beforeEach(function(){
        analytics.stub(window.trak.io, 'distinct_id');
        analytics.stub(window.trak.io, 'alias');
      });

      it('should send a new id', function(){
        analytics.alias('new');
        analytics.called(window.trak.io.alias, 'new');
      });

      it('should send a new id and an original id', function(){
        analytics.alias('another', 'original');
        analytics.called(window.trak.io.alias, 'original', 'another');
      });
    });
  });
});