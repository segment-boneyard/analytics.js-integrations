
describe('LiveChat', function(){

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
    license: '4293371'
  };

  beforeEach(function(){
    analytics.use(LiveChat);
    livechat = new LiveChat.Integration(settings);
    livechat.initialize(); // noop
  });

  afterEach(function(){
    timeouts();
    intervals();
    livechat.reset();
  });

  it('should have the right settings', function(){
    test(livechat)
      .name('LiveChat')
      .assumesPageview()
      .readyOnLoad()
      .global('__lc')
      .global('LC_API')
      .global('LC_Invite')
      .global('__lc_inited')
      .option('license', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      livechat.load = sinon.spy();
    });

    it('should create window.__lc', function(){
      assert(!window.__lc);
      livechat.initialize();
      assert(equal(window.__lc, { license: settings.license, group: 0 }));
    });

    it('should call #load', function(){
      livechat.initialize();
      assert(livechat.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test .isLoaded', function(){
      assert(!livechat.loaded());
      window.LC_API = {};
      assert(!livechat.loaded());
      window.LC_Invite = {};
      assert(livechat.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
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

  describe('#identify', function(){
    beforeEach(function (done) {
      livechat.initialize();
      livechat.once('ready', function(){
        sinon.spy(window.LC_API, 'set_custom_variables');
        window.LC_API.set_custom_variables.reset();
        done();
      });
    });

    it('should send an id', function(){
      test(livechat).identify('id');
      assert(window.LC_API.set_custom_variables.calledWith([
        { name: 'id', value: 'id' },
        { name: 'User ID', value: 'id' }
      ]));
    });

    it('should send traits', function(){
      test(livechat).identify(null, { trait: true });
      assert(window.LC_API.set_custom_variables.calledWith([
        { name: 'trait', value: 'true' }
      ]));
    });

    it('should send an id and traits', function(){
      test(livechat).identify('id', { trait: true });
      assert(window.LC_API.set_custom_variables.calledWith([
        { name: 'trait', value: 'true' },
        { name: 'id', value: 'id' },
        { name: 'User ID',value: 'id' }
      ]));
    });
  });

});
