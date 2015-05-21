
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var CustomerIO = require('./');

describe('Customer.io', function(){
  var analytics;
  var customerIO;
  var options = {
    siteId: '1e5932b3d9de5078ccf9'
  };

  beforeEach(function(){
    analytics = new Analytics();
    customerIO = new CustomerIO(options);
    analytics.use(CustomerIO);
    analytics.use(tester);
    analytics.add(customerIO);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    customerIO.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(CustomerIO, integration('Customer.io')
      .global('_cio')
      .option('siteId', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(customerIO, 'load');
    });

    describe('#initialize', function(){
      it('should create the window._cio object', function(){
        analytics.assert(!window._cio);
        analytics.initialize();
        analytics.assert(window._cio);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.called(customerIO.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(customerIO, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._cio, 'identify');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window._cio.identify, { id: 'id' });
      });

      it('should not send only traits', function(){
        analytics.identify({ trait: true });
        analytics.didNotCall(window._cio.identify);
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true, email: 'blackwidow@shield.gov' });
        analytics.called(window._cio.identify, { id: 'id', trait: true, email: 'blackwidow@shield.gov' });
      });

      it('should convert dates to unix timestamps', function(){
        var date = new Date();
        analytics.identify('id', { date: date });
        analytics.called(window._cio.identify, {
          id: 'id',
          date: Math.floor(date / 1000)
        });
      });

      it('should alias created to created_at', function(){
        var date = new Date();
        analytics.identify('id', { created: date });
        analytics.called(window._cio.identify, {
          id: 'id',
          created_at: Math.floor(date / 1000)
        });
      });
    });

    describe('#group', function(){
      beforeEach(function(){
        analytics.user().identify('id');
        analytics.stub(window._cio, 'identify');
      });

      it('should send an id', function(){
        analytics.group('id');
        analytics.called(window._cio.identify, {
          id: 'id',
          'Group id': 'id'
        });
      });

      it('should send traits', function(){
        analytics.group({ trait: true });
        analytics.called(window._cio.identify, {
          id: 'id',
          'Group trait': true
        });
      });

      it('should send an id and traits', function(){
        analytics.group('id', { trait: true });
        analytics.called(window._cio.identify, {
          id: 'id',
          'Group id': 'id',
          'Group trait': true
        });
      });

      it('should convert dates to unix timestamps', function(){
        var date = new Date();
        analytics.group({ date: date });
        analytics.called(window._cio.identify, {
          id: 'id',
          'Group date': Math.floor(date / 1000)
        });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._cio, 'track');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window._cio.track, 'event');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window._cio.track, 'event', { property: true });
      });

      it('should convert dates to unix timestamps', function(){
        var date = new Date();
        analytics.track('event', { date: date });
        analytics.called(window._cio.track, 'event', { date: Math.floor(date / 1000) });
      });
    });
  });
});
