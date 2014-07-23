
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var tick = require('next-tick');
var once = require('once');
var when = require('when');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Olark', function(){
  var Olark = plugin;
  var olark;
  var analytics;
  var options = {
    siteId: '5798-949-10-1692'
  };

  beforeEach(function(){
    analytics = new Analytics;
    olark = new Olark(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(olark);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    sandbox();
  });

  after(function(){
    olark.reset();
  });

  it('should have the right settings', function(){
    analytics.compare(Olark, integration('Olark')
      .assumesPageview()
      .global('olark')
      .option('identify', true)
      .option('page', true)
      .option('siteId', '')
      .option('track', false));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(window, 'olark');
      analytics.stub(olark, 'load');
    });

    afterEach(function(){
      olark.reset();
    });

    it('should pass in group id to `configure`', function(){
      olark.options.groupId = '-groupId-';
      analytics.initialize();
      analytics.page();
      analytics.called(window.olark, 'api.chat.setOperatorGroup', { group: '-groupId-' });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(olark, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    it('should create the window.olark variable', function(){
      analytics.assert(window.olark);
    });

    it('should set up expand/shrink listeners', function(done){
      expandThen(function(){
        analytics.assert(olark._open);
        shrinkThen(function(){
          analytics.assert(!olark._open);
          done();
        });
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window, 'olark');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.olark, 'api.visitor.updateCustomFields', {
          id: 'id'
        });
      });

      it('should send traits', function(){
        analytics.identify(undefined, { trait: true });
        analytics.called(window.olark, 'api.visitor.updateCustomFields', {
          trait: true
        });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.olark, 'api.visitor.updateCustomFields', {
          trait: true,
          id: 'id'
        });
      });

      it('should send an email', function(){
        analytics.identify(undefined, { email: 'name@example.com' });
        analytics.called(window.olark, 'api.visitor.updateEmailAddress', {
          emailAddress: 'name@example.com'
        });
      });

      it('shouldnt send an empty email', function(){
        analytics.identify('id');
        analytics.didNotCall(window.olark, 'api.visitor.updateEmailAddress');
      });

      it('should send a name', function(){
        analytics.identify(undefined, { name: 'first last' });
        analytics.called(window.olark, 'api.visitor.updateFullName', {
          fullName: 'first last'
        });
      });

      it('shouldnt send an empty name', function(){
        analytics.identify('id');
        analytics.didNotCall(window.olark, 'api.visitor.updateFullName');
      });

      it('should fallback to sending first and last name', function(){
        analytics.identify(undefined, {
          firstName: 'first',
          lastName: 'last'
        });
        analytics.called(window.olark, 'api.visitor.updateFullName', {
          fullName: 'first last'
        });
      });

      it('should fallback to sending only a first name', function(){
        analytics.identify(undefined, { firstName: 'first' });
        analytics.called(window.olark, 'api.visitor.updateFullName', {
          fullName: 'first'
        });
      });

      it('should send a phone number', function(){
        analytics.identify(undefined, { phone: 'phone' });
        analytics.called(window.olark, 'api.visitor.updatePhoneNumber', {
          phoneNumber: 'phone'
        });
      });

      it('shouldnt send an empty phone number', function(){
        analytics.identify('id');
        analytics.didNotCall(window.olark, 'api.visitor.updatePhoneNumber');
      });

      it('should us an id as a nickname', function(){
        analytics.identify('id');
        analytics.called(window.olark, 'api.chat.updateVisitorNickname', {
          snippet: 'id'
        });
      });

      it('should prefer a username as a nickname', function(){
        analytics.identify('id', { username: 'username' });
        analytics.called(window.olark, 'api.chat.updateVisitorNickname', {
          snippet: 'username'
        });
      });

      it('should prefer an email as a nickname', function(){
        analytics.identify('id', {
          username: 'username',
          email: 'name@example.com'
        });
        analytics.called(window.olark, 'api.chat.updateVisitorNickname', {
          snippet: 'name@example.com'
        });
      });

      it('should prefer a name as a nickname', function(){
        analytics.identify('id', {
          username: 'username',
          name: 'name'
        });
        analytics.called(window.olark, 'api.chat.updateVisitorNickname', {
          snippet: 'name'
        });
      });

      it('should prefer a name and email as a nickname', function(){
        analytics.identify('id', {
          username: 'username',
          name: 'name',
          email: 'name@example.com'
        });
        analytics.called(window.olark, 'api.chat.updateVisitorNickname', {
          snippet: 'name (name@example.com)'
        });
      });
    });

    describe('not open', function(){
      beforeEach(function(){
        analytics.stub(window, 'olark');
      });

      describe('#page', function(){
        it('should not send an event when the chat isnt open', function(){
          analytics.page();
          analytics.didNotCall(window.olark);
        });
      });

      describe('#track', function(){
        it('should not send an event by default', function(){
          analytics.track('event');
          analytics.didNotCall(window.olark);
        });

        it('should not send an event when the chat isnt open', function(){
          olark.options.track = true;
          analytics.track('event');
          analytics.didNotCall(window.olark);
        });
      });
    });

    describe('open', function(){
      beforeEach(function(done){
        expandThen(function(){
          analytics.stub(window, 'olark');
          done();
        });
      });

      afterEach(function(done){
        analytics.restore();
        shrinkThen(function(){
          done();
        });
      });

      describe('#page', function(){
        // it('should not send a message without a name or url', function(){
        //   analytics.page();
        //   analytics.didNotCall(window.olark);
        // });

        it('should send a page name', function(){
          analytics.page('Name');
          analytics.called(window.olark, 'api.chat.sendNotificationToOperator', {
            body: 'looking at name page'
          });
        });

        it('should send a page category and name', function(){
          analytics.page('Category', 'Name');
          analytics.called(window.olark, 'api.chat.sendNotificationToOperator', {
            body: 'looking at category name page'
          });
        });

        it('should send a page url', function(){
          analytics.page({ url: 'url' });
          analytics.called(window.olark, 'api.chat.sendNotificationToOperator', {
            body: 'looking at url'
          });
        });

        it('should not send an event when page is disabled', function(){
          olark.options.page = false;
          analytics.page();
          analytics.didNotCall(window.olark);
        });
      });

      describe('#track', function(){
        it('should send an event', function(){
          olark.options.track = true;
          analytics.track('event');
          analytics.called(window.olark, 'api.chat.sendNotificationToOperator', {
            body: 'visitor triggered "event"'
          });
        });
      });
    });
  });
});

function expandThen(fn) {
  window.olark('api.box.onExpand', once(fn));
  window.olark('api.box.expand');
}

function shrinkThen(fn) {
  window.olark('api.box.onShrink', once(fn));
  window.olark('api.box.shrink');
}