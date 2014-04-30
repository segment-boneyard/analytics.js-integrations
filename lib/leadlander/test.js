
describe('LeadLander', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var LeadLander = require('integrations/lib/leadlander');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var leadlander;
  var settings = {
    accountId: 'x'
  };

  beforeEach(function(){
    analytics.use(LeadLander);
    leadlander = new LeadLander.Integration(settings);
    leadlander.initialize(); // noop
  });

  afterEach(function(){
    leadlander.reset();
  });

  it('should have the right settings', function(){
    test(leadlander)
      .name('LeadLander')
      .assumesPageview()
      .readyOnLoad()
      .global('llactid')
      .global('trackalyzer')
      .option('accountId', null);
  });

  describe('#initialize', function(){
    beforeEach(function(){
      leadlander.load = sinon.spy();
    });

    it('should set window.llactid', function(){
      leadlander.initialize();
      assert(window.llactid === settings.accountId);
    });

    it('should call #load', function(){
      leadlander.initialize();
      assert(leadlander.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.trackalyzer', function(){
      assert(!leadlander.loaded());
      window.trackalyzer = {};
      assert(leadlander.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(leadlander, 'load');
      leadlander.initialize();
      leadlander.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!leadlander.loaded());
      leadlander.load(function (err) {
        if (err) return done(err);
        assert(leadlander.loaded());
        done();
      });
    });
  });

});