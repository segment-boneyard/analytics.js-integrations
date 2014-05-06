
describe('HitTail', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var HitTail = require('integrations/lib/hittail');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var hittail;
  var settings = {
    siteId: 'x'
  };

  beforeEach(function(){
    analytics.use(HitTail);
    hittail = new HitTail.Integration(settings);
    hittail.initialize(); // noop
  });

  afterEach(function(){
    hittail.reset();
  });

  it('should have the right settings', function(){
    test(hittail)
      .name('HitTail')
      .assumesPageview()
      .readyOnLoad()
      .global('htk')
      .option('siteId', '');
  });

  describe('#initialize', function(){
    it('should call #load', function(){
      hittail.load = sinon.spy();
      hittail.initialize();
      assert(hittail.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.htk', function(){
      assert(!hittail.loaded());
      window.htk = document.createElement('div');
      assert(!hittail.loaded());
      window.htk = {};
      assert(!hittail.loaded());
      window.htk = function(){};
      assert(hittail.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(hittail, 'load');
      hittail.initialize();
      hittail.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!hittail.loaded());
      hittail.load(function (err) {
        if (err) return done(err);
        assert(hittail.loaded());
        done();
      });
    });
  });

});