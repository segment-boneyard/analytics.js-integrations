
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Bugsnag = require('./');

describe('Bugsnag', function(){
  var analytics;
  var bugsnag;
  var options = {
    apiKey: '7563fdfc1f418e956f5e5472148759f0'
  };
  var onError = window.onerror;

  beforeEach(function(){
    analytics = new Analytics();
    bugsnag = new Bugsnag(options);
    analytics.use(Bugsnag);
    analytics.use(tester);
    analytics.add(bugsnag);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    bugsnag.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Bugsnag, integration('Bugsnag')
      .global('Bugsnag')
      .option('apiKey', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(bugsnag, 'load');
    });
  });

  describe('loading', function(){
    it('should load and set an onerror handler', function(done){
      analytics.load(bugsnag, function(err){
        if (err) return done(err);
        analytics.assert(window.onerror !== onError);
        analytics.assert(typeof window.onerror === 'function');
        done();
      });
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function(){
      it('should set metadata', function(){
        analytics.identify('id', { trait: true });
        analytics.deepEqual(window.Bugsnag.metaData, {
          id: 'id',
          trait: true
        });
      });
    });
  });
});
