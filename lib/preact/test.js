
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Preact', function(){
  var Preact = plugin;
  var preact;
  var analytics;
  var options = {
    projectCode: 'x'
  };

  beforeEach(function(){
    analytics = new Analytics;
    preact = new Preact(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(preact);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    preact.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Preact, integration('Preact')
      .assumesPageview()
      .global('_lnq')
      .option('projectCode', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(preact, 'load');
    });

    describe('#initialize', function(){
      it('should push _setCode onto the window._lnq object', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._lnq[0], ['_setCode', options.projectCode]);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(preact.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(preact, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._lnq, 'push');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window._lnq.push, ['_setPersonData', {
          properties: { id: 'id' },
          email: undefined,
          name: undefined,
          uid: 'id',
        }]);
      });

      it('shouldnt send just traits', function(){
        analytics.identify({ trait: true });
        analytics.didNotCall(window._lnq.push);
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window._lnq.push, ['_setPersonData', {
          properties: { trait: true, id: 'id' },
          email: undefined,
          name: undefined,
          uid: 'id',
        }]);
      });

      it('should send an email', function(){
        analytics.identify('id', { email: 'name@example.com' });
        analytics.called(window._lnq.push, ['_setPersonData', {
          properties: { email: 'name@example.com', id: 'id' },
          email: 'name@example.com',
          name: undefined,
          uid: 'id',
        }]);
      });

      it('should send a name', function(){
        analytics.identify('id', { name: 'name' });
        analytics.called(window._lnq.push, ['_setPersonData', {
          properties: { name: 'name', id: 'id' },
          email: undefined,
          name: 'name',
          uid: 'id',
        }]);
      });
    });

    describe('#group', function(){
      beforeEach(function(){
        analytics.stub(window._lnq, 'push');
      });

      it('should send an id', function(){
        analytics.group('id');
        analytics.called(window._lnq.push, ['_setAccount', { id: 'id' }]);
      });

      it('should send an id and properties', function(){
        analytics.group('id', { property: true });
        analytics.called(window._lnq.push, ['_setAccount', {
          id: 'id',
          property: true
        }]);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._lnq, 'push');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window._lnq.push, ['_logEvent', { name: 'event' }, {}]);
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window._lnq.push, ['_logEvent', { name: 'event' }, { property: true }]);
      });

      it('should special case a revenue property', function(){
        analytics.track('event', { revenue: 9.99 });
        analytics.called(window._lnq.push, ['_logEvent', {
          name: 'event',
          revenue: 999
        }, {}]);
      });

      it('should special case a note property', function(){
        analytics.track('event', { note: 'note' });
        analytics.called(window._lnq.push, ['_logEvent', {
          name: 'event',
          note: 'note'
        }, {}]);
      });
    });
  });
});