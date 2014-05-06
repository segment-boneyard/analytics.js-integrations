
describe('WebEngage', function(){

  var WebEngage = require('integrations/lib/webengage');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');

  var webengage;
  var settings = {
    licenseCode: '~2024c003'
  };

  beforeEach(function(){
    analytics.use(WebEngage);
    webengage = new WebEngage.Integration(settings);
    webengage.initialize();
  })

  it('should store the correct settings', function(){
    test(webengage)
      .name('WebEngage')
      .assumesPageview()
      .readyOnLoad()
      .global('webengage')
      .global('_weq')
      .option('widgetVersion', '4.0')
      .option('licenseCode', '');
  })

  describe('#loaded', function(){
    afterEach(function(){
      webengage.reset();
    })
    it('should test window.webengage', function(){
      assert(!webengage.loaded());
      window.webengage = {};
      assert(webengage.loaded());
    })
  })

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(webengage, 'load');
      webengage.initialize();
      webengage.load.restore();
    })

    it('should change the loaded state', function(done){
      if (webengage.loaded()) return done(new Error('#loaded before #load'));
      webengage.load(function(err){
        if (err) return done(err);
        assert(webengage.loaded());
        done();
      });
    })
  })
})
