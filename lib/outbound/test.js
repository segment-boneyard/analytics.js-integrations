
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Outbound', function(){
  var Outbound = plugin;
  var outbound;
  var analytics;
  var options = {
    publicApiKey: 'pub-V7TLXL5WWBA5NOU5MOJQW4'
  };

  beforeEach(function(){
    analytics = new Analytics;
    outbound = new Outbound(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(outbound);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    outbound.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    // TODO: add any additional options or globals from the source file itself
    // to this list, and they will automatically get tested against, like:
    integration('Outbound')
      .option('publicApiKey', null)
    analytics.compare(Outbound, integration('Outbound'))
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(outbound, 'load');
    });

    afterEach(function(){
      outbound.reset();
    });

    describe('#initialize', function(){
      // TODO: test .initialize();
    });

    describe('should call #load', function(){
      // TODO: test that .initialize() calls `.load()`
      // you can remove this if it doesn't call `.load()`.
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(outbound, done);
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
        // TODO: stub the global API if needed
        // example: analytics.stub(window.api, 'logEvent');
        analytics.stub()
      });

      it('should not track unnamed pages by default', function(){
        // TODO: test that the integration does not track
        // unnamed pages by default, so `.trackAllPages` option
        // is false by default.
      });

      it('should track named pages if enabled', function(){
        outbound.options.trackAllPages = true;
        analytics.page();
        // TODO: assert that the api was called properly
        // analytics.called(window.api.logEvent, 'Loaded a Page');
      });

      it('should track named pages by default', function(){
        analytics.page('Name');
        // TODO: assert that the api was called properly
        // analytics.called(window.api.logEvent, 'Viewed Name Page');
      });

      it('should track named pages with a category added', function(){
        analytics.page('Category', 'Name');
        // TODO: assert that the api was called properly
        // analytics.called(window.api.logEvent, 'Viewed Category Name Page');
      });

      it('should track categorized pages by default', function(){
        analytics.page('Category', 'Name');
        // TODO: assert that the api was called properly
        // analytics.called(window.api.logEvent, 'Viewed Category Page');
      });

      it('should not track name or categorized pages if disabled', function(){
        outbound.options.trackNamedPages = false;
        outbound.options.trackCategorizedPages = false;
        analytics.page('Category', 'Name');
        // TODO: assert that the api was not called
        // analytics.didNotCall(window.api.logEvent);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        // TODO: stub the integration global api.
        // For example:
        // analytics.stub(window.api, 'identify');
      });

      it('should send an id', function(){
        analytics.identify('id');
        // TODO: assert that the id is sent.
        // analytics.called(window.api.identify, 'id');
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        // TODO: assert that the traits are sent.
        // analytics.called(window.api.identify, { trait: true });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        // TODO: assert that the id and traits are sent.
        // analytics.called(window.api.identify, 'id');
        // analytics.called(window.api.identify, { id: 'id', trait: true });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        // TODO: stub the integration global api.
        // for example:
        // analytics.stub(window.api, 'logEvent');
      });

      it('should send an event', function(){
        analytics.track('event');
        // TODO: assert that the event is sent.
        // analytics.called(window.api.logEvent, 'event');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        // TODO: assert that the event is sent.
        // analytics.called(window.api.logEvent, 'event', { property: true });
      });
    });
  });
});
