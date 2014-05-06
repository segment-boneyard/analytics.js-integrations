
describe('Amplitude', function(){

  var Amplitude = require('integrations/lib/amplitude');
  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var amplitude;
  var settings = {
    apiKey: '07808866adb2510adf19ee69e8fc2201'
  };

  beforeEach(function(){
    analytics.use(Amplitude);
    amplitude = new Amplitude.Integration(settings);
    amplitude.initialize(); // noop
  });

  afterEach(function(){
    amplitude.reset();
  });

  it('should have the right settings', function(){
    test(amplitude)
      .name('Amplitude')
      .assumesPageview()
      .readyOnInitialize()
      .global('amplitude')
      .option('apiKey', '')
      .option('trackAllPages', false)
      .option('trackNamedPages', true);
  });

  describe('#initialize', function(){
    beforeEach(function(){
      amplitude.load = sinon.spy();
    });

    it('should create window.amplitude', function(){
      assert(!window.amplitude);
      amplitude.initialize();
      assert(window.amplitude);
    });

    it('should call #load', function(){
      amplitude.initialize();
      assert(amplitude.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.amplitude.options', function(){
      window.amplitude = {};
      assert(!amplitude.loaded());
      window.amplitude.options = {};
      assert(amplitude.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(amplitude, 'load');
      amplitude.initialize();
      amplitude.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!amplitude.loaded());
      amplitude.load(function (err) {
        if (err) return done(err);
        assert(amplitude.loaded());
        done();
      });
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      amplitude.initialize();
      window.amplitude.logEvent = sinon.spy();
    });

    it('should not track unnamed pages by default', function(){
      test(amplitude).page();
      assert(!window.amplitude.logEvent.called);
    });

    it('should track unnamed pages if enabled', function(){
      amplitude.options.trackAllPages = true;
      test(amplitude)
      .page()
      .called(window.amplitude.logEvent)
      .with('Loaded a Page');
    });

    it('should track named pages by default', function(){
      test(amplitude)
      .page(null, 'Name')
      .called(window.amplitude.logEvent)
      .with('Viewed Name Page');
    });

    it('should track named pages with a category added', function(){
      test(amplitude)
      .page('Category', 'Name')
      .called(window.amplitude.logEvent)
      .with('Viewed Category Name Page');
    });

    it('should track categorized pages by default', function(){
      test(amplitude)
      .page('Category', 'Name')
      .called(window.amplitude.logEvent)
      .with('Viewed Category Name Page');
    });

    it('should not track name or categorized pages if disabled', function(){
      amplitude.options.trackNamedPages = false;
      amplitude.options.trackCategorizedPages = false;
      test(amplitude).page(null, 'Name');
      test(amplitude).page('Category', 'Name');
      assert(!window.amplitude.logEvent.called);
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      amplitude.initialize();
      window.amplitude.setUserId = sinon.spy();
      window.amplitude.setGlobalUserProperties = sinon.spy();
    });

    it('should send an id', function(){
      test(amplitude)
      .identify('id')
      .called(window.amplitude.setUserId)
      .with('id');
    });

    it('should send traits', function(){
      test(amplitude)
      .identify(null, { trait: true })
      .called(window.amplitude.setGlobalUserProperties)
      .with({ trait: true})
    });

    it('should send an id and traits', function(){
      test(amplitude)
      .identify('id', { trait: true })
      .called(window.amplitude.setUserId)
      .with('id')
      .called(window.amplitude.setGlobalUserProperties)
      .with({ trait: true, id: 'id' });
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      amplitude.initialize();
      window.amplitude.logEvent = sinon.spy();
    });

    it('should send an event', function(){
      test(amplitude)
      .track('event')
      .called(window.amplitude.logEvent)
      .with('event');
    });

    it('should send an event and properties', function(){
      test(amplitude)
      .track('event', { prop: true })
      .called(window.amplitude.logEvent)
      .with('event', { prop: true });
    });
  });
});
