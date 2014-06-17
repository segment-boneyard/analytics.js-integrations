
var tester = require('analytics.js-integration-tester');
var analytics = require('analytics.js');
var assert = require('assert');
var Alexa = require('./index')
var equal = require('equals');

describe('Alexa', function(){
  var alexa;
  var test;
  var settings = {
    account: 'h5Gaj1a4ZP000h',
    domain: 'mydomain.com',
    dynamic: true
  };

  beforeEach(function(){
    analytics.use(Alexa);
    alexa = new Alexa.Integration(settings);
    test = tester(alexa).stub('load');
  });

  afterEach(function(){
    alexa.reset();
  });

  it('should have the right settings', function(){
    test
      .name('Alexa')
      .assumesPageview()
      .readyOnLoad()
      .global('_atrk_opts')
      .option('account', null)
      .option('domain', '')
      .option('dynamic', true);
  });

  describe('#initialize', function(){
    beforeEach(function(){
      test.initialize();
    });

    it('should create window._atrk_opts', function(){
      test.deepEqual(window._atrk_opts, {
        atrk_acct: settings.account,
        domain: settings.domain,
        dynamic: settings.dynamic
      });
    });

    it('should call #load', function(){
      test.called(test.load);
    });
  });

  describe('#loaded', function(){
    it('should test window.atrk', function(){
      assert(!test.loaded());
      window.atrk = function(){};
      assert(test.loaded());
      window.atrk = null;
    });
  });

  describe('#load', function(){
    it('should change loaded state', function(done){
      assert(!test.loaded());
      test.load(function(err){
        if (err) return done(err);
        assert(alexa.loaded());
        done();
      });
    });
  });
});