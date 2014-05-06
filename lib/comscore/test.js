
describe('comScore', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Comscore = require('integrations/lib/comscore');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var comscore;
  var settings = {
    c2: 'x'
  };

  beforeEach(function(){
    analytics.use(Comscore);
    comscore = new Comscore.Integration(settings);
    comscore.initialize(); // noop
  });

  afterEach(function(){
    comscore.reset();
  });

  it('should have the right settings', function(){
    test(comscore)
      .name('comScore')
      .assumesPageview()
      .readyOnLoad()
      .global('_comscore')
      .option('c1', '2')
      .option('c2', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      comscore.load = sinon.spy();
    });

    it('should create window._comscore', function(){
      assert(!window._comscore);
      comscore.initialize();
      assert(window._comscore instanceof Array);
    });

    it('should call #load', function(){
      comscore.initialize();
      assert(comscore.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.COMSCORE', function(){
      assert(!comscore.loaded());
      window.COMSCORE = {};
      assert(comscore.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(comscore, 'load');
      comscore.initialize();
      comscore.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!comscore.loaded());
      comscore.load(function (err) {
        if (err) return done(err);
        assert(comscore.loaded());
        done();
      });
    });
  });

});