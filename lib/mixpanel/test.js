
var tester = require('analytics.js-integration-tester');
var analytics = require('analytics.js');
var iso = require('to-iso-string');
var Mixpanel = require('./index');
var assert = require('assert');
var equal = require('equals');
var sinon = require('sinon');

describe('Mixpanel', function(){
  var mixpanel;
  var test;
  var settings = {
    token: 'x'
  };

  beforeEach(function(){
    analytics.use(Mixpanel);
    mixpanel = new Mixpanel.Integration(settings);
    test = tester(mixpanel);
  });

  afterEach(function(){
    test.reset();
  });

  it('should have the right settings', function(){
    test
      .name('Mixpanel')
      .readyOnLoad()
      .global('mixpanel')
      .option('cookieName', '')
      .option('nameTag', true)
      .option('pageview', false)
      .option('people', false)
      .option('token', '')
      .option('trackAllPages', false)
      .option('trackNamedPages', true);
  });

  describe('#initialize', function(){
    it('should create window.mixpanel', function(){
      assert(!window.mixpanel);
      test.initialize();
      assert(window.mixpanel);
    });

    it('should call #load', function(){
      test
        .initialize()
        .called(mixpanel.load);
    });

    it('should lowercase increments', function(){
      test
        .option('increments', ['A', 'b', 'c_'])
        .initialize()
        .deepEqual(mixpanel.options.increments, ['a', 'b', 'c_']);
    });
  });

  describe('#loaded', function(){
    it('should test window.mixpanel.config', function(){
      window.mixpanel = {};
      assert(!test.loaded());
      window.mixpanel.config = {};
      assert(test.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      test.initialize();
      test.load.restore();
    });

    it('should change loaded state', function(done){
      assert(!test.loaded());
      test.load(function(err){
        if (err) return done(err);
        assert(test.loaded());
        done();
      });
    });
  });

  describe('#page', function(){
    beforeEach(function(){
      test
        .initialize()
        .spy(window.mixpanel, 'track');
    });

    it('should not track anonymous pages by default', function(){
      test
        .page()
        .didntCall(window.mixpanel.track);
    });

    it('should track anonymous pages when the option is on', function(){
      test
        .option('trackAllPages', true)
        .page()
        .called(window.mixpanel.track, 'Loaded a Page');
    });

    it('should track named pages by default', function(){
      test
        .page(null, 'Name')
        .called(window.mixpanel.track, 'Viewed Name Page');
    });

    it('should track named pages with categories', function(){
      test
        .page('Category', 'Name')
        .called(window.mixpanel.track, 'Viewed Category Name Page');
    });

    it('should track categorized pages by default', function(){
      test
        .page('Category', 'Name')
        .called(window.mixpanel.track, 'Viewed Category Page');
    });

    it('should not track category pages when the option is off', function(){
      test
        .option('trackNamedPages', false)
        .option('trackCategorizedPages', false);
        .page(null, 'Name')
        .page('Category', 'Name')
        .didntCall(window.mixpanel.track);
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      test
        .initialize()
        .spy(window.mixpanel, 'identify')
        .spy(window.mixpanel, 'register')
        .spy(window.mixpanel, 'name_tag')
        .spy(window.mixpanel, 'people.set');
    });

    it('should send an id', function(){
      test
        .identify('id')
        .called(window.mixpanel.identify, 'id')
        .called(window.mixpanel.register, { id: 'id' });
    });

    it('should send traits', function(){
      test
        .identify(null, { trait: true })
        .called(window.mixpanel.register, { trait: true });
    });

    it('should send an id and traits', function(){
      test
        .identify('id', { trait: true })
        .called(window.mixpanel.identify, 'id')
        .called(window.mixpanel.register, { trait: true, id: 'id' });
    });

    it('should use an id as a name tag', function(){
      test
        .identify('id')
        .called(window.mixpanel.name_tag, 'id');
    });

    it('should prefer a username as a name tag', function(){
      test
        .identify('id', { username: 'username' })
        .called(window.mixpanel.name_tag, 'username');
    });

    it('should prefer an email as a name tag', function(){
      test
        .identify('id', {
          username: 'username',
          email: 'name@example.com'
        })
        .called(window.mixpanel.name_tag, 'name@example.com');
    });

    it('should send traits to Mixpanel People', function(){
      test
        .option('people', true)
        .identify(null, { trait: true })
        .called(window.mixpanel.people.set, { trait: true });
    });

    it('should alias traits', function(){
      var date = new Date();
      test
        .identify(null, {
          created: date,
          email: 'name@example.com',
          firstName: 'first',
          lastName: 'last',
          lastSeen: date,
          name: 'name',
          username: 'username',
          phone: 'phone'
        })
        .called(window.mixpanel.register, {
          $created: date,
          $email: 'name@example.com',
          $first_name: 'first',
          $last_name: 'last',
          $last_seen: date,
          $name: 'name',
          $username: 'username',
          $phone: 'phone'
        });
    });

    it('should alias traits to Mixpanel People', function(){
      var date = new Date();
      test
        .option('people', true)
        .identify(null, {
          created: date,
          email: 'name@example.com',
          firstName: 'first',
          lastName: 'last',
          lastSeen: date,
          name: 'name',
          username: 'username',
          phone: 'phone'
        })
        .called(window.mixpanel.people.set, {
          $created: date,
          $email: 'name@example.com',
          $first_name: 'first',
          $last_name: 'last',
          $last_seen: date,
          $name: 'name',
          $username: 'username',
          $phone: 'phone'
        });
    });

    it('should remove .created_at', function(){
      var date = new Date();
      test
        .option('people', true)
        .identify(null, {
          created_at: date,
          email: 'name@example.com',
          firstName: 'first',
          lastName: 'last',
          lastSeen: date,
          name: 'name',
          username: 'username',
          phone: 'phone'
        })
        .called(window.mixpanel.people.set, {
          $created: date,
          $email: 'name@example.com',
          $first_name: 'first',
          $last_name: 'last',
          $last_seen: date,
          $name: 'name',
          $username: 'username',
          $phone: 'phone'
        });
    });
  });

  describe('#track', function(){
    beforeEach(function(){
      test
        .initialize()
        .spy(window.mixpanel, 'track')
        .spy(window.mixpanel, 'people.increment')
        .spy(window.mixpanel, 'people.set')
        .spy(window.mixpanel, 'people.track_charge');
    });

    it('should send an event', function(){
      test
        .track('event')
        .called(window.mixpanel.track, 'event');
    });

    it('should send an event and properties', function(){
      test
        .track('event', { property: true })
        .called(window.mixpanel.track, 'event', { property: true });
    });

    it('should send a revenue property to Mixpanel People', function(){
      test
        .option('people', true)
        .track('event', { revenue: 9.99 })
        .called(window.mixpanel.people.track_charge, 9.99);
    });

    it('should convert dates to iso strings', function(){
      var date = new Date();
      test
        .track('event', { date: date })
        .called(window.mixpanel.track, 'event', { date: iso(date) });
    });

    it('should increment events that are in .increments option', function(){
      test
        .option('increments', [0, 'my event', 1])
        .option('people', true)
        .track('my event')
        .called(window.mixpanel.people.increment, 'my event');
    })

    it('should should update people property if the event is in .increments', function(){
      test
        .option('increments', ['event'])
        .option('people', true)
        .track('event')
        .called(window.mixpanel.people.increment, 'event')
        .called(window.mixpanel.people.set, 'Last event', new Date);
    })

    it('should remove mixpanel\'s reserved properties', function(){
      test
        .track('event', {
          distinct_id: 'string',
          ip: 'string',
          mp_name_tag: 'string',
          mp_note: 'string',
          token: 'string'
        })
        .called(window.mixpanel.track, 'event', {});
    });
  });

  describe('#alias', function(){
    beforeEach(function(){
      test
        .initialize()
        .spy(window.mixpanel, 'alias');
    });

    it('should send a new id', function(){
      test
        .alias('new')
        .called(window.mixpanel.alias, 'new');
    });

    it('should send a new and old id', function(){
      test
        .alias('new', 'old')
        .called(window.mixpanel.alias, 'new', 'old');
    });
  });
});