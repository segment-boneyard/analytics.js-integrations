
describe('LiveChat', function () {

  var timeouts = require('clear-timeouts');
  var intervals = require('clear-intervals');
  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var LiveChat = require('integrations/lib/livechat');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var livechat;
  var settings = {
    license: '1520'
  };

  beforeEach(function () {
    analytics.use(LiveChat);
    livechat = new LiveChat.Integration(settings);
    livechat.initialize(); // noop
  });

  afterEach(function () {
    timeouts();
    intervals();
    livechat.reset();
  });

  it('should have the right settings', function () {
    test(livechat)
      .name('LiveChat')
      .assumesPageview()
      .readyOnLoad()
      .global('__lc')
      .option('license', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      livechat.load = sinon.spy();
    });

    it('should create window.__lc', function () {
      assert(!window.__lc);
      livechat.initialize();
      assert(equal(window.__lc, { license: settings.license }));
    });

    it('should call #load', function () {
      livechat.initialize();
      assert(livechat.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test .isLoaded', function () {
      assert(!livechat.loaded());
      livechat.isLoaded = true;
      assert(livechat.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(livechat, 'load');
      livechat.initialize();
      livechat.load.restore();
    });

    it('should change loaded state', function (done) {
      if (livechat.loaded()) return done(new Error('livechat already loaded'));
      livechat.load(function (err) {
        if (err) return done(err);
        assert(livechat.loaded());
        done();
      });
    });
  });

  describe('#identify', function () {
    beforeEach(function (done) {
      livechat.initialize();
      livechat.once('load', function () {
        window.LC_API.set_custom_variables = sinon.spy();
        done();
      });
    });

    it('should send an id', function () {
      test(livechat).identify('id');
      assert(window.LC_API.set_custom_variables.calledWith([
        { name: 'id', value: 'id' },
        { name: 'User ID', value: 'id' }
      ]));
    });

    it('should send traits', function () {
      test(livechat).identify(null, { trait: true });
      assert(window.LC_API.set_custom_variables.calledWith([
        { name: 'trait', value: true }
      ]));
    });

    it('should send an id and traits', function () {
      test(livechat).identify('id', { trait: true });
      assert(window.LC_API.set_custom_variables.calledWith([
        { name: 'trait', value: true },
        { name: 'id', value: 'id' },
        { name: 'User ID',value: 'id' }
      ]));
    });
  });

  after(function(){
    livechat.initialize();
  })

});
