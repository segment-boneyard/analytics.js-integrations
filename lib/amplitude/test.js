
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Amplitude', function(){
  var Amplitude = plugin;
  var amplitude;
  var analytics;
  var options = {
    apiKey: '07808866adb2510adf19ee69e8fc2201'
  };

  beforeEach(function(){
    analytics = new Analytics;
    amplitude = new Amplitude(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(amplitude);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    amplitude.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Amplitude, integration('Amplitude')
      .assumesPageview()
      .global('amplitude')
      .option('apiKey', '')
      .option('trackAllPages', false)
      .option('trackNamedPages', true));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(amplitude, 'load');
    });

    afterEach(function(){
      amplitude.reset();
    });

    describe('#initialize', function(){
      it('should create window.amplitude', function(){
        analytics.assert(!window.amplitude);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.amplitude);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(amplitude.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(amplitude, done);
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
        analytics.stub(window.amplitude, 'logEvent');
      });

      it('should not track unnamed pages by default', function(){
        analytics.page();
        analytics.didNotCall(window.amplitude.logEvent);
      });

      it('should track unnamed pages if enabled', function(){
        amplitude.options.trackAllPages = true;
        analytics.page();
        analytics.called(window.amplitude.logEvent, 'Loaded a Page');
      });

      it('should track named pages by default', function(){
        analytics.page('Name');
        analytics.called(window.amplitude.logEvent, 'Viewed Name Page');
      });

      it('should track named pages with a category added', function(){
        analytics.page('Category', 'Name');
        analytics.called(window.amplitude.logEvent, 'Viewed Category Name Page');
      });

      it('should track categorized pages by default', function(){
        analytics.page('Category', 'Name');
        analytics.called(window.amplitude.logEvent, 'Viewed Category Page');
      });

      it('should not track name or categorized pages if disabled', function(){
        amplitude.options.trackNamedPages = false;
        amplitude.options.trackCategorizedPages = false;
        analytics.page('Category', 'Name');
        analytics.didNotCall(window.amplitude.logEvent);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.amplitude, 'setUserId');
        analytics.stub(window.amplitude, 'setGlobalUserProperties');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.amplitude.setUserId, 'id');
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        analytics.called(window.amplitude.setGlobalUserProperties, { trait: true });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.amplitude.setUserId, 'id');
        analytics.called(window.amplitude.setGlobalUserProperties, { id: 'id', trait: true });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.amplitude, 'logEvent');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.amplitude.logEvent, 'event');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window.amplitude.logEvent, 'event', { property: true });
      });
    });
  });
});