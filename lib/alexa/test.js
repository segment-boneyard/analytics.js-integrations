
describe('Alexa', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Alexa = require('integrations/lib/alexa');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var alexa;
  var settings = {
    account: 'h5Gaj1a4ZP000h',
    domain: 'mydomain.com',
    dynamic: true
  };

  beforeEach(function(){
    analytics.use(Alexa);
    alexa = new Alexa.Integration(settings);
    sinon.stub(alexa, 'load');
    alexa.initialize(); // noop
  });

  afterEach(function(){
    alexa.reset();
  });

  it('should have the right settings', function(){
    test(alexa)
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
      alexa.load = sinon.spy();
    });

    it('should create window._atrk_opts', function(){
      alexa.initialize();
      assert(equal(window._atrk_opts, {
        atrk_acct: settings.account,
        domain: settings.domain,
        dynamic: settings.dynamic
      }));
    });

    it('should call #load', function(){
      alexa.initialize();
      assert(alexa.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.atrk', function(){
      assert(!alexa.loaded());
      window.atrk = function(){};
      assert(alexa.loaded());
      window.atrk = null;
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      alexa.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!alexa.loaded());
      alexa.load(function (err) {
        if (err) return done(err);
        assert(alexa.loaded());
        done();
      });
    });
  });

});
