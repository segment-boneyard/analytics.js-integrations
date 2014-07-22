
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Alexa', function(){
  var Alexa = plugin;
  var alexa;
  var analytics;
  var options = {
    account: 'h5Gaj1a4ZP000h',
    domain: 'mydomain.com',
    dynamic: true
  };

  beforeEach(function(){
    analytics = new Analytics;
    alexa = new Alexa(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(alexa);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    alexa.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Alexa, integration('Alexa')
      .assumesPageview()
      .global('_atrk_opts')
      .option('account', null)
      .option('domain', '')
      .option('dynamic', true));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(alexa, 'load');
    });

    describe('#initialize', function(){
      it('should create window._atrk_opts', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._atrk_opts, {
          atrk_acct: options.account,
          domain: options.domain,
          dynamic: options.dynamic
        });
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(alexa.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(alexa, done);
    });
  });
});