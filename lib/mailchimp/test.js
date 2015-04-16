
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Mailchimp', function(){
  var Mailchimp = plugin;
  var mailchimp;
  var analytics;
  var options = {
    uuid: 'FOO',
    dc: 'BAR'
  };

  beforeEach(function(){
    analytics = new Analytics;
    mailchimp = new Mailchimp(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(mailchimp);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    mailchimp.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Mailchimp, integration('Mailchimp')
      .assumesPageview()
      .global('$mcGoal')
      .option('uuid', null)
      .option('dc', null));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(mailchimp, 'load');
    });

    describe('#initialize', function(){
      it('should create window.$mcGoal', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window.$mcGoal, {
          settings: {
            uuid: options.uuid,
            dc: options.dc
          }
        });
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(mailchimp.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(mailchimp, done);
    });
  });
});
