
describe('Lytics', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Lytics = require('integrations/lib/lytics');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var tick = require('next-tick');

  var lytics;
  var settings = {
    cid: 'x',
    cookie: 'lytics_cookie'
  };

  beforeEach(function(){
    analytics.use(Lytics);
    lytics = new Lytics.Integration(settings);
    lytics.initialize(); // noop
  });

  afterEach(function(){
    lytics.reset();
  });

  it('should have the right settings', function(){
    test(lytics)
      .name('Lytics')
      .readyOnInitialize()
      .global('jstag')
      .option('cid', '')
      .option('cookie', 'seerid')
      .option('delay', 2000)
      .option('sessionTimeout', 1800)
      .option('url', '//c.lytics.io');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      sinon.stub(lytics, 'load');
    });

    it('should create window.jstag', function(){
      lytics.initialize();
      assert(window.jstag);
    });

    it('should call #load', function(){
      lytics.initialize();
      assert(lytics.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.jstag.bind', function(){
      window.jstag = {};
      assert(!lytics.loaded());
      window.jstag.bind = function(){};
      assert(lytics.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(lytics, 'load');
      lytics.initialize();
      lytics.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!lytics.loaded());
      lytics.load(function (err) {
        if (err) return done(err);
        assert(lytics.loaded());
        done();
      });
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      lytics.initialize();
      window.jstag.send = sinon.spy();
    });

    it('should call send', function(){
      test(lytics).page(null, null, { property: true });
      assert(window.jstag.send.calledWith({ property: true }));
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      lytics.initialize();
      window.jstag.send = sinon.spy();
    });

    it('should send an id', function(){
      test(lytics).identify('id');
      assert(window.jstag.send.calledWith({ _uid: 'id', id: 'id' }));
    });

    it('should send traits', function(){
      test(lytics).identify(null, { trait: true });
      assert(window.jstag.send.calledWith({ trait: true }));
    });

    it('should send an id and traits', function(){
      test(lytics).identify('id', { trait: true });
      assert(window.jstag.send.calledWith({ _uid: 'id', trait: true, id: 'id' }));
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      lytics.initialize();
      window.jstag.send = sinon.spy();
    });

    it('should send an event', function(){
      test(lytics).track('event');
      assert(window.jstag.send.calledWith({ _e: 'event' }));
    });

    it('should send an event and properties', function(){
      test(lytics).track('event', { property: true });
      assert(window.jstag.send.calledWith({ _e: 'event', property: true }));
    });
  });

});
