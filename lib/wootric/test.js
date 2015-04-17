
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var plugin = require('./');
var tester = require('analytics.js-integration-tester');
var sandbox = require('clear-env');

describe('Wootric', function(){
  var Wootric = plugin;
  var wootric;
  var analytics;
  var options =
    // TODO: fill in this dictionary with the fake options required to test
    // that the integration can load properly. We'll need to get test
    // credentials for every integration, so that we can make sure it is
    // working properly.
    //
    // Here's what test credentials might look like:
    //
       {
         account_token: 'V7TLXL5WWBA5NOU5MOJQW4'
       };

  beforeEach(function(){
    analytics = new Analytics;
    wootric = new Wootric(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(wootric);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    wootric.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    // TODO: add any additional options or globals from the source file itself
    // to this list, and they will automatically get tested against, like:
    // integration('Wootric')
    //   .global('__myIntegration')
    //   .option('apiKey', '')
    analytics.compare(Wootric, integration('Wootric')
      .assumesPageview()
        .option('account_token', '')
        .global('wootricSettings')
        .global('wootric_survey_immediately')
        .global('wootric')
     //   .tag('library', '<script src="http://wootric-staging.dev/assets/services/segmentioSnippet.js">')
    )
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(wootric, 'load');
      analytics.initialize();
      analytics.page();
    });

    afterEach(function(){
      wootric.reset();
    });

    describe('#initialize', function(){
      it ('should setup the wootricSettings object', function(){
        analytics.assert(window.wootricSettings);
        analytics.assert(window.wootricSettings instanceof Object)
      })
    });

    describe('should call #load', function(){
      // TODO: test that .initialize() calls `.load()`
      // you can remove this if it doesn't call `.load()`.
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(wootric, done);
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
        // TODO: stub the integration global api.
        // For example:
        //analytics.stub(window._wootric, 'identify');
        analytics.spy(window._wootric, "identify");
      });

      it('should send an id', function(){
        analytics.identify('id');
        // TODO: assert that the id is sent.
        // analytics.called(window.api.identify, 'id');
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        //analytics.assert(window.wootricSettings.email, 'shawn@shawnmorgan.com');
        // TODO: assert that the traits are sent.
        analytics.called(window._wootric.identify);
      });

      it('should set email on traits', function(){
        analytics.identify({ trait: {
          email: 'shawn@shawnmorgan.com'
        }
        });
        analytics.assert(window.wootricSettings.email, 'shawn@shawnmorgan.com');
        // TODO: assert that the traits are sent.
        // analytics.called(window.api.identify, { trait: true });
      });

      it('should set created_at on traits using ISO format', function(){
        analytics.identify({ trait: {
          createdAt: '01/01/2015'
        }
        });
        analytics.assert(window.wootricSettings.created_at, '1420099200000');
        // TODO: assert that the traits are sent.
        // analytics.called(window.api.identify, { trait: true });
      });

      it('should set created_at on traits using Unix Timestamp format', function(){
        analytics.identify({ trait: {
          createdAt: '1420099200000'
        }
        });
        //console.log("wootricSettings", window.wootricSettings);
        analytics.assert(window.wootricSettings.created_at, 1420099200000);
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        // TODO: assert that the id and traits are sent.
        // analytics.called(window.api.identify, 'id');
        // analytics.called(window.api.identify, { id: 'id', trait: true });
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        //analytics.once('ready', done);
        analytics.initialize();
      });

      it('should track the current page', function(){
        analytics.page({});
        analytics.assert(window._wootric.lastPageTracked);
        // TODO: assert that the id is sent.
        // analytics.called(window.api.group, 'id');
      });
    });
  });
});
