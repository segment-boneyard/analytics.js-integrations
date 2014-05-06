
describe('Qualaroo', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Qualaroo = require('integrations/lib/qualaroo');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var when = require('when');

  var qualaroo;
  var settings = {
    customerId: '47517',
    siteToken: '9Fd'
  };

  beforeEach(function(){
    analytics.use(Qualaroo);
    qualaroo = new Qualaroo.Integration(settings);
    qualaroo.initialize(); // noop
  });

  afterEach(function(){
    qualaroo.reset();
  });

  it('should have the right settings', function(){
    test(qualaroo)
      .name('Qualaroo')
      .assumesPageview()
      .readyOnInitialize()
      .global('_kiq')
      .option('customerId', '')
      .option('siteToken', '')
      .option('track', false);
  });

  describe('#initialize', function(){
    beforeEach(function(){
      qualaroo.load = sinon.spy();
    });

    it('should create window._kiq', function(){
      assert(!window._kiq);
      qualaroo.initialize();
      assert(window._kiq);
    });

    it('should call #load', function(){
      qualaroo.initialize();
      assert(qualaroo.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window._kiq.push', function(){
      window._kiq = [];
      assert(!qualaroo.loaded());
      window._kiq.push = function(){};
      assert(qualaroo.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(qualaroo, 'load');
      qualaroo.initialize();
      qualaroo.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!qualaroo.loaded());
      qualaroo.load(function (err) {
        if (err) return done(err);
        // it makes an extra ajax request to load itself
        when(function(){
          return qualaroo.loaded();
        }, done);
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      qualaroo.initialize();
      window._kiq.push = sinon.spy();
    });

    it('should send an id', function(){
      test(qualaroo).identify('id');
      assert(window._kiq.push.calledWith(['identify', 'id']));
    });

    it('should send traits', function(){
      test(qualaroo).identify(null, { trait: true });
      assert(window._kiq.push.calledWith(['set', { trait: true }]));
    });

    it('should send an id and traits', function(){
      test(qualaroo).identify('id', { trait: true });
      assert(window._kiq.push.calledWith(['identify', 'id']));
      assert(window._kiq.push.calledWith(['set', { trait: true, id: 'id' }]));
    });

    it('should prefer an email', function(){
      test(qualaroo).identify('id', { email: 'name@example.com' });
      assert(window._kiq.push.calledWith(['identify', 'name@example.com']));
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      qualaroo.initialize();
      window._kiq.push = sinon.spy();
    });

    it('should not send anything by default', function(){
      test(qualaroo).track('event');
      assert(!window._kiq.push.called);
    });

    it('should set an event trait', function(){
      qualaroo.options.track = true;
      test(qualaroo).track('event');
      assert(window._kiq.push.calledWith(['set', { 'Triggered: event': true }]));
    });
  });
});
