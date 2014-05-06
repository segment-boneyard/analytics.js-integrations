
describe('Awesomatic', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Awesomatic = require('integrations/lib/awesomatic');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var when = require('when');

  var awesomatic;
  var settings = {
    appId: 'af392af01603ca383672689241b648b2'
  };

  beforeEach(function(){
    analytics.use(Awesomatic);
    awesomatic = new Awesomatic.Integration(settings);
    awesomatic.initialize(); // noop
  });

  afterEach(function(){
    awesomatic.reset();
  });

  it('should have the right settings', function(){
    test(awesomatic)
      .name('Awesomatic')
      .assumesPageview()
      .global('Awesomatic')
      .global('AwesomaticSettings')
      .global('AwsmSetup')
      .global('AwsmTmp')
      .option('appId', '');
  });

  describe('#initialize', function(){
    it('should call #load', function(){
      awesomatic.load = sinon.spy();
      awesomatic.initialize();
      assert(awesomatic.load.called);
    });

    it('should initialize with the current user', function (done) {
      analytics.user().identify('id', { trait: true });
      awesomatic.initialize();
      awesomatic.once('load', function(){
        when(function(){ return window.AwesomaticSettings; }, function(){
          assert(equal(window.AwesomaticSettings, {
            appId: settings.appId,
            user_id: 'id',
            trait: true
          }));
          done();
        });
      });
    });
  });

  describe('#loaded', function(){
    it('should test window.Awesomatic', function(){
      assert(!awesomatic.loaded());
      window.Awesomatic = document.createElement('div');
      assert(!awesomatic.loaded());
      window.Awesomatic = {};
      assert(awesomatic.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(awesomatic, 'load');
      awesomatic.initialize();
      awesomatic.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!awesomatic.loaded());
      awesomatic.load(function (err) {
        if (err) return done(err);
        assert(awesomatic.loaded());
        done();
      });
    });
  });
});