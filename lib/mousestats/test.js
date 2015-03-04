
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('MouseStats', function(){
  var MouseStats = plugin;
  var mousestats;
  var analytics;
  var options = {
    accountNumber: '5113912429068364554'
  };

  beforeEach(function(){
    analytics = new Analytics;
    mousestats = new MouseStats(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(mousestats);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    mousestats.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(MouseStats, integration('MouseStats')
      .assumesPageview()
      .global('MouseStatsSharedControl')
      .global('MouseStats_Commands')
      .option('accountNumber', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(mousestats, 'load');
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(mousestats.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(mousestats, done);
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
        analytics.stub(window.MouseStats_Commands, 'push');
      });

      it('should identify the user', function(){
        analytics.identify('userId', { email: 'email@example.com' });
        analytics.called(window.MouseStats_Commands.push, ['tagSession', 'email', 'email@example.com']);
        analytics.called(window.MouseStats_Commands.push, ['tagSession', 'userid', 'userId']); /* not sure if it can be called twice*/
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.MouseStats_Commands, 'push');
      });

      it('should tag the session', function(){
        analytics.track('event');
        analytics.called(window.MouseStats_Commands.push, ['tagSession', 'event']);
      });
    });

  });
});
