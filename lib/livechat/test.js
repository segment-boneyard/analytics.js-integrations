
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var LiveChat = require('./');

describe('LiveChat', function() {
  var analytics;
  var livechat;
  var options = {
    license: '5487831',
    listen: true
  };

  beforeEach(function() {
    analytics = new Analytics();
    livechat = new LiveChat(options);
    analytics.use(LiveChat);
    analytics.use(tester);
    analytics.add(livechat);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    livechat.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    var Test = integration('LiveChat')
      .assumesPageview()
      .global('LC_API')
      .global('LC_Invite')
      .global('__lc')
      .global('__lc_inited')
      .option('license', '')
      .option('listen', false);

    analytics.compare(LiveChat, Test);
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.identify({ email: 'email', name: 'name' });
      analytics.stub(livechat, 'load');
    });

    describe('#initialize', function() {
      it('should create window.__lc', function() {
        analytics.assert(!window.__lc);
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window.__lc, {
          license: options.license,
          group: 0,
          visitor: {
            name: 'name',
            email: 'email'
          }
        });
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(livechat, function() {
        analytics.assert(window.LC_Invite);
        analytics.assert(window.LC_API);
        done();
      });
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window.LC_API, 'set_custom_variables');
      });

      it('should send an id', function() {
        analytics.identify('id');
        analytics.called(window.LC_API.set_custom_variables, [
          { name: 'id', value: 'id' },
          { name: 'User ID', value: 'id' }
        ]);
      });

      it('should send traits', function() {
        analytics.identify({ trait: true });
        analytics.called(window.LC_API.set_custom_variables, [
          { name: 'trait', value: true }
        ]);
      });

      it('should send an id and traits', function() {
        analytics.identify('id', { trait: true });
        analytics.called(window.LC_API.set_custom_variables, [
          { name: 'trait', value: true },
          { name: 'id', value: 'id' },
          { name: 'User ID', value: 'id' }
        ]);
      });
    });

    /**
     * FIXME: Livechat doesn't have an API for testing these triggers at the moment.
     */

    xdescribe('#listen', function() {
      beforeEach(function(done) {
        analytics.once('ready', done);
        analytics.initialize();
        analytics.stub(analytics, 'track');
      });

      xit('should send a chat started event', function(done) {
        setTimeout(function() {
          window.LC_API.start_chat();
        }, 3000);
        setTimeout(function() {
          analytics.called(analytics.track, 'Live Chat Conversation Started', {}, { context: { integration: { name: 'snapengage', version: '1.0.0' }}});
          done();
        }, 8000);
      });

      xit('should send a chat sent event', function(done) {
        window.userlikeTrackingEvent('message_operator_terminating');
        setTimeout(function() {
          analytics.called(analytics.track, 'Live Chat Message Sent', {}, { context: { integration: { name: 'snapengage', version: '1.0.0' }}});
          done();
        }, 3000);
      });

      xit('should send a chat received event', function(done) {
        window.userlikeTrackingEvent('message_client_terminating');
        setTimeout(function() {
          analytics.called(analytics.track, 'Live Chat Message Received', {}, { context: { integration: { name: 'snapengage', version: '1.0.0' }}});
          done();
        }, 3000);
      });

      xit('should send a chat ended event', function(done) {
        window.LC_API.close_chat();
        setTimeout(function() {
          analytics.called(analytics.track, 'Live Chat Conversation Ended', {}, { context: { integration: { name: 'snapengage', version: '1.0.0' }}});
          done();
        }, 3000);
      });
    });
  });
});
