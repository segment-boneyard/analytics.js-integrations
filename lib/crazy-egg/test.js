
describe('Crazy Egg', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var CrazyEgg = require('integrations/lib/crazy-egg');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var crazyegg;
  var settings = {
    accountNumber: '00138301'
  };

  beforeEach(function(){
    analytics.use(CrazyEgg);
    crazyegg = new CrazyEgg.Integration(settings);
    crazyegg.initialize(); // noop
  });

  afterEach(function(){
    crazyegg.reset();
  });

  it('should have the right settings', function(){
    test(crazyegg)
      .name('Crazy Egg')
      .assumesPageview()
      .readyOnLoad()
      .global('CE2')
      .option('accountNumber', '');
  });

  describe('#initialize', function(){
    it('should call #load', function(){
      crazyegg.load = sinon.spy();
      crazyegg.initialize();
      assert(crazyegg.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.CE2', function(){
      assert(!crazyegg.loaded());
      window.CE2 = {};
      assert(crazyegg.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(crazyegg, 'load');
      crazyegg.initialize();
      crazyegg.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!crazyegg.loaded());
      crazyegg.load(function (err) {
        if (err) return done(err);
        assert(crazyegg.loaded());
        done();
      });
    });
  });

});