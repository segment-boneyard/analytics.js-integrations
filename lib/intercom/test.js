
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
    appId: '8cf9338df9625cbe6811a16d573a79b0c8a8fa86'
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
        analytics.identify('id', { email: 'email@example.com' });
        analytics.called(window.Intercom, 'boot', {
          email: 'email@example.com',
          app_id: options.appId,
          user_id: 'id',
          id: 'id'
        });
      });

      it('should send user name', function(){
        analytics.identify('id', { name: 'john doe' });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          name: 'john doe',
          id: 'id'
        });
      });

      it('should send first and last as name', function(){
        analytics.identify('id', { firstName: 'john', lastName: 'doe' });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          firstName: 'john',
          lastName: 'doe',
          name: 'john doe',
          id: 'id'
        });
      });

      it('should respect .name, .firstName and .lastName', function(){
        analytics.identify('id', { firstName: 'john', lastName: 'doe', name: 'baz' });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          firstName: 'john',
          lastName: 'doe',
          name: 'baz',
          id: 'id'
        });
      });

      it('should send created_at as seconds', function(){
        var now = new Date;
        analytics.identify('id', { created: now });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          created_at: Math.floor(now.getTime() / 1000),
          user_id: 'id',
          id: 'id'
        });
      });

      it('should convert dates', function(){
        var date = new Date();
        analytics.identify('id', {
          created: date,
          company: { created: date }
        });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          created_at: Math.floor(date / 1000),
          company: { created_at: Math.floor(date / 1000) },
          id: 'id'
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

      it('should not fail when the company trait is a string', function () {
        analytics.identify('id', { company: 'string' });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id'
        });
      });

      it('should not fail when the company trait is a number', function () {
        analytics.identify('id', { company: 97 });
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id'
        });
      });

      it('should carry over company traits set in group if a company trait exists', function() {
        analytics.group().traits({ foo: 'bar' });
        analytics.identify('id', { company: { name: 'name' }});
        analytics.called(window.Intercom, 'boot', {
          app_id: options.appId,
          user_id: 'id',
          id: 'id',
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