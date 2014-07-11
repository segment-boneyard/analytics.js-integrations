
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');

describe('BugHerd', function(){
  var BugHerd = plugin.Integration;
  var bugherd;
  var analytics;
  var options = {
    apiKey: 'vp3z4lyri7mdjf7wjrufpa'
  };

  beforeEach(function(){
    analytics = new Analytics;
    bugherd = new BugHerd(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(bugherd);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    bugherd.reset();
  });

  it('should have the right settings', function(){
    analytics.compare(BugHerd, integration('BugHerd')
      .assumesPageview()
      .readyOnLoad()
      .global('BugHerdConfig')
      .global('_bugHerd')
      .option('apiKey', '')
      .option('showFeedbackTab', true));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(bugherd, 'load');
    });

    afterEach(function(){
      bugherd.reset();
    });

    describe('#initialize', function(){
      it('should create window.BugHerdConfig', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window.BugHerdConfig, {
          feedback: { hide: false }
        });
      });

      it('should be able to hide the tab', function(){
        bugherd.options.showFeedbackTab = false;
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window.BugHerdConfig, {
          feedback: { hide: true }
        });
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(bugherd.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(bugherd, function(){
        // bugherd adds an iframe #_BH_frame
        // that calls parent.window.bugHerd.loaded
        // when it's already cleanedup
        var el = document.getElementById('_BH_frame');
        if (el) el.parentNode.removeChild(el);
        done();
      });
    });
  });
});
