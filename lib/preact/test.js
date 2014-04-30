
describe('Preact', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var Preact = require('integrations/lib/preact');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var preact;
  var settings = {
    projectCode: 'x'
  };

  beforeEach(function(){
    analytics.use(Preact);
    preact = new Preact.Integration(settings);
    preact.initialize(); // noop
  });

  afterEach(function(){
    preact.reset();
  });

  it('should have the right settings', function(){
    test(preact)
      .name('Preact')
      .assumesPageview()
      .readyOnInitialize()
      .global('_lnq')
      .option('projectCode', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      sinon.stub(preact, 'load');
    });

    it('should push _setCode onto the window._lnq object', function(){
      preact.initialize();
      assert(equal(window._lnq[0], ['_setCode', settings.projectCode]));
    });

    it('should call #load', function(){
      preact.initialize();
      assert(preact.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window._lnq.push', function(){
      window._lnq = [];
      assert(!preact.loaded());
      window._lnq.push = function(){};
      assert(preact.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(preact, 'load');
      preact.initialize();
      preact.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!preact.loaded());
      preact.load(function (err) {
        if (err) return done(err);
        assert(preact.loaded());
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      preact.initialize();
      window._lnq.push = sinon.spy();
    });

    it('should send an id', function(){
      test(preact)
        .identify('id')
        .called(window._lnq.push)
        .with(['_setPersonData', {
          properties: { id: 'id' },
          email: undefined,
          name: undefined,
          uid: 'id',
        }]);
    });

    it('shouldnt send just traits', function(){
      test(preact).identify(null, { trait: true });
      assert(!window._lnq.push.called);
    });

    it('should send an id and traits', function(){
      test(preact)
        .identify('id', { trait: true })
        .called(window._lnq.push)
        .with(['_setPersonData', {
          properties: { trait: true, id: 'id' },
          email: undefined,
          name: undefined,
          uid: 'id',
        }]);
    });

    it('should send an email', function(){
      test(preact)
        .identify('id', { email: 'name@example.com' })
        .called(window._lnq.push)
        .with(['_setPersonData', {
          properties: { email: 'name@example.com', id: 'id' },
          email: 'name@example.com',
          name: undefined,
          uid: 'id',
        }]);
    });

    it('should send a name', function(){
      test(preact)
        .identify('id', { name: 'name' })
        .called(window._lnq.push)
        .with(['_setPersonData', {
          properties: { name: 'name', id: 'id' },
          email: undefined,
          name: 'name',
          uid: 'id',
        }]);
    });
  });

  describe('#group', function(){
    beforeEach(function(){
      preact.initialize();
      window._lnq.push = sinon.spy();
    });

    it('should send an id', function(){
      test(preact).group('id');
      assert(window._lnq.push.calledWith(['_setAccount', { id: 'id' }]));
    });

    it('should send an id and properties', function(){
      test(preact).group('id', { property: true });
      assert(window._lnq.push.calledWith(['_setAccount', {
        id: 'id',
        property: true
      }]));
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      preact.initialize();
      window._lnq.push = sinon.spy();
    });

    it('should send an event', function(){
      test(preact).track('event');
      assert(window._lnq.push.calledWith(['_logEvent', { name: 'event' }, {}]));
    });

    it('should send an event and properties', function(){
      test(preact).track('event', { property: true });
      assert(window._lnq.push.calledWith(['_logEvent', { name: 'event' }, { property: true }]));
    });

    it('should special case a revenue property', function(){
      test(preact).track('event', { revenue: 9.99 });
      assert(window._lnq.push.calledWith(['_logEvent', {
        name: 'event',
        revenue: 999
      }, {}]));
    });

    it('should special case a note property', function(){
      test(preact).track('event', { note: 'note' });
      assert(window._lnq.push.calledWith(['_logEvent', {
        name: 'event',
        note: 'note'
      }, {}]));
    });
  });
});
