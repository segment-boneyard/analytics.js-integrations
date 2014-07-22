
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Hublo', function(){
  var Hublo = plugin;
  var hublo;
  var analytics;
  var options = {
    apiKey: '5353a2e62b26c1277b000004'
  };

  beforeEach(function(){
    analytics = new Analytics;
    hublo = new Hublo(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(hublo);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    hublo.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Hublo, integration('Hublo')
      .assumesPageview()
      .global('_hublo_')
      .option('apiKey', null));
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(hublo, done);
    });
  });
});
