
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('HitTail', function(){
  var HitTail = plugin;
  var hittail;
  var analytics;
  var options = {
    siteId: 'x'
  };

  beforeEach(function(){
    analytics = new Analytics;
    hittail = new HitTail(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(hittail);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    hittail.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(HitTail, integration('HitTail')
      .assumesPageview()
      .global('htk')
      .option('siteId', ''));
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(hittail, done);
    });
  });
});