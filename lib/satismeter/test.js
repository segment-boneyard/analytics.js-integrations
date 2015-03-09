var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('SatisMeter', function(){
  var SatisMeter = plugin;
  var satismeter;
  var analytics;
  var options = {
    token: 'xy1gopRgdl'
  };

  beforeEach(function(){
    analytics = new Analytics;
    satismeter = new SatisMeter(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(satismeter);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    satismeter.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(SatisMeter, integration('SatisMeter')
      .global('satismeter')
      .option('token', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(satismeter, 'load');
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.called(satismeter.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(satismeter, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window, 'satismeter');
      });

      it('should send token and user id', function(){
        analytics.identify('id');
        analytics.called(window.satismeter, {
          token: options.token,
          user: {
            id: 'id'
          }
        });
      });

      it('should send email', function(){
        analytics.identify('id', { email: 'email@example.com' });
        analytics.called(window.satismeter, {
          token: options.token,
          user: {
            id: 'id',
            email: 'email@example.com'
          }
        });
      });

      it('should send user name', function(){
        analytics.identify('id', { name: 'john doe' });
        analytics.called(window.satismeter, {
          token: options.token,
          user: {
            id: 'id',
            name: 'john doe'
          }
        });
      });

      it('should send signUpDate', function(){
        var now = new Date;
        analytics.identify('id', { created: now });
        analytics.called(window.satismeter, {
          token: options.token,
          user: {
            id: 'id',
            signUpDate: now.toISOString()
          }
        });
      });

      it('should send custom traits', function(){
        var now = new Date;
        analytics.identify('id', {
          translation: {
            FOLLOWUP: 'What can we improve'
          },
          language: 'en'
        });
        analytics.called(window.satismeter, {
          token: options.token,
          user: {
            id: 'id'
          },
          translation: {
            FOLLOWUP: 'What can we improve'
          },
          language: 'en'
        });
      });
    });
  });
});
