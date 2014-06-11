
describe('Intercom', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Intercom = require('integrations/lib/intercom');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var intercom;
  var settings = {
    appId: '8cf9338df9625cbe6811a16d573a79b0c8a8fa86'
  };

  beforeEach(function () {
    analytics.use(Intercom);
    intercom = new Intercom.Integration(settings);
    intercom.initialize(); // noop
  });

  afterEach(function () {
    intercom.reset();
    analytics.user().reset();
    analytics.group().reset();
  });

  it('should have the right settings', function () {
    test(intercom)
      .name('Intercom')
      .assumesPageview()
      .readyOnLoad()
      .global('Intercom')
      .option('activator', '#IntercomDefaultWidget')
      .option('appId', '')
      .option('inbox', false);
  });

  describe('#initialize', function () {
    it('should call #load', function () {
      intercom.load = sinon.spy();
      intercom.initialize();
      assert(intercom.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window.Intercom', function () {
      assert(!intercom.loaded());
      window.Intercom = document.createElement('div');
      assert(!intercom.loaded());
      window.Intercom = function(){};
      assert(intercom.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(intercom, 'load');
      intercom.initialize();
      intercom.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!intercom.loaded());
      intercom.load(function (err) {
        if (err) return done(err);
        assert(intercom.loaded());
        done();
      });
    });
  });

  describe('#page', function(){
    beforeEach(function(done){
      window.Intercom = sinon.spy();
      intercom.page(); // first call initializes
      intercom.once('ready', done);
    });

    it('should call update on subsequent pageviews', function(){
      test(intercom)
        .page()
        .called(window.Intercom)
        .with('update');
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      window.Intercom = sinon.spy();
    });

    it('should call boot the first time and update the second', function () {
      var app = settings.appId;
      test(intercom)
        .identify('id')
        .called(window.Intercom)
        .with('boot', { app_id: app, user_id: 'id', id: 'id' });

      test(intercom)
        .identify('id')
        .called(window.Intercom)
        .with('update', { app_id: app, user_id: 'id', id: 'id' });
    });

    it('should send an id and traits', function () {
      test(intercom)
        .identify('id', { email: 'email@example.com' })
        .called(window.Intercom)
        .with('boot', {
          email: 'email@example.com',
          app_id: settings.appId,
          user_id: 'id',
          id: 'id'
        });
    });

    it('should send user name', function(){
      test(intercom)
        .identify('id', { name: 'john doe' })
        .called(window.Intercom)
        .with('boot', {
          app_id: settings.appId,
          user_id: 'id',
          name: 'john doe',
          id: 'id'
        });
    })

    it('should send first and last as name', function(){
      test(intercom)
        .identify('id', { firstName: 'john', lastName: 'doe' })
        .called(window.Intercom)
        .with('boot', {
          app_id: settings.appId,
          user_id: 'id',
          firstName: 'john',
          lastName: 'doe',
          name: 'john doe',
          id: 'id'
        });
    })

    it('should respect .name, .firstName and .lastName', function(){
      test(intercom)
        .identify('id', { firstName: 'john', lastName: 'doe', name: 'baz' })
        .called(window.Intercom)
        .with('boot', {
          app_id: settings.appId,
          user_id: 'id',
          firstName: 'john',
          lastName: 'doe',
          name: 'baz',
          id: 'id'
        });
    })

    it('should send created_at as seconds', function(){
      var now = new Date;
      test(intercom)
        .identify('id', { created: now })
        .called(window.Intercom)
        .with('boot', {
          app_id: settings.appId,
          created_at: Math.floor(now.getTime() / 1000),
          user_id: 'id',
          id: 'id'
        });
    })

    it('should convert dates', function () {
      var date = new Date();
      test(intercom).identify('id', {
        created: date,
        company: { created: date }
      });
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        created_at: Math.floor(date / 1000),
        company: { created_at: Math.floor(date / 1000) },
        id: 'id'
      }));
    });

    it('should allow passing a user hash', function () {
      test(intercom).identify('id', {}, {
        Intercom: {
          userHash: 'x'
        }
      });
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        user_hash: 'x',
        id: 'id'
      }));
    });

    it('should allow passing increments', function () {
      test(intercom).identify('id', {}, {
        Intercom: {
          increments: { number: 42 }
        }
      });
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        increments: { number: 42 },
        id: 'id'
      }));
    });

    it('should send widget settings if the activator isnt the default one.', function () {
      intercom.options.activator = '#my-widget';
      test(intercom).identify('id');
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        id: 'id',
        widget: {
          activator: '#my-widget'
        }
      }));
    });

    it('should not send activator if its the default one.', function () {
      test(intercom).identify('id');
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        id: 'id'
      }));
    });

    it('should not fail when the company trait is a string', function () {
      test(intercom).identify('id', { company: 'string' });
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        id: 'id'
      }));
    });

    it('should not fail when the company trait is a number', function () {
      test(intercom).identify('id', { company: 97 });
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        id: 'id'
      }));
    });

    it('should carry over company traits set in group if a company trait exists', function() {
      analytics.group().traits({ foo: 'bar' });
      test(intercom).identify('id', { company: { name: 'name' }});
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        id: 'id',
        company: {
          name: 'name',
          foo: 'bar'
        }
      }));
    });
  });

  describe('#group', function () {
    beforeEach(function () {
      window.Intercom = sinon.spy();
    });

    it('should send an id', function () {
      test(intercom).group('id');
      assert(window.Intercom.calledWith('update', { company: { id: 'id' }}));
    });

    it('should send an id and properties', function () {
      test(intercom).group('id', { name: 'Name' });
      assert(window.Intercom.calledWith('update', {
        company: {
          id: 'id',
          name: 'Name'
        }
      }));
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      window.Intercom = sinon.spy();
    })

    it('should send an event', function(){
      test(intercom)
        .track('event')
        .called(window.Intercom)
        .with('trackEvent', 'event', {});
    })
  })

});
