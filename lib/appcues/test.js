
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe.skip('Appcues', function(){
  var Appcues = plugin.Integration;
  var appcues;
  var analytics;
  var options = {
    appcuesId: 'test',
    userId: 'test',
    userEmail: 'test@testification.com'
  };

  // Disable AMD for these browser tests.
  var _define = window.define;

  beforeEach(function(){
    analytics = new Analytics;
    appcues = new Appcues(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(appcues);
    window.define = undefined;
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    sandbox();
    window.define = _define;
  });

  after(function(){
    appcues.reset();
  });

  it('should have the right settings', function(){
    analytics.compare(Appcues, integration('Appcues')
      .assumesPageview()
      .global('Appcues')
      .global('AppcuesIdentity')
      .option('appcuesId', '')
      .option('userId', '')
      .option('userEmail', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(appcues, 'load');
    });

    afterEach(function(){
      appcues.reset();
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(appcues.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(appcues, done);
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
        analytics.stub(window.Appcues, 'identify');
      });

      it('should send and id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.Appcues.identify, { id: 'id', trait: true });
      });
    });
  });
});
