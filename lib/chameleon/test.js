
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Chameleon = require('./');

var noop = function() {};

describe('Chameleon', function() {
  var analytics;
  var chameleon;
  var options = {
    accountId: 'AvyQ4N2p-FOb5ceEb3w0RT-segment-integration'
  };

  beforeEach(function() {
    analytics = new Analytics();
    chameleon = new Chameleon(options);
    analytics.use(Chameleon);
    analytics.use(tester);
    analytics.add(chameleon);

    analytics.user().anonymousId('anon-id');
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    chameleon.reset();
    analytics.user().reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(Chameleon, integration('Chameleon')
      .assumesPageview()
      .readyOnInitialize()
      .readyOnLoad()
      .global('chmln')
      .option('accountId', null));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.spy(chameleon, 'load');
      analytics.spy(chameleon, 'ready');
    });

    afterEach(function() {
      chameleon.reset();
    });

    describe('#initialize', function() {
      beforeEach(function() {
        analytics.initialize();
        analytics.page();
      });

      it('should load', function() {
        analytics.called(chameleon.load);
      });

      it('should be ready', function() {
        analytics.called(chameleon.ready);
      });
    });
  });

  describe('before loaded', function() {
    beforeEach(function() {
      chameleon.load = noop;
      analytics.initialize();
      analytics.page();
    });

    describe('on identify', function() {
      beforeEach(function() {
        analytics.identify('id');
      });

      it('should store the identify', function() {
        analytics.assert(window.chmln.setup_a[0].length === 1);

        analytics.assert.deepEqual({ uid: 'id' }, window.chmln.setup_a[0][0]);
      });
    });

    describe('on alias', function() {
      describe('with the new id', function() {
        beforeEach(function() {
          analytics.alias('new');
        });

        it('should store the alias', function() {
          analytics.assert(window.chmln.alias_a[0].length === 1);

          analytics.assert.deepEqual({ from: 'anon-id', to: 'new' }, window.chmln.alias_a[0][0]);
        });
      });

      describe('with the both old and new id', function() {
        beforeEach(function() {
          analytics.alias('new', 'old');
        });

        it('should store the alias', function() {
          analytics.assert(window.chmln.alias_a[0].length === 1);

          analytics.assert.deepEqual({ from: 'old', to: 'new' }, window.chmln.alias_a[0][0]);
        });
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(chameleon, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.spy(window.chmln, 'setup');
      });

      it('should setup with the anonymous user id', function() {
        analytics.identify();
        analytics.called(window.chmln.setup, { uid: 'anon-id' });
      });

      it('should setup with the given id', function() {
        analytics.identify('id');
        analytics.called(window.chmln.setup, { uid: 'id' });
      });

      it('should send traits', function() {
        analytics.identify({ trait: true });
        analytics.called(window.chmln.setup, { uid: 'anon-id', trait: true });
      });

      it('should send the given id and traits', function() {
        analytics.identify('id', { trait: true });
        analytics.called(window.chmln.setup, { uid: 'id', trait: true });
      });
    });

    describe('#group', function() {
      beforeEach(function() {
        analytics.stub(window.chmln, 'set');
      });

      it('should send an id', function() {
        analytics.group('id');
        analytics.called(window.chmln.set, { 'group:id': 'id' });
      });

      it('should send traits', function() {
        analytics.group({ trait: true });
        analytics.called(window.chmln.set, { 'group:id': null, 'group:trait': true });
      });

      it('should send an id and traits', function() {
        analytics.group('id', { trait: true });
        analytics.called(window.chmln.set, { 'group:id': 'id', 'group:trait': true });
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window.chmln, 'track');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called(window.chmln.track, 'event');
      });

      it('should send an event and properties', function() {
        analytics.track('event', { property: true });
        analytics.called(window.chmln.track, 'event', { property: true });
      });
    });

    describe('#alias', function() {
      beforeEach(function() {
        analytics.user().anonymousId('anon-id');
        analytics.stub(window.chmln, 'alias');
      });

      it('should send a new id', function() {
        analytics.alias('new');
        analytics.called(window.chmln.alias, { from: 'anon-id', to: 'new' });
      });

      it('should send a new and old id', function() {
        analytics.alias('new', 'old');
        analytics.called(window.chmln.alias, { from: 'old', to: 'new' });
      });
    });
  });
});
