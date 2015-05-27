
var Analytics = require('analytics.js').constructor;
var tester = require('../../test/plugin');
var plugin = require('./');

describe('Integration', function(){
  var Integration = plugin.Integration;
  var integration;
  var analytics;
  var options = {};
  var settings = { AdRoll: options };

  describe('before loading', function(){
    beforeEach(function(){
      analytics = new Analytics();
      analytics.use(plugin);
      analytics.use(tester);
      analytics.spy(Integration.prototype, 'load');
      integration = analytics.integration('AdRoll');
    });

    afterEach(function(){
      analytics.restore();
      analytics.reset();
      integration.reset();
    });
  });

  describe('after loading', function(){
    before(function(done){
      analytics = new Analytics();
      analytics.use(plugin);
      analytics.use(tester);
      analytics.once('ready', done);
      analytics.initialize(settings);
      analytics.page();
      integration = analytics.integration('AdRoll');
    });

    afterEach(function(){
      analytics.restore();
      analytics.reset();
    });

    after(function(){
      integration.reset();
    });
  });
});
