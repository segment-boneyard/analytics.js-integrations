
describe('Pingdom', function(){

  var Pingdom = require('integrations/lib/pingdom');
  var analytics = require('analytics');
  var assert = require('assert');
  var date = require('load-date');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var pingdom;
  var settings = {
    id: '5168f8c6abe53db732000000'
  };

  beforeEach(function(){
    analytics.use(Pingdom);
    pingdom = new Pingdom.Integration(settings);
    pingdom.initialize(); // noop
  });

  afterEach(function(){
    pingdom.reset();
  });

  it('should have the right settings', function(){
    test(pingdom)
      .name('Pingdom')
      .assumesPageview()
      .readyOnLoad()
      .global('_prum')
      .option('id', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      pingdom.load = sinon.spy();
    });

    it('should call #load', function(){
      pingdom.initialize();
      assert(pingdom.load.called);
    });

    it('should push the id onto window._prum', function(){
      pingdom.initialize();
      assert(equal(window._prum[0], ['id', settings.id]));
    });
  });

  describe('#loaded', function(){
    it('should test window._prum.push', function(){
      window._prum = [];
      assert(!pingdom.loaded());
      window._prum.push = function(){};
      assert(pingdom.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(pingdom, 'load');
      pingdom.initialize();
      pingdom.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!pingdom.loaded());
      pingdom.load(function (err) {
        if (err) return done(err);
        assert(pingdom.loaded());
        done();
      });
    });

    it('should mark the first byte', function (done) {
      pingdom.load(function(){
        assert(date.getTime() == window.PRUM_EPISODES.marks.firstbyte);
        done();
      });
    });
  });
});