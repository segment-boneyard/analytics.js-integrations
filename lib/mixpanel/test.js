
var integration = require('analytics.js-integration');
var Analytics = require('analytics.js').constructor;
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');
var iso = require('to-iso-string');

describe('Mixpanel', function(){
  var Mixpanel = plugin;
  var mixpanel;
  var analytics;
  var options = {
    token: 'x',
    cookieName: 'y',
    crossSubdomainCookie: true,
    secureCookie: true
  };

  beforeEach(function(){
    analytics = new Analytics;
    mixpanel = new Mixpanel(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(mixpanel);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    mixpanel.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Mixpanel, integration('Mixpanel')
      .global('mixpanel')
      .option('token', '')
      .option('crossSubdomainCookie', false)
      .option('secureCookie', false)
      .option('nameTag', true)
      .option('pageview', false)
      .option('people', false)
      .option('token', '')
      .option('trackAllPages', false)
      .option('trackNamedPages', true));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(mixpanel, 'load');
    });

    describe('#initialize', function(){
      it('should create window.mixpanel', function(){
        analytics.assert(!window.mixpanel);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.mixpanel);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(mixpanel.load);
      });

      it('should lowercase increments', function(){
        mixpanel.options.increments = ['A', 'b', 'c_'];
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(mixpanel.options.increments, ['a', 'b', 'c_']);
      })
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(mixpanel, done);
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
        analytics.stub(window.mixpanel, 'track');
      });

      it('should not track anonymous pages by default', function(){
        analytics.page();
        analytics.didNotCall(window.mixpanel.track);
      });

      it('should track anonymous pages when the option is on', function(){
        mixpanel.options.trackAllPages = true;
        analytics.page();
        analytics.called(window.mixpanel.track, 'Loaded a Page');
      });

      it('should track named pages by default', function(){
        analytics.page('Name');
        analytics.called(window.mixpanel.track, 'Viewed Name Page');
      });

      it('should track named pages with categories', function(){
        analytics.page('Category', 'Name');
        analytics.called(window.mixpanel.track, 'Viewed Category Name Page');
      });

      it('should track categorized pages by default', function(){
        analytics.page('Category', 'Name');
        analytics.called(window.mixpanel.track, 'Viewed Category Page');
      });

      it('should not track category pages when the option is off', function(){
        mixpanel.options.trackNamedPages = false;
        mixpanel.options.trackCategorizedPages = false;
        analytics.page('Name');
        analytics.page('Category', 'Name');
        analytics.didNotCall(window.mixpanel.track);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.mixpanel, 'identify');
        analytics.stub(window.mixpanel, 'register');
        analytics.stub(window.mixpanel, 'name_tag');
        analytics.stub(window.mixpanel.people, 'set');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.mixpanel.identify, 'id');
        analytics.called(window.mixpanel.register, { id: 'id' });
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        analytics.called(window.mixpanel.register, { trait: true });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.mixpanel.identify, 'id');
        analytics.called(window.mixpanel.register, { trait: true, id: 'id' });
      });

      it('should use an id as a name tag', function(){
        analytics.identify('id');
        analytics.called(window.mixpanel.name_tag, 'id');
      });

      it('should prefer a username as a name tag', function(){
        analytics.identify('id', { username: 'username' });
        analytics.called(window.mixpanel.name_tag, 'username');
      });

      it('should prefer an email as a name tag', function(){
        analytics.identify('id', {
          username: 'username',
          email: 'name@example.com'
        });
        analytics.called(window.mixpanel.name_tag, 'name@example.com');
      });

      it('should send traits to Mixpanel People', function(){
        mixpanel.options.people = true;
        analytics.identify('id', { trait: true });
        analytics.called(window.mixpanel.people.set, { id: 'id', trait: true });
      });

      it('should alias traits', function(){
        var date = new Date();
        analytics.identify({
          created: date,
          email: 'name@example.com',
          firstName: 'first',
          lastName: 'last',
          lastSeen: date,
          name: 'name',
          username: 'username',
          phone: 'phone'
        });
        analytics.called(window.mixpanel.register, {
          $created: iso(date),
          $email: 'name@example.com',
          $first_name: 'first',
          $last_name: 'last',
          $last_seen: iso(date),
          $name: 'name',
          $username: 'username',
          $phone: 'phone'
        });
      });

      it('should alias traits to Mixpanel People', function(){
        mixpanel.options.people = true;
        var date = new Date();
        analytics.identify('id', {
          created: date,
          email: 'name@example.com',
          firstName: 'first',
          lastName: 'last',
          lastSeen: date,
          name: 'name',
          username: 'username',
          phone: 'phone'
        });
        analytics.called(window.mixpanel.people.set, {
          $created: date,
          $email: 'name@example.com',
          $first_name: 'first',
          $last_name: 'last',
          $last_seen: date,
          $name: 'name',
          $username: 'username',
          $phone: 'phone',
          id: 'id'
        });
      });

      it('should remove .created_at', function(){
        mixpanel.options.people = true;
        var date = new Date();
        analytics.identify('id', {
          created_at: date,
          email: 'name@example.com',
          firstName: 'first',
          lastName: 'last',
          lastSeen: date,
          name: 'name',
          username: 'username',
          phone: 'phone'
        });
        analytics.called(window.mixpanel.people.set, {
          $created: date,
          $email: 'name@example.com',
          $first_name: 'first',
          $last_name: 'last',
          $last_seen: date,
          $name: 'name',
          $username: 'username',
          $phone: 'phone',
          id: 'id'
        });
      })
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.mixpanel, 'track');
        analytics.stub(window.mixpanel.people, 'increment');
        analytics.stub(window.mixpanel.people, 'set');
        analytics.stub(window.mixpanel.people, 'track_charge');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.mixpanel.track, 'event');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window.mixpanel.track, 'event', { property: true });
      });

      it('should send a revenue property to Mixpanel People', function(){
        mixpanel.options.people = true;
        analytics.track('event', { revenue: 9.99 });
        analytics.called(window.mixpanel.people.track_charge, 9.99);
      });

      it('should convert dates to iso strings', function(){
        var date = new Date();
        analytics.track('event', { date: date });
        analytics.called(window.mixpanel.track, 'event', { date: iso(date) });
      });

      it('should increment events that are in .increments option', function(){
        mixpanel.options.increments = [0, 'my event', 1];
        mixpanel.options.people = true;
        analytics.track('my event');
        analytics.called(window.mixpanel.people.increment, 'my event');
      });

      it('should should update people property if the event is in .increments', function(){
        mixpanel.options.increments = ['event'];
        mixpanel.options.people = true;
        analytics.track('event');
        var date = window.mixpanel.people.set.args[0][1];
        analytics.assert(date.getTime() == new Date().getTime());
        analytics.called(window.mixpanel.people.increment, 'event');
        analytics.called(window.mixpanel.people.set, 'Last event', date);
      });

      it('should not convert arrays of simple types', function(){
        analytics.track('event', { array: ['a', 'b', 'c'] });
        analytics.called(window.mixpanel.track, 'event', { array: ['a', 'b', 'c'] });
        analytics.track('event', { array: [13, 28, 99] });
        analytics.called(window.mixpanel.track, 'event', { array: [13, 28, 99] });
      });

      it('should convert arrays of objects to lengths', function(){
        analytics.track('event', { array: [{ a: 'asdf' }, { b: 'geasd' }, { c: 'asfee' }] });
        analytics.called(window.mixpanel.track, 'event', { array: 3 });
      });

      it('should remove mixpanel\'s reserved properties', function(){
        analytics.track('event', {
          distinct_id: 'string',
          ip: 'string',
          mp_name_tag: 'string',
          mp_note: 'string',
          token: 'string'
        });
        analytics.called(window.mixpanel.track, 'event', {});
      });
    });

    describe('#alias', function(){
      beforeEach(function(){
        analytics.stub(window.mixpanel, 'alias');
      });

      it('should send a new id', function(){
        analytics.alias('new');
        analytics.called(window.mixpanel.alias, 'new');
      });

      it('should send a new and old id', function(){
        analytics.alias('new', 'old');
        analytics.called(window.mixpanel.alias, 'new', 'old');
      });
    });
  });
});
