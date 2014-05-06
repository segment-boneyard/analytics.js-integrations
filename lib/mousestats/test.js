
describe('MouseStats', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var MouseStats = require('integrations/lib/mousestats');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var mousestats;
  var settings = {
    accountNumber: '5532375730335616295'
  };

  beforeEach(function(){
    analytics.use(MouseStats);
    mousestats = new MouseStats.Integration(settings);
    mousestats.initialize(); // noop
  });

  afterEach(function(){
    mousestats.reset();
  });

  it('should have the right settings', function(){
    test(mousestats)
      .name('MouseStats')
      .assumesPageview()
      .readyOnLoad()
      .global('msaa')
      .option('accountNumber', '');
  });

  describe('#initialize', function(){
    it('should call #load', function(){
      mousestats.load = sinon.spy();
      mousestats.initialize();
      assert(mousestats.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.msaa', function(){
      assert(!mousestats.loaded());
      window.msaa = document.createElement('div');
      assert(!mousestats.loaded());
      window.msaa = {};
      assert(!mousestats.loaded());
      window.msaa = function(){};
      assert(mousestats.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(mousestats, 'load');
      mousestats.initialize();
      mousestats.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!mousestats.loaded());
      mousestats.load(function (err) {
        if (err) return done(err);
        assert(mousestats.loaded());
        done();
      });
    });
  });

});