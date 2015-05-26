var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var Wootric = require('./');
var tester = require('analytics.js-integration-tester');
var sandbox = require('clear-env');
var is = require('is');

describe('Wootric', function(){
  var wootric;
  var analytics;
  var options = {
    accountToken: 'NPS-01fe3cbc'
  };

  beforeEach(function(){
    analytics = new Analytics();
    wootric = new Wootric(options);
    analytics.use(Wootric);
    analytics.use(tester);
    analytics.add(wootric);
    //setup Wootric to survey immediately
    window.wootric_survey_immediately = true;
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    wootric.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Wootric, integration('Wootric')
      .assumesPageview()
        .option('accountToken', '')
        .global('wootricSettings')
        .global('wootric_survey_immediately')
        .global('wootric')
    )
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(wootric, 'load');
    });

    it('should not have a wootric object', function(){
      analytics.assert(!window.wootric);
    });

    describe('#initialize', function(){
      beforeEach(function(){
        analytics.initialize();
        analytics.page();
      });

      it('should have settings with account token', function(){
        analytics.assert(window.wootricSettings.account_token === 'NPS-01fe3cbc');
      });

      it('should setup the wootricSettings object', function(){
        is.object(window.wootricSettings);
      });

      it('should have lastPageTracked set to null', function(){
        analytics.assert(wootric.lastPageTracked === null);
      });

      it('should call #load', function(){
        analytics.called(wootric.load);
      });
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

    it('should have created the global wootric object', function(){
      analytics.assert(typeof window.wootric === 'function');
    });

    describe('#identify', function(){
      it('should set email on identify', function(){
        analytics.identify({
          email: 'shawn@shawnmorgan.com'
        });
        analytics.assert(window.wootricSettings.email, 'shawn@shawnmorgan.com');
      });

      it('should set created_at on identify using ISO MM/DD/YYYY format', function(){
        analytics.identify({
          createdAt: '01/01/2015'
        });
        analytics.assert(window.wootricSettings.created_at, '1420099200000');
      });

      it('should set created_at on identify using ISO YYYY-MM-DD format', function(){
        analytics.identify({
          createdAt: '2015-01-01'
        });
        analytics.assert(window.wootricSettings.created_at, '1420099200000');
      });

      it('should set created_at on identify using ISO YYYYMMDD format', function(){
        analytics.identify({
          createdAt: '20150101'
        });
        analytics.assert(window.wootricSettings.created_at, '1420099200000');
      });

      it('should set created_at on traits using Unix Timestamp format', function(){
        analytics.identify({
          createdAt: '1420099200000'
        });
        analytics.assert(window.wootricSettings.created_at, '1420099200000');
      });

      it('should set language', function(){
        analytics.identify({
          language: 'es'
        });
        analytics.assert(window.wootricSettings.language, 'es');
      });

      it('should set properties based on other traits', function(){
        analytics.identify({
            email: 'shawn@shawnmorgan.com',
            createdAt: '01/01/2015',
            property1: 'foo',
            property2: 'bar'
        });
        analytics.assert(window.wootricSettings.properties.property1 === "foo");
        analytics.assert(window.wootricSettings.properties.property2 === "bar");
      });

      it('should omit email and createdAt when setting window.wootricSettings.properties', function(){
        analytics.identify({
            email: 'shawn@shawnmorgan.com',
            createdAt: '01/01/2015',
            property1: 'foo',
            property2: 'bar'
        });
        analytics.assert(!window.wootricSettings.properties.email);
        analytics.assert(!window.wootricSettings.properties.createdAt);
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.page({});
      });

      it('should track the current page', function(){
        analytics.assert(window.wootricSettings);
        analytics.assert(wootric.lastPageTracked);
      });

      it('should set lastPageTracked to window location', function(){
        analytics.assert(wootric.lastPageTracked === window.location);
      });
    });
  });
});
