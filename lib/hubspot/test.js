
describe('HubSpot', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var HubSpot = require('integrations/lib/hubspot');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var hubspot;
  var settings = {
    portalId: 62515
  };

  beforeEach(function(){
    analytics.use(HubSpot);
    hubspot = new HubSpot.Integration(settings);
    hubspot.initialize(); // noop
  });

  afterEach(function(){
    hubspot.reset();
  });

  it('should have the right settings', function(){
    test(hubspot)
      .name('HubSpot')
      .assumesPageview()
      .readyOnInitialize()
      .global('_hsq')
      .option('portalId', null);
  });

  describe('#initialize', function(){
    beforeEach(function(){
      hubspot.load = sinon.spy();
    });

    it('should create window._hsq', function(){
      assert(!window._hsq);
      hubspot.initialize();
      assert(window._hsq instanceof Array);
    });

    it('should call #load', function(){
      hubspot.initialize();
      assert(hubspot.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window._hsq.push', function(){
      window._hsq = [];
      assert(!hubspot.loaded());
      window._hsq.push = function(){};
      assert(hubspot.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(hubspot, 'load');
      hubspot.initialize();
      hubspot.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!hubspot.loaded());
      hubspot.load(function (err) {
        if (err) return done(err);
        assert(hubspot.loaded());
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      hubspot.initialize();
      window._hsq.push = sinon.spy();
    });

    it('should not send traits without an email', function(){
      test(hubspot).identify('id');
      assert(!window._hsq.push.called);
    });

    it('should send traits with an email', function(){
      test(hubspot).identify(null, { email: 'name@example.com' });
      assert(window._hsq.push.calledWith(['identify', { email: 'name@example.com' }]));
    });

    it('should send an id and traits with an email', function(){
      test(hubspot).identify('id', { email: 'name@example.com' });
      assert(window._hsq.push.calledWith(['identify', {
        id: 'id',
        email: 'name@example.com'
      }]));
    });

    it('should convert dates to milliseconds', function(){
      var date = new Date();
      test(hubspot).identify(null, {
        email: 'name@example.com',
        date: date
      });
      assert(window._hsq.push.calledWith(['identify', {
        email: 'name@example.com',
        date: date.getTime()
      }]));
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      hubspot.initialize();
      window._hsq.push = sinon.spy();
    });

    it('should send an event', function(){
      test(hubspot)
      .track('event')
      .called(window._hsq.push)
      .with(['trackEvent', 'event', {}]);
    });

    it('should send an event and properties', function(){
      test(hubspot)
      .track('event', { property: true })
      .called(window._hsq.push)
      .with(['trackEvent', 'event', { property: true }]);
    });

    it('should convert dates to milliseconds', function(){
      var date = new Date();
      var ms = date.getTime();

      test(hubspot)
      .track('event', { date: date })
      .called(window._hsq.push)
      .with(['trackEvent', 'event', { date: ms }]);
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      hubspot.initialize();
      window._hsq.push = sinon.spy();
    });

    it('should send a page view', function(){;
      test(hubspot)
      .page()
      .called(window._hsq.push)
      .with(['_trackPageview']);
    });
  });

});
