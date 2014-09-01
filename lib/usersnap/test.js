
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Usersnap', function(){
  var Usersnap = plugin;
  var usersnap;
  var analytics;
  var options = {
    apiKey: '181c6e2e-9665-4ee7-88c8-4923a01824fc'
  };

  beforeEach(function(){
    analytics = new Analytics;
    usersnap = new Usersnap(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(usersnap);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    usersnap.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Usersnap, integration('Usersnap')
      .assumesPageview()
      .global('Usersnap')
      .global('_usersnapconfig')
      .option('apiKey', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(usersnap, 'load');
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(usersnap, done);
    });
  });
});
