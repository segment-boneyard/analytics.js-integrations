
describe('UserVoice', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var extend = require('extend');
  var equal = require('equals');
  var jQuery = require('jquery');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var unix = require('to-unix-timestamp');
  var UserVoice = require('integrations/lib/uservoice');
  var when = require('when');

  var uservoice;
  var settings = {
    apiKey: 'EvAljSeJvWrrIidgVvI2g'
  };

  beforeEach(function(){
    analytics.use(UserVoice);
    uservoice = new UserVoice.Integration(settings);
    uservoice.initialize(); // noop
  });

  afterEach(function(){
    uservoice.reset();
  });

  it('should store the right settings', function(){
    test(uservoice)
      .name('UserVoice')
      .assumesPageview()
      .readyOnInitialize()
      .global('UserVoice')
      .option('apiKey', '')
      .option('classic', false)
      .option('forumId', null)
      .option('showWidget', true)
      .option('mode', 'contact')
      .option('accentColor', '#448dd6')
      .option('smartvote', true)
      .option('trigger', null)
      .option('triggerPosition', 'bottom-right')
      .option('triggerColor', '#ffffff')
      .option('triggerBackgroundColor', 'rgba(46, 49, 51, 0.6)')
      // BACKWARDS COMPATIBILITY: classic options
      .option('classicMode', 'full')
      .option('primaryColor', '#cc6d00')
      .option('linkColor', '#007dbf')
      .option('defaultMode', 'support')
      .option('tabLabel', 'Feedback & Support')
      .option('tabColor', '#cc6d00')
      .option('tabPosition', 'middle-right')
      .option('tabInverted', false);
  });

  describe('Non-Classic', function(){
    describe('#initialize', function(){
      var options = {
        accent_color: '#448dd6',
        apiKey: 'EvAljSeJvWrrIidgVvI2g',
        classic: false,
        classicMode: 'full',
        defaultMode: 'support',
        forum_id: null,
        linkColor: '#007dbf',
        mode: 'contact',
        primaryColor: '#cc6d00',
        showWidget: true,
        smartvote_enabled: true,
        tabColor: '#cc6d00',
        tabInverted: false,
        tabLabel: 'Feedback & Support',
        tabPosition: 'middle-right',
        trigger: null,
        trigger_background_color: 'rgba(46, 49, 51, 0.6)',
        trigger_color: '#ffffff',
        trigger_position: 'bottom-right'
      };

      beforeEach(function(){
        uservoice.load = sinon.spy();
      });

      it('should call #load', function(){
        uservoice.initialize();
        assert(uservoice.load.called);
      });

      it('should push the right options onto window.UserVoice', function(){
        uservoice.initialize();
        assert(equal(window.UserVoice[0], ['set', options]));
      });

      it('should push the autoprompt options', function(){
        uservoice.initialize();
        assert(equal(window.UserVoice[1], ['autoprompt', {}]));
      });

      it('should push the addTrigger options', function(){
        uservoice.initialize();
        assert(equal(window.UserVoice[2], ['addTrigger', options]));
      });

      it('should be ready on initialize', function (done) {
        uservoice.once('ready', done);
        uservoice.initialize();
      });
    });

    describe('#loaded', function(){
      it('should test window.UserVoice.push', function(){
        window.UserVoice = [];
        assert(!uservoice.loaded());
        window.UserVoice.push = function(){};
        assert(uservoice.loaded());
      });
    });

    describe('#load', function(){
      beforeEach(function(){
        sinon.stub(uservoice, 'load');
        uservoice.initialize();
        uservoice.load.restore();
      });

      it('should change loaded state', function (done) {
        assert(!uservoice.loaded());
        uservoice.load(function (err) {
          if (err) return done(err);
          assert(uservoice.loaded());
          done();
        });
      });

      it('should show the trigger', function (done) {
        uservoice.load();
        when(function(){ return jQuery('.uv-icon').length; }, done);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        uservoice.initialize();
        window.UserVoice.push = sinon.spy();
      });

      it('should send an id', function(){
        test(uservoice).identify('id');
        assert(window.UserVoice.push.calledWith([
          'identify',
          { id: 'id' }
        ]));
      });

      it('should send traits', function(){
        test(uservoice).identify(null, { trait: true });
        assert(window.UserVoice.push.calledWith([
          'identify',
          { trait: true }
        ]));
      });

      it('should send an id and traits', function(){
        test(uservoice).identify(null, { id: 'id', trait: true });
        assert(window.UserVoice.push.calledWith([
          'identify',
          { id: 'id', trait: true }
        ]));
      });

      it('should convert a created date', function(){
        var date = new Date();
        test(uservoice).identify(null, { created: date });
        assert(window.UserVoice.push.calledWith([
          'identify',
          { created_at: unix(date) }
        ]));
      });
    });

    describe('#group', function(){
      beforeEach(function(){
        uservoice.initialize();
        window.UserVoice.push = sinon.spy();
      });

      it('should send an id', function(){
        test(uservoice).group('id');
        console.log(window.UserVoice.push.args);
        assert(window.UserVoice.push.calledWith([
          'identify',
          { account: { id: 'id' }}
        ]));
      });

      it('should send properties', function(){
        test(uservoice).group(null, { property: true });
        assert(window.UserVoice.push.calledWith([
          'identify',
          { account: { property: true }}
        ]));
      });

      it('should send an id and properties', function(){
        test(uservoice).group(null, { id: 'id', property: true });
        assert(window.UserVoice.push.calledWith([
          'identify',
          { account: { id: 'id', property: true }}
        ]));
      });

      it('should convert a created date', function(){
        var date = new Date();
        test(uservoice).group(null, { created: date });
        assert(window.UserVoice.push.calledWith([
          'identify',
          { account: { created_at: unix(date) }}
        ]));
      });
    });
  });

  describe('Classic', function(){
    before(function(){
      settings = {
        classic: true,
        classicMode: 'full',
        apiKey: 'mhz5Op4MUft592O8Q82MwA',
        forumId: 221539,
        tabLabel: 'test',
        defaultMode: 'feedback',
        primaryColor: '#ffffff',
      };
    });

    describe('#initialize', function(){
      beforeEach(function(){
        uservoice.load = sinon.spy();
      });

      it('should push the options onto window.UserVoice.push', function(){
        uservoice.initialize();
        assert(equal(window.UserVoice[0], [
          'showTab',
          'classic_widget',
          {
            accentColor: '#448dd6',
            apiKey: 'mhz5Op4MUft592O8Q82MwA',
            classic: true,
            default_mode: 'feedback',
            forum_id: 221539,
            link_color: '#007dbf',
            mode: 'full',
            primary_color: '#ffffff',
            showWidget: true,
            smartvote: true,
            tab_color: '#cc6d00',
            tab_inverted: false,
            tab_label: 'test',
            tab_position: 'middle-right',
            trigger: null,
            triggerBackgroundColor: 'rgba(46, 49, 51, 0.6)',
            triggerColor: '#ffffff',
            triggerPosition: 'bottom-right'
          }
        ]));
      });

      it('should create the window.showClassicWidget function', function(){
        assert(!window.showClassicWidget);
        uservoice.initialize();
        assert(window.showClassicWidget);
      });

      it('should call #load', function(){
        uservoice.initialize();
        assert(uservoice.load.called);
      });

      it('should not have a group method if set to classic', function(){
        uservoice.initialize();
        assert(uservoice.group === undefined);
      });

      it('should be ready on initialize', function (done) {
        uservoice.once('ready', done);
        uservoice.initialize();
      });
    });

    describe('#loaded', function(){
      it('should test window.UserVoice.push', function(){
        window.UserVoice = [];
        assert(!uservoice.loaded());
        window.UserVoice.push = function(){};
        assert(uservoice.loaded());
      });
    });

    describe('#load', function(){
      beforeEach(function(){
        sinon.stub(uservoice, 'load');
        uservoice.initialize();
        uservoice.load.restore();
      });

      it('should change loaded state', function (done) {
        assert(!uservoice.loaded());
        uservoice.load(function (err) {
          if (err) return done(err);
          assert(uservoice.loaded());
          done();
        });
      });

      it('should show the tab', function (done) {
        uservoice.load();
        when(function(){ return document.getElementById('uvTab'); }, done);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        uservoice.initialize();
        window.UserVoice.push = sinon.spy();
      });

      it('should send an id', function(){
        test(uservoice).identify('id');
        assert(window.UserVoice.push.calledWith([
          'setCustomFields',
          { id: 'id' }
        ]));
      });

      it('should send traits', function(){
        test(uservoice).identify(null, { trait: true });
        assert(window.UserVoice.push.calledWith([
          'setCustomFields',
          { trait: true }
        ]));
      });

      it('should send an id and traits', function(){
        test(uservoice).identify(null, { id: 'id', trait: true });
        assert(window.UserVoice.push.calledWith([
          'setCustomFields',
          { id: 'id', trait: true }
        ]));
      });
    });
  });
});
