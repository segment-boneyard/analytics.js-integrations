
describe('USERcycle', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var USERcycle = require('integrations/lib/usercycle');

  var usercycle;
  var settings = {
    key: 'x'
  };

  beforeEach(function(){
    analytics.use(USERcycle);
    usercycle = new USERcycle.Integration(settings);
    usercycle.initialize(); // noop
  });

  afterEach(function(){
    usercycle.reset();
  });

  it('should have the right settings', function(){
    test(usercycle)
      .name('USERcycle')
      .assumesPageview()
      .readyOnInitialize()
      .global('_uc')
      .option('key', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      usercycle.load = sinon.spy();
    });

    it('should push a key onto window._uc', function(){
      usercycle.initialize();
      assert(equal(window._uc[0], ['_key', settings.key]));
    });

    it('should call #load', function(){
      usercycle.initialize();
      assert(usercycle.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window._uc.push', function(){
      window._uc = [];
      assert(!usercycle.loaded());
      window._uc.push = function(){};
      assert(usercycle.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(usercycle, 'load');
      usercycle.initialize();
      usercycle.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!usercycle.loaded());
      usercycle.load(function (err) {
        if (err) return done(err);
        assert(usercycle.loaded());
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      usercycle.initialize();
      window._uc.push = sinon.spy();
    });

    it('should send an id', function(){
      test(usercycle).identify('id');
      assert(window._uc.push.calledWith(['uid', 'id']));
      assert(window._uc.push.calledWith(['action', 'came_back', { id: 'id' }]));
    });

    it('should send traits', function(){
      test(usercycle).identify(null, { trait: true });
      assert(window._uc.push.calledWith(['action', 'came_back', {
        trait: true
      }]));
    });

    it('should send an id and traits', function(){
      test(usercycle).identify('id', { trait: true });
      assert(window._uc.push.calledWith(['uid', 'id']));
      assert(window._uc.push.calledWith(['action', 'came_back', {
        trait: true,
        id: 'id'
      }]));
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      usercycle.initialize();
      window._uc.push = sinon.spy();
    });

    it('should send an event', function(){
      test(usercycle).track('event');
      assert(window._uc.push.calledWith(['action', 'event', {}]));
    });

    it('should send an event and properties', function(){
      test(usercycle).track('event', { property: true });
      assert(window._uc.push.calledWith(['action', 'event', {
        property: true
      }]));
    });

    it('should send revenue as revenue_amount', function(){
      test(usercycle)
        .track('event', { revenue: '$50' })
        .called(window._uc.push)
        .with(['action', 'event', {
          revenue_amount: 50
        }]);
    })
  });
});
