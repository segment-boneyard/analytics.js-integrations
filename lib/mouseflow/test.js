
describe('Mouseflow', function(){

  var Mouseflow = require('integrations/lib/mouseflow');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var equals = require('equals');
  var sinon = require('sinon');

  var mouseflow;
  var settings = {
    apiKey: '08e34483-70c7-42de-a67e-0a49711d43dc'
  };

  beforeEach(function(){
    analytics.use(Mouseflow);
    mouseflow = new Mouseflow.Integration(settings);
    mouseflow.initialize();
  })

  afterEach(function(){
    mouseflow.reset();
  })

  it('should have the correct settings', function(){
    test(mouseflow)
      .name('Mouseflow')
      .assumesPageview()
      .readyOnLoad()
      .global('mouseflow')
      .global('_mfq')
      .option('apiKey', '')
      .option('mouseflowHtmlDelay', 0);
  })

  describe('#initialize', function(){
    beforeEach(function(){
      mouseflow.load = sinon.spy();
    })

    it('should call #load', function(){
      assert(!mouseflow.load.called);
      mouseflow.initialize();
      assert(mouseflow.load.called);
    })
  })

  describe('#loaded', function(){
    it('should test _mfq.push', function(){
      window._mfq = [];
      assert(!mouseflow.loaded());
      window._mfq.push = function(){};
      assert(mouseflow.loaded());
    })
  })

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(mouseflow, 'load');
      mouseflow.initialize();
      mouseflow.load.restore();
    })

    it('should change the loaded state', function(done){
      test(mouseflow).loads(done);
    })

    it('should set window.mouseflowHtmlDelay', function(){
      mouseflow.load();
      assert(0 == window.mouseflowHtmlDelay);
    })
  })

  describe('#page', function(){
    beforeEach(function(){
      mouseflow.initialize();
      window.mouseflow = {
        newPageView: sinon.spy()
      };
    })

    it('should call mouseflow.newPageView', function(){
      test(mouseflow).page();
      assert(window.mouseflow.newPageView.called);
    })

    it('should not throw if its not a function', function(){
      window.mouseflow.newPageView = null;
      test(mouseflow).page();
    })

    it('should not throw if window.mouseflow is not an object', function(){
      window.mouseflow = null;
      test(mouseflow).page();
    })
  })

  describe('#identify', function(){
    beforeEach(function(){
      mouseflow.initialize();
      window._mfq = [];
      window._mfq.push = sinon.spy();
    })

    it('should send id', function(){
      test(mouseflow)
        .identify(123)
        .called(window._mfq.push)
        .with(['setVariable', 'id', 123]);
    })

    it('should send traits', function(){
      test(mouseflow)
        .identify(null, { a: 1 })
        .called(window._mfq.push)
        .with(['setVariable', 'a', 1]);
    })

    it('should send id and traits', function(){
      test(mouseflow)
        .identify(123, { a: 1 })
        .called(window._mfq.push)
        .with(['setVariable', 'id', 123])
        .called(window._mfq.push)
        .with(['setVariable', 'a', 1]);
    })
  })

  describe('#track', function(){
    beforeEach(function(){
      mouseflow.initialize();
      window._mfq = [];
      window._mfq.push = sinon.spy();
    })

    it('should send event', function(){
      test(mouseflow)
        .track('event-name')
        .called(window._mfq.push)
        .with(['setVariable', 'event', 'event-name']);
    })

    it('should send props', function(){
      test(mouseflow)
        .track('event-name', { a: 1 })
        .called(window._mfq.push)
        .with(['setVariable', 'event', 'event-name'])
        .called(window._mfq.push)
        .with(['setVariable', 'a', 1]);
    })
  })

})
