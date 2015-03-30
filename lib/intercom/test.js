
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
    analytics = new Analytics;
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
      .assumesPageview()
      .global('Intercom')
      .option('activator', '#IntercomDefaultWidget')
      .option('appId', '')
      .option('inbox', false));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(intercom, 'load');
    });

    describe('#initialize', function(){
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
      analytics.page();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window, 'Intercom');
      });

      it('should call update on subsequent pageviews', function(){
        analytics.page();
        analytics.called(window.Intercom, 'update');
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window, 'Intercom');
      });

      it('should call boot the first time and update the second', function(){
        analytics.identify('id');
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id'
        });

        analytics.identify('id');
        analytics.called(window.Intercom, 'update', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id'
        });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { email: 'tony@starkindustries.com' });
        analytics.called(window.Intercom, 'boot', {
          email: 'tony@starkindustries.com',
          app_id: options.appId,
          user_id: 'id',
          id: 'id'
        });
      });

      it('should send user name', function(){
        analytics.identify('id', { name: 'Tony Stark' });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          name: 'Tony Stark',
          id: 'id'
        });
      });

      it('should send first and last as name', function(){
        analytics.identify('id', { firstName: 'Tony', lastName: 'Stark' });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          firstName: 'Tony',
          lastName: 'Stark',
          name: 'Tony Stark',
          id: 'id'
        });
      });

      it('should respect .name, .firstName and .lastName', function(){
        analytics.identify('id', { firstName: 'Tony', lastName: 'Stark', name: 'baz' });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          firstName: 'Tony',
          lastName: 'Stark',
          name: 'baz',
          id: 'id'
        });
      });

      describe('date handling', function(){
        it('should accept `Date` instances', function(){
          var date = new Date();

          analytics.identify('id', {
            created: date,
            company: { name: 'Stark Industries', created: date }
          });

          analytics.called(window.Intercom, 'boot', {
            id: 'id',
            app_id: options.appId,
            user_id: 'id',
            signed_up_at: Math.floor(date / 1000),
            companies: [{ name: 'Stark Industries', remote_created_at: Math.floor(date / 1000) }]
          });
        });

        it('should handle ISO datestrings', function(){
          var date = new Date();
          var isoDate = date.toISOString();
          var unixDate = Math.floor(date / 1000);

          analytics.identify('12345', {
            createdAt: isoDate,
            company: { name: 'Stark Industries', created: isoDate }
          });

          analytics.called(window.Intercom, 'boot', {
            app_id: options.appId,
            user_id: '12345',
            signed_up_at: unixDate,
            companies: [{ name: 'Stark Industries', remote_created_at: unixDate }],
            id: '12345'
          });
        });

        it('should accept Unix timestamps (in seconds)', function(){
          var date = Math.floor(new Date().getTime() / 1000);

          analytics.identify('12345', {
            createdAt: date,
            company: { name: 'Stark Industries', created: date }
          });

          analytics.called(window.Intercom, 'boot', {
            app_id: options.appId,
            user_id: '12345',
            signed_up_at: date,
            companies: [{ name: 'Stark Industries', remote_created_at: date }],
            id: '12345'
          });
        });

        it('should accept Unix timestamps (in milliseconds)', function(){
          var date = new Date().getTime();

          analytics.identify('12345', {
            createdAt: date,
            company: { name: 'Stark Industries', created: date }
          });

          analytics.called(window.Intercom, 'boot', {
            app_id: options.appId,
            user_id: '12345',
            signed_up_at: Math.floor(date / 1000),
            companies: [{ name: 'Stark Industries', remote_created_at: Math.floor(date / 1000) }],
            id: '12345'
          });
        });
      });

      it('should allow passing a user hash', function(){
        analytics.identify('id', {}, {
          Intercom: { userHash: 'x' }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          user_hash: 'x',
          id: 'id'
        });
      });

      it('should allow passing increments', function(){
        analytics.identify('id', {}, {
          Intercom: { increments: { number: 42 } }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          increments: { number: 42 },
          id: 'id'
        });
      });

      it('should send widget settings if the activator isnt the default one.', function(){
        intercom.options.activator = '#my-widget';
        analytics.identify('id');
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          widget: {
            activator: '#my-widget'
          }
        });
      });

      it('should not send activator if its the default one.', function(){
        analytics.identify('id');
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id'
        });
      });

      it('should not fail when the company trait is a string', function(){
        analytics.identify('id', { company: 'Stark Industries' });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          companies: [{ name: 'Stark Industries' }]
        });
      });

      it('should set company id and not generate a new one', function(){
        analytics.identify('id', { company: { name: 'Stark Industries', id: 4017389226 } });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
          companies: [{ name: 'Stark Industries', company_id: 4017389226 }]
        });
      });

      it('should not fail when the company trait is a number', function(){
        analytics.identify('id', { company: 97 });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id'
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
