
describe('Drip', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Drip = require('integrations/lib/drip');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var drip;
  var settings = {
    account: '9999999'
  };

  beforeEach(function(){
    analytics.use(Drip);
    drip = new Drip.Integration(settings);
    drip.initialize(); // noop
  });

  afterEach(function(){
    drip.reset();
  });

  it('should have the right settings', function(){
    test(drip)
      .name('Drip')
      .assumesPageview()
      .readyOnLoad()
      .global('dc')
      .global('_dcq')
      .global('_dcs')
      .option('account', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      drip.load = sinon.spy();
    });

    it('should create window._dcq', function(){
      assert(!window._dcq);
      drip.initialize();
      assert(window._dcq instanceof Array);
    });

    it('should create window._dcs', function(){
      assert(!window._dcs);
      drip.initialize();
      assert(window._dcs);
      assert(window._dcs.account === settings.account);
    });

    it('should call #load', function(){
      drip.initialize();
      assert(drip.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.dc', function(){
      assert(!drip.loaded());
      window.dc = document.createElement('div');
      assert(!drip.loaded());
      window.dc = {};
      assert(drip.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(drip, 'load');
      drip.initialize();
      drip.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!drip.loaded());
      drip.load(function (err) {
        if (err) return done(err);
        assert(drip.loaded());
        done();
      });
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      sinon.stub(drip, 'load');
      drip.initialize();
      sinon.stub(window._dcq, 'push');
    });

    it('should send event as the action', function(){
      test(drip)
      .track('event')
      .called(window._dcq.push)
      .with(['track', { action: 'event' }]);
    });

    it('should convert and alias revenue', function(){
      test(drip)
      .track('event', { revenue: 9.999 })
      .called(window._dcq.push)
      .with(['track', { action: 'event', value: 1000 }]);
    });
  });

});
