
describe('Mixpanel', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var iso = require('to-iso-string');
  var Mixpanel = require('integrations/lib/mixpanel');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var equal = require('equals');
  var iso = require('to-iso-string');

  var mixpanel;
  var settings = {
    token: 'x'
  };

  beforeEach(function () {
    analytics.use(Mixpanel);
    mixpanel = new Mixpanel.Integration(settings);
  });

  afterEach(function () {
    mixpanel.reset();
  });

  it('should have the right settings', function () {
    test(mixpanel)
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

  describe('#initialize', function () {
    beforeEach(function () {
      mixpanel.load = sinon.spy();
    });

    it('should create window.mixpanel', function () {
      assert(!window.mixpanel);
      mixpanel.initialize();
      assert(window.mixpanel);
    });

    it('should call #load', function () {
      mixpanel.initialize();
      assert(mixpanel.load.called);
    });

    it('should lowercase increments', function(){
      mixpanel.options.increments = ['A', 'b', 'c_'];
      mixpanel.initialize();
      assert(equal(mixpanel.options.increments, ['a', 'b', 'c_']));
    })
  });

  describe('#loaded', function () {
    it('should test window.mixpanel.config', function () {
      window.mixpanel = {};
      assert(!mixpanel.loaded());
      window.mixpanel.config = {};
      assert(mixpanel.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(mixpanel, 'load');
      mixpanel.initialize();
      mixpanel.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!mixpanel.loaded());
      mixpanel.load(function (err) {
        if (err) return done(err);
        assert(mixpanel.loaded());
        done();
      });
    });
  });

  describe('#page', function () {
    beforeEach(function () {
      mixpanel.initialize();
      window.mixpanel.track = sinon.spy();
    });

    it('should not track anonymous pages by default', function () {
      test(mixpanel).page();
      assert(!window.mixpanel.track.called);
    });

    it('should track anonymous pages when the option is on', function () {
      mixpanel.options.trackAllPages = true;
      test(mixpanel).page();
      assert(window.mixpanel.track.calledWith('Loaded a Page'));
    });

    it('should track named pages by default', function () {
      test(mixpanel).page(null, 'Name');
      assert(window.mixpanel.track.calledWith('Viewed Name Page'));
    });

    it('should track named pages with categories', function () {
      test(mixpanel).page('Category', 'Name');
      assert(window.mixpanel.track.calledWith('Viewed Category Name Page'));
    });

    it('should track categorized pages by default', function () {
      test(mixpanel).page('Category', 'Name');
      assert(window.mixpanel.track.calledWith('Viewed Category Page'));
    });

    it('should not track category pages when the option is off', function () {
      mixpanel.options.trackNamedPages = false;
      mixpanel.options.trackCategorizedPages = false;
      test(mixpanel).page(null, 'Name');
      test(mixpanel).page('Category', 'Name');
      assert(!window.mixpanel.track.called);
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      mixpanel.initialize();
      window.mixpanel.identify = sinon.spy();
      window.mixpanel.register = sinon.spy();
      window.mixpanel.name_tag = sinon.spy();
      window.mixpanel.people.set = sinon.spy();
    });

    it('should send an id', function () {
      test(mixpanel)
        .identify('id')
        .called(window.mixpanel.identify)
        .with('id')
        .called(window.mixpanel.register)
        .with({ id: 'id' });
    });

    it('should send traits', function () {
      test(mixpanel)
        .identify(null, { trait: true })
        .called(window.mixpanel.register)
        .with({ trait: true });
    });

    it('should send an id and traits', function () {
      test(mixpanel)
        .identify('id', { trait: true })
        .called(window.mixpanel.identify)
        .with('id')
        .called(window.mixpanel.register)
        .with({ trait: true, id: 'id' });
    });

    it('should use an id as a name tag', function () {
      test(mixpanel)
        .identify('id')
        .called(window.mixpanel.name_tag)
        .with('id');
    });

    it('should prefer a username as a name tag', function () {
      test(mixpanel)
        .identify('id', { username: 'username' })
        .called(window.mixpanel.name_tag)
        .with('username');
    });

    it('should prefer an email as a name tag', function () {
      test(mixpanel).identify('id', {
        username: 'username',
        email: 'name@example.com'
      });
      assert(window.mixpanel.name_tag.calledWith('name@example.com'));
    });

    it('should send traits to Mixpanel People', function () {
      mixpanel.options.people = true;
      test(mixpanel).identify(null, { trait: true });
      assert(window.mixpanel.people.set.calledWith({ trait: true }));
    });

    it('should alias traits', function () {
      var date = new Date();
      test(mixpanel).identify(null, {
        created: date,
        email: 'name@example.com',
        firstName: 'first',
        lastName: 'last',
        lastSeen: date,
        name: 'name',
        username: 'username',
        phone: 'phone'
      });
      assert(window.mixpanel.register.calledWith({
        $created: date,
        $email: 'name@example.com',
        $first_name: 'first',
        $last_name: 'last',
        $last_seen: date,
        $name: 'name',
        $username: 'username',
        $phone: 'phone'
      }));
    });

    it('should alias traits to Mixpanel People', function () {
      mixpanel.options.people = true;
      var date = new Date();
      test(mixpanel).identify(null, {
        created: date,
        email: 'name@example.com',
        firstName: 'first',
        lastName: 'last',
        lastSeen: date,
        name: 'name',
        username: 'username',
        phone: 'phone'
      });
      assert(window.mixpanel.people.set.calledWith({
        $created: date,
        $email: 'name@example.com',
        $first_name: 'first',
        $last_name: 'last',
        $last_seen: date,
        $name: 'name',
        $username: 'username',
        $phone: 'phone'
      }));
    });

    it('should remove .created_at', function(){
      mixpanel.options.people = true;
      var date = new Date();
      test(mixpanel).identify(null, {
        created_at: date,
        email: 'name@example.com',
        firstName: 'first',
        lastName: 'last',
        lastSeen: date,
        name: 'name',
        username: 'username',
        phone: 'phone'
      });
      assert(window.mixpanel.people.set.calledWith({
        $created: date,
        $email: 'name@example.com',
        $first_name: 'first',
        $last_name: 'last',
        $last_seen: date,
        $name: 'name',
        $username: 'username',
        $phone: 'phone'
      }));
    })
  });

  describe('#track', function () {
    beforeEach(function () {
      mixpanel.initialize();
      window.mixpanel.track = sinon.spy();
      window.mixpanel.people.increment = sinon.spy();
      window.mixpanel.people.set = sinon.spy();
      window.mixpanel.people.track_charge = sinon.spy();
    });

    it('should send an event', function () {
      test(mixpanel).track('event');
      assert(window.mixpanel.track.calledWith('event'));
    });

    it('should send an event and properties', function () {
      test(mixpanel).track('event', { property: true });
      assert(window.mixpanel.track.calledWith('event', { property: true }));
    });

    it('should send a revenue property to Mixpanel People', function () {
      mixpanel.options.people = true;
      test(mixpanel).track('event', { revenue: 9.99 });
      assert(window.mixpanel.people.track_charge.calledWith(9.99));
    });

    it('should convert dates to iso strings', function () {
      var date = new Date();
      test(mixpanel).track('event', { date: date });
      assert(window.mixpanel.track.calledWith('event', { date: iso(date) }));
    });

    it('should increment events that are in .increments option', function(){
      mixpanel.options.increments = [0, 'my event', 1];
      mixpanel.options.people = true;
      test(mixpanel).track('my event');
      assert(window.mixpanel.people.increment.calledWith('my event'));
    })

    it('should should update people property if the event is in .increments', function(){
      mixpanel.options.increments = ['event'];
      mixpanel.options.people = true;
      test(mixpanel).track('event');
      assert(window.mixpanel.people.increment.calledWith('event'));
      assert(window.mixpanel.people.set.calledWith('Last event', new Date));
    })

    it('should remove mixpanel\'s reserved properties', function(){
      test(mixpanel).track('event', {
        distinct_id: 'string',
        ip: 'string',
        mp_name_tag: 'string',
        mp_note: 'string',
        token: 'string'
      });
      assert(window.mixpanel.track.calledWith('event', {}));
    });
  });

  describe('#alias', function () {
    beforeEach(function () {
      mixpanel.initialize();
      window.mixpanel.alias = sinon.spy();
    });

    it('should send a new id', function () {
      test(mixpanel).alias('new');
      assert(window.mixpanel.alias.calledWith('new'));
    });

    it('should send a new and old id', function () {
      test(mixpanel).alias('new', 'old');
      assert(window.mixpanel.alias.calledWith('new', 'old'));
    });
  });

});
