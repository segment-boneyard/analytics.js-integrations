
describe('Intercom', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Intercom = require('integrations/lib/intercom');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var intercom;
  var settings = {
    appId: 'e2a1655e0444b4cb3f5e593bd35b0602aa1039ae'
  };

  beforeEach(function () {
    analytics.use(Intercom);
    intercom = new Intercom.Integration(settings);
    intercom.initialize(); // noop
  });

  afterEach(function () {
    intercom.reset();
  });

  it('should have the right settings', function () {
    test(intercom)
      .name('Intercom')
      .assumesPageview()
      .readyOnLoad()
      .global('Intercom')
      .option('activator', '#IntercomDefaultWidget')
      .option('appId', '')
      .option('counter', true)
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

    it('should send inbox settings', function () {
      intercom.options.inbox = true;
      test(intercom).identify('id');
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        id: 'id',
        widget: {
          activator: '#IntercomDefaultWidget',
          use_counter: true
        }
      }));
    });

    it('should allow overriding default activator', function () {
      intercom.options.inbox = true;
      intercom.options.activator = '#Intercom';
      test(intercom).identify('id');
      assert(window.Intercom.calledWith('boot', {
        app_id: settings.appId,
        user_id: 'id',
        id: 'id',
        widget: {
          activator: '#Intercom',
          use_counter: true
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

});
