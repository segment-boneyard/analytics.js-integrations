
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('LeadLander', function(){
  var LeadLander = plugin;
  var leadlander;
  var analytics;
  var options = {
    accountId: 'x'
  };

  beforeEach(function(){
    analytics = new Analytics;
    leadlander = new LeadLander(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(leadlander);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    leadlander.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(LeadLander, integration('LeadLander')
      .assumesPageview()
      .global('tl813v')
      .global('trackalyzer')
      .option('accountId', null));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(leadlander, 'load');
    });

    describe('#initialize', function(){
      it('should set window.tl813v', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(window.tl813v === options.accountId);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(leadlander.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(leadlander, done);
    });
  });
});
