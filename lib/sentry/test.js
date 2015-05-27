
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Sentry = require('./');

describe('Sentry', function(){
  var sentry;
  var analytics;
  var options = {
    config: 'https://daf6980a0ff243aa9406db1edd7bdedb@app.getsentry.com/25415'
  };

  beforeEach(function(){
    analytics = new Analytics();
    sentry = new Sentry(options);
    analytics.use(Sentry);
    analytics.use(tester);
    analytics.add(sentry);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    sentry.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Sentry, integration('Sentry')
      .global('Raven')
      .option('config', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(sentry, 'load');
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(sentry.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(sentry, done);
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
        analytics.stub(window.Raven, 'setUser');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.Raven.setUser, { id: 'id' });
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        analytics.called(window.Raven.setUser, { trait: true });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.Raven.setUser, { id: 'id', trait: true });
      });
    });
  });
});
