
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('SnapEngage', function(){
  var SnapEngage = plugin;
  var snapengage;
  var analytics;
  var options = {
    apiKey: '782b737e-487f-4117-8a2b-2beb32b600e5'
  };

  beforeEach(function(){
    analytics = new Analytics;
    snapengage = new SnapEngage(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(snapengage);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    snapengage.reset();
    sandbox();
  });

  it('should store the right settings', function(){
    analytics.compare(SnapEngage, integration('SnapEngage')
      .assumesPageview()
      .global('SnapABug')
      .option('apiKey', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(snapengage, 'load');
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(snapengage.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(snapengage, done);
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
        analytics.stub(window.SnapABug, 'setUserEmail');
      });

      it('should not send just an id', function(){
        analytics.identify('id');
        analytics.didNotCall(window.SnapABug.setUserEmail);
      });

      it('should send an email', function(){
        analytics.identify('id', { email: 'name@example.com' });
        analytics.called(window.SnapABug.setUserEmail, 'name@example.com');
      });
    });
  });
});