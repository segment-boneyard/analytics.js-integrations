
describe('Improvely', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var Improvely = require('integrations/lib/improvely');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var improvely;
  var settings = {
    domain: 'demo',
    projectId: 1
  };

  beforeEach(function(){
    analytics.use(Improvely);
    improvely = new Improvely.Integration(settings);
    improvely.initialize(); // noop
  });

  afterEach(function(){
    improvely.reset();
  });

  it('should have the right settings', function(){
    test(improvely)
      .name('Improvely')
      .assumesPageview()
      .readyOnInitialize()
      .global('_improvely')
      .global('improvely')
      .option('domain', '')
      .option('projectId', null);
  });

  describe('#initialize', function(){
    beforeEach(function(){
      improvely.load = sinon.spy();
    });

    it('should create window._improvely', function(){
      assert(!window._improvely);
      improvely.initialize();
      assert(window._improvely instanceof Array);
    });

    it('should create window.improvely', function(){
      assert(!window.improvely);
      improvely.initialize();
      assert(window.improvely);
    });

    it('should init with a domain and project id', function(){
      improvely.initialize();
      assert(equal(window._improvely[0], ['init', settings.domain, settings.projectId]));
    });

    it('should call #load', function(){
      improvely.initialize();
      assert(improvely.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.improvely.identify', function(){
      window.improvely = {};
      assert(!improvely.loaded());
      window.improvely.identify = function(){};
      assert(improvely.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(improvely, 'load');
      improvely.initialize();
      improvely.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!improvely.loaded());
      improvely.load(function (err) {
        if (err) return done(err);
        assert(improvely.loaded());
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function (done) {
      improvely.initialize();
      improvely.on('load', function(){
        window.improvely.label = sinon.spy();
        done();
      });
    });

    it('should send an id', function(){
      test(improvely).identify('id');
      assert(window.improvely.label.calledWith('id'));
    });

    it('should not send if id is empty', function(){
      test(improvely).identify();
      assert(!window.improvely.label.called);
    })
  });

  describe('#track', function(){
    beforeEach(function (done) {
      improvely.initialize();
      improvely.on('load', function(){
        window.improvely.goal = sinon.spy();
        done();
      });
    });

    it('should send an event', function(){
      test(improvely).track('event');
      assert(window.improvely.goal.calledWith({ type: 'event' }));
    });

    it('should send an event and properties', function(){
      test(improvely).track('event', { property: true });
      assert(window.improvely.goal.calledWith({
        type: 'event',
        property: true
      }));
    });

    it('should alias revenue to amount', function(){
      test(improvely).track('event', { revenue: 42.99 });
      assert(window.improvely.goal.calledWith({
        type: 'event',
        amount: 42.99
      }));
    });
  });

});
