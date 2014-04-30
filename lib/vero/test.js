
describe('Vero', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var tick = require('next-tick');
  var Vero = require('integrations/lib/vero');

  var vero;
  var settings = {
    apiKey: 'x'
  };

  beforeEach(function(){
    analytics.use(Vero);
    vero = new Vero.Integration(settings);
  });

  afterEach(function(){
    vero.reset();
  });

  it('should store the proper settings', function(){
    test(vero)
      .readyOnInitialize()
      .global('_veroq')
      .option('apiKey', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      vero.load = sinon.spy();
    });

    it('should push onto window._veroq', function(){
      vero.initialize();
      assert(equal(window._veroq[0], ['init', { api_key: settings.apiKey }]));
    });

    it('should call #load', function(){
      vero.initialize();
      assert(vero.load.called);
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      window._veroq = [];
      window._veroq.push = sinon.spy();
    })

    it('should push "trackPageview"', function(){
      test(vero).page();
      assert(window._veroq.push.calledWith(['trackPageview']));
    })
  })

  describe('#loaded', function(){
    it('should test window._veroq.push', function(){
      window._veroq = [];
      assert(!vero.loaded());
      window._veroq.push = function(){};
      assert(vero.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(vero, 'load');
      vero.initialize();
      vero.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!vero.loaded());
      vero.load(function (err) {
        if (err) return done(err);
        assert(vero.loaded());
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function (done) {
      vero.once('load', function(){
        window._veroq.push = sinon.spy();
        done();
      });
      vero.initialize();
    });

    it('shouldnt send just an id', function(){
      test(vero).identify('id');
      assert(!window._veroq.push.called);
    });

    it('shouldnt send without an id', function(){
      test(vero).identify(null, { trait: true });
      assert(!window._veroq.push.called);
    });

    it('should send an id and email', function(){
      test(vero).identify('id', { email: 'name@example.com' });
      assert(window._veroq.push.calledWith(['user', {
        id: 'id',
        email: 'name@example.com'
      }]));
    });

    it('should send an id and traits', function(){
      test(vero).identify('id', {
        email: 'name@example.com',
        trait: true
      });
      assert(window._veroq.push.calledWith(['user', {
        id: 'id',
        email: 'name@example.com',
        trait: true
      }]));
    });
  });

  describe('#track', function(){
    beforeEach(function (done) {
      vero.once('load', function(){
        window._veroq.push = sinon.spy();
        done();
      });
      vero.initialize();
    });

    it('should send an event', function(){
      test(vero).track('event');
      assert(window._veroq.push.calledWith(['track', 'event', {}]));
    });

    it('should send an event and properties', function(){
      test(vero).track('event', { property: true });
      assert(window._veroq.push.calledWith(['track', 'event', { property: true }]));
    });
  });
});
