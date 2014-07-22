
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('comScore', function(){
  var Comscore = plugin;
  var comscore;
  var analytics;
  var options = {
    c2: 'x'
  };

  beforeEach(function(){
    analytics = new Analytics;
    comscore = new Comscore(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(comscore);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    comscore.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Comscore, integration('comScore')
      .assumesPageview()
      .global('_comscore')
      .option('c1', '2')
      .option('c2', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(comscore, 'load');
    });

    describe('#initialize', function(){
      it('should create window._comscore', function(){
        analytics.assert(!window._comscore);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._comscore instanceof Array);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(comscore, done);
    });
  });
});
