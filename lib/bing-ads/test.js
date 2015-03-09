
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Bing Ads', function(){
  var Bing = plugin;
  var bing;
  var analytics;
  var options = {
    tagId: '4002754'
  };

  beforeEach(function(){
    analytics = new Analytics;
    bing = new Bing(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(bing);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    bing.reset();
    sandbox();
  });

  it('should have the correct settings', function(){
    analytics.compare(Bing, integration('Bing Ads')
      .option('tagId', ''));
    });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(bing, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window.uetq, 'push');
      });

      it('should track pageviews', function(){
        analytics.page();
        analytics.called(window.uetq.push, 'pageLoad');
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.uetq, 'push');
      });

      it('should send correctly', function(){
        analytics.track('play', { category: 'fun', revenue: 90 });
        analytics.called(window.uetq.push, {
          ea: 'track',
          el: 'play',
          ec: 'fun',
          ev: 90
        });
      });
    });
  });
});
