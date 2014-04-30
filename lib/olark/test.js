
describe('Olark', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Olark = require('integrations/lib/olark');
  var once = require('once');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var olark;
  var settings = {
    siteId: '5798-949-10-1692'
  };

  function expandThen (fn) {
    window.olark('api.box.onExpand', once(fn));
    window.olark('api.box.expand');
  }

  function shrinkThen (fn) {
    window.olark('api.box.onShrink', once(fn));
    window.olark('api.box.shrink');
  }

  before(function(){
    analytics.use(Olark);
    olark = new Olark.Integration(settings);
    olark.initialize(); // noop
    olark.initialize();
  });

  it('should have the right settings', function(){
    test(olark)
      .name('Olark')
      .assumesPageview()
      .readyOnInitialize()
      .global('olark')
      .option('identify', true)
      .option('page', true)
      .option('siteId', '')
      .option('track', false);
  });

  describe('#initialize', function(){
    it('should create the window.olark variable', function(){
      assert(window.olark);
    });

    it('should set up expand/shrink listeners', function (done) {
      expandThen(function(){
        assert(olark._open);
        shrinkThen(function(){
          assert(!olark._open);
          done();
        });
      });
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      olark.initialize();
      window.olark = sinon.spy(window, 'olark');
    });

    afterEach(function (done) {
      window.olark.restore();
      shrinkThen(function(){
        done();
      });
    });

    it('should not send an event when the chat isnt open', function(){
      test(olark).page();
      assert(!window.olark.called);
    });

    it('should not send a message without a name or url', function (done) {
      expandThen(function(){
        window.olark.reset();
        test(olark).page();
        assert(!window.olark.called);
        done();
      });
    });

    it('should send a page name', function (done) {
      expandThen(function(){
        test(olark).page(null, 'Name');
        assert(window.olark.calledWith('api.chat.sendNotificationToOperator', {
          body: 'looking at name page'
        }));
        done();
      });
    });

    it('should send a page category and name', function (done) {
      expandThen(function(){
        test(olark).page('Category', 'Name');
        assert(window.olark.calledWith('api.chat.sendNotificationToOperator', {
          body: 'looking at category name page'
        }));
        done();
      });
    });

    it('should send a page url', function (done) {
      expandThen(function(){
        test(olark).page(null, null, { url: 'url' });
        assert(window.olark.calledWith('api.chat.sendNotificationToOperator', {
          body: 'looking at url'
        }));
        done();
      });
    });

    it('should not send an event when page is disabled', function (done) {
      olark.options.page = false;
      expandThen(function(){
        window.olark.reset();
        test(olark).page();
        assert(!window.olark.called);
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      olark.initialize();
      window.olark = sinon.spy(window, 'olark');
    });

    afterEach(function(){
      window.olark.restore();
    });

    it('should send an id', function(){
      test(olark).identify('id');
      assert(window.olark.calledWith('api.visitor.updateCustomFields', {
        id: 'id'
      }));
    });

    it('should send traits', function(){
      test(olark).identify(undefined, { trait: true });
      assert(window.olark.calledWith('api.visitor.updateCustomFields', {
        trait: true
      }));
    });

    it('should send an id and traits', function(){
      test(olark).identify('id', { trait: true });
      assert(window.olark.calledWith('api.visitor.updateCustomFields', {
        id: 'id',
        trait: true
      }));
    });

    it('should send an email', function(){
      test(olark).identify(undefined, { email: 'name@example.com' });
      assert(window.olark.calledWith('api.visitor.updateEmailAddress', {
        emailAddress: 'name@example.com'
      }));
    });

    it('shouldnt send an empty email', function(){
      test(olark).identify('id');
      assert(!window.olark.calledWith('api.visitor.updateEmailAddress'));
    });

    it('should send a name', function(){
      test(olark).identify(undefined, { name: 'first last' });
      assert(window.olark.calledWith('api.visitor.updateFullName', {
        fullName: 'first last'
      }));
    });

    it('shouldnt send an empty name', function(){
      test(olark).identify('id');
      assert(!window.olark.calledWith('api.visitor.updateFullName'));
    });

    it('should fallback to sending first and last name', function(){
      test(olark).identify(undefined, {
        firstName: 'first',
        lastName: 'last'
      });
      assert(window.olark.calledWith('api.visitor.updateFullName', {
        fullName: 'first last'
      }));
    });

    it('should fallback to sending only a first name', function(){
      test(olark).identify(undefined, { firstName: 'first' });
      assert(window.olark.calledWith('api.visitor.updateFullName', {
        fullName: 'first'
      }));
    });

    it('should send a phone number', function(){
      test(olark).identify(undefined, { phone: 'phone' });
      assert(window.olark.calledWith('api.visitor.updatePhoneNumber', {
        phoneNumber: 'phone'
      }));
    });

    it('shouldnt send an empty phone number', function(){
      test(olark).identify('id');
      assert(!window.olark.calledWith('api.visitor.updatePhoneNumber'));
    });

    it('should us an id as a nickname', function(){
      test(olark)
        .identify('id')
        .called(window.olark)
        .with('api.chat.updateVisitorNickname', {
          snippet: 'id'
        });
    });

    it('should prefer a username as a nickname', function(){
      test(olark).identify('id', { username: 'username' });
      assert(window.olark.calledWith('api.chat.updateVisitorNickname', {
        snippet: 'username'
      }));
    });

    it('should prefer an email as a nickname', function(){
      test(olark).identify('id', {
        username: 'username',
        email: 'name@example.com'
      });
      assert(window.olark.calledWith('api.chat.updateVisitorNickname', {
        snippet: 'name@example.com'
      }));
    });

    it('should prefer a name as a nickname', function(){
      test(olark).identify('id', {
        username: 'username',
        name: 'name'
      });
      assert(window.olark.calledWith('api.chat.updateVisitorNickname', {
        snippet: 'name'
      }));
    });

    it('should prefer a name and email as a nickname', function(){
      test(olark).identify('id', {
        username: 'username',
        name: 'name',
        email: 'name@example.com'
      });
      assert(window.olark.calledWith('api.chat.updateVisitorNickname', {
        snippet: 'name (name@example.com)'
      }));
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      olark.initialize();
      window.olark = sinon.spy(window, 'olark');
    });

    afterEach(function (done) {
      window.olark.restore();
      shrinkThen(function(){
        done();
      });
    });

    it('should not send an event by default', function(){
      test(olark).track('event');
      assert(!window.olark.called);
    });

    it('should not send an event when the chat isnt open', function(){
      olark.options.track = true;
      test(olark).track('event');
      assert(!window.olark.called);
    });

    it('should send an event', function (done) {
      olark.options.track = true;
      expandThen(function(){
        test(olark).track('event');
        assert(window.olark.calledWith('api.chat.sendNotificationToOperator', {
          body: 'visitor triggered "event"'
        }));
        done();
      });
    });
  });

});
