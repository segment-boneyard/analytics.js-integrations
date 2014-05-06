
describe('Navilytics', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var Navilytics = require('integrations/lib/navilytics');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var timeouts = require('clear-timeouts');

  var navilytics;
  var settings = {
    memberId: '1042',
    projectId: '73'
  };

  beforeEach(function(){
    analytics.use(Navilytics);
    navilytics = new Navilytics.Integration(settings);
    navilytics.initialize(); // noop
  });

  afterEach(function(){
    timeouts();
    navilytics.reset();
  });

  it('should have the right settings', function(){
    test(navilytics)
      .name('Navilytics')
      .assumesPageview()
      .readyOnLoad()
      .global('__nls')
      .option('memberId', '')
      .option('projectId', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      navilytics.load = sinon.spy();
    });

    it('should call #load', function(){
      navilytics.initialize();
      assert(navilytics.load.called);
    });

    it('should create window.__nls', function(){
      assert(null == window.__nls);
      navilytics.initialize();
      assert.deepEqual([], window.__nls);
    })
  });

  describe('#loaded', function(){
    it('should test __nls.push', function(){
      window.__nls = [];
      assert(!navilytics.loaded());
      window.__nls.push = function(){};
      assert(navilytics.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(navilytics, 'load');
      navilytics.initialize();
      navilytics.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!navilytics.loaded());
      navilytics.load(function (err) {
        if (err) return done(err);
        assert(navilytics.loaded());
        done();
      });
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      window.__nls = [];
      sinon.stub(window.__nls, 'push');
    });

    it('should tag the recording', function(){
      test(navilytics).track('event');
      assert(window.__nls.push.calledWith(['tagRecording', 'event']));
    });
  });

});
