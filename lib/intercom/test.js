
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Intercom', function(){
  var Intercom = plugin;
  var intercom;
  var analytics;
  var options = {
    appId: 'a3vy8ufv'
  };

  beforeEach(function(){
    analytics = new Analytics();
    intercom = new Intercom(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(intercom);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    intercom.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Intercom, integration('Intercom')
      .global('Intercom')
      .option('activator', '#IntercomDefaultWidget')
      .option('appId', '')
      .tag('<script src="https://widget.intercom.io/widget/{{ appId }}">'));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(intercom, 'load');
    });

    describe('#initialize', function(){
      it('should create window.Intercom', function(){
        analytics.assert(!window.Intercom);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.Intercom);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(intercom.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(intercom, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window, 'Intercom');
      });

      it('should call boot first and update subsequently', function(){
        analytics.page();
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId
        });

        analytics.page();
        analytics.called(window.Intercom, 'update', {
          app_id: options.appId
        });
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window, 'Intercom');
      });

      it('should call boot first and update subsequently', function(){
        analytics.identify('id', {}, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          user_hash: 'x'
        });

        analytics.identify('id', {}, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'update', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          user_hash: 'x'
        });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { email: 'email@example.com' }, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          email: 'email@example.com',
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          user_hash: 'x'
        });
      });

      it('should send user name', function(){
        analytics.identify('id', { name: 'john doe' }, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          name: 'john doe',
          id: 'id',
          user_hash: 'x'
        });
      });

      it('should send first and last as name', function(){
        analytics.identify('id', { firstName: 'john', lastName: 'doe' }, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          firstName: 'john',
          lastName: 'doe',
          name: 'john doe',
          id: 'id',
          user_hash: 'x'
        });
      });

      it('should respect .name, .firstName and .lastName', function(){
        analytics.identify('id', { firstName: 'john', lastName: 'doe', name: 'baz' }, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          firstName: 'john',
          lastName: 'doe',
          name: 'baz',
          id: 'id',
          user_hash: 'x'
        });
      });

      describe('date handling', function(){
        it('should accept `Date` instances', function(){
          var date = new Date();

          analytics.identify('id', {
            created: date,
            company: { created: date }
          }, {
            Intercom: { userHash: 'x' }
          });

          analytics.called(window.Intercom, 'boot', {
            app_id: options.appId,
            user_id: 'id',
            created_at: Math.floor(date / 1000),
            company: { created_at: Math.floor(date / 1000) },
            id: 'id',
            user_hash: 'x'
          });
        });

        it('should handle ISO datestrings', function(){
          var date = new Date();
          var isoDate = date.toISOString();
          var unixDate = Math.floor(date / 1000);

          analytics.identify('12345', {
            createdAt: isoDate,
            company: { created: isoDate }
          }, {
            Intercom: { userHash: 'x' }
          });

          analytics.called(window.Intercom, 'boot', {
            app_id: options.appId,
            user_id: '12345',
            created_at: unixDate,
            company: { created_at: unixDate },
            id: '12345',
            user_hash: 'x'
          });
        });

        it('should accept Unix timestamps (in seconds)', function(){
          var date = Math.floor(new Date().getTime() / 1000);

          analytics.identify('12345', {
            createdAt: date,
            company: { created: date }
          }, {
            Intercom: { userHash: 'x' }
          });

          analytics.called(window.Intercom, 'boot', {
            app_id: options.appId,
            user_id: '12345',
            created_at: date,
            company: { created_at: date },
            id: '12345',
            user_hash: 'x'
          });
        });

        it('should accept Unix timestamps (in milliseconds)', function(){
          var date = new Date().getTime();

          analytics.identify('12345', {
            createdAt: date,
            company: { created: date }
          }, {
            Intercom: { userHash: 'x' }
          });

          analytics.called(window.Intercom, 'boot', {
            app_id: options.appId,
            user_id: '12345',
            created_at: Math.floor(date / 1000),
            company: { created_at: Math.floor(date / 1000) },
            id: '12345',
            user_hash: 'x'
          });
        });
      });

      it('should fail without passing a user hash', function(){
        analytics.identify('id');
        analytics.didNotCall(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id'
        });
      });

      it('should allow passing increments', function(){
        analytics.identify('id', {}, {
          Intercom: {
            increments: { number: 42 },
            userHash: 'x'
          }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          increments: { number: 42 },
          id: 'id',
          user_hash: 'x'
        });
      });

      it('should send widget settings if the activator isnt the default one.', function(){
        intercom.options.activator = '#my-widget';
        analytics.identify('id', {}, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          user_hash: 'x',
          widget: {
            activator: '#my-widget'
          }
        });
      });

      it('should not send activator if its the default one.', function(){
        analytics.identify('id', {}, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          user_hash: 'x'
        });
      });

      it('should not fail when the company trait is a string', function(){
        analytics.identify('id', { company: 'string' }, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          user_hash: 'x'
        });
      });

      it('should not fail when the company trait is a number', function(){
        analytics.identify('id', { company: 97 }, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          user_hash: 'x'
        });
      });

      it('should carry over company traits set in group if a company trait exists', function(){
        analytics.group().traits({ foo: 'bar' });
        analytics.identify('id', { company: { name: 'name' }}, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          user_hash: 'x',
          company: {
            name: 'name',
            foo: 'bar'
          }
        });
      });
    });

    describe('#group', function(){
      beforeEach(function(){
        analytics.stub(window, 'Intercom');
      });

      it('should send an id', function(){
        analytics.group('id');
        analytics.called(window.Intercom, 'update', { company: { id: 'id' }});
      });

      it('should send an id and properties', function(){
        analytics.group('id', { name: 'Name' });
        analytics.called(window.Intercom, 'update', {
          company: {
            id: 'id',
            name: 'Name'
          }
        });
      });

      it('should work with .created_at', function(){
        analytics.group('id', { name: 'Name', createdAt: 'Jan 1, 2000 3:32:33 PM' });
        analytics.called(window.Intercom, 'update', {
          company: {
            id: 'id',
            name: 'Name',
            created_at: 'Jan 1, 2000 3:32:33 PM'
          }
        });
      });

      it('should work with .created', function(){
        analytics.group('id', { name: 'Name', created: 'Jan 1, 2000 3:32:33 PM' });
        analytics.called(window.Intercom, 'update', {
          company: {
            id: 'id',
            name: 'Name',
            created_at: 'Jan 1, 2000 3:32:33 PM'
          }
        });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window, 'Intercom');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.Intercom, 'trackEvent', 'event', {});
      });
    });
  });
});
