describe('hellobar.com', function() {

  var analytics = require('analytics');
  var test = require('integration-tester');
  var sinon = require('sinon');
  var assert = require('assert');
  var Hellobar = require('integrations/lib/hellobar');

  var hellobar;
  var settings = {
    apiKey: 'bb900665a3090a79ee1db98c3af21ea174bbc09f'
  };

  beforeEach(function() {
    analytics.use(Hellobar);
    hellobar = new Hellobar.Integration(settings);
    hellobar.initialize();
  });

  afterEach(function() {
    hellobar.reset();
  });

  it('should have the right settings', function () {
    test(hellobar)
      .name('hellobar.com')
      .assumesPageview()
      .readyOnInitialize()
      .global('_hbq')
      .option('apiKey', '');
  });


  describe('#initialize', function () {
    beforeEach(function () {
      sinon.spy(hellobar, 'load');
    });

    it('should create the window._hbq object', function () {
      assert(typeof(window._hbq) === 'undefined');
      hellobar.initialize();
      assert(window._hbq);
    });

    it('should call #load', function () {
      hellobar.initialize();
      assert(hellobar.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._hbq', function () {
      window._hbq = undefined;
      assert( ! hellobar.loaded());
      window._hbq = {push: Array.prototype.push};
      assert( ! hellobar.loaded());
      window._hbq = {push: function() {}};
      assert(hellobar.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(hellobar, 'load');
      hellobar.initialize();
      hellobar.load.restore();
    });

    it('should change loaded state', function (done) {
      assert( ! hellobar.loaded());
      hellobar.load(function (err) {
        if (err) return done(err);
        assert(hellobar.loaded());
        done();
      });
    });
  });

});
