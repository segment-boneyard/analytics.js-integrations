
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Crazy Egg', function(){
  var CrazyEgg = plugin;
  var crazyegg;
  var analytics;
  var options = {
    accountNumber: '00138301'
  };

  beforeEach(function(){
    analytics = new Analytics;
    crazyegg = new CrazyEgg(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(crazyegg);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    crazyegg.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(CrazyEgg, integration('Crazy Egg')
      .assumesPageview()
      .global('CE2')
      .option('accountNumber', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(crazyegg, 'load');
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(crazyegg.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(crazyegg, done);
    });
  });
});