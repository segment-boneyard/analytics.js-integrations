
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');
var each = require('each');

describe('Heap', function(){
  var Heap = plugin;
  var heap;
  var analytics;
  var options = {
    appId: 'x'
  };

  beforeEach(function(){
    analytics = new Analytics;
    heap = new Heap(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(heap);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    heap.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Heap, integration('Heap')
      .global('heap')
      .option('appId', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(heap, 'load');
    });

    describe('#initialize', function(){
      it('should create window.heap', function(){
        analytics.assert(!window.heap);
        analytics.initialize();
        analytics.assert(window.heap);
      });

      it('should stub window.heap with the right methods', function(){
        var methods = ['identify', 'track'];
        analytics.assert(!window.heap);
        analytics.initialize();
        each(methods, function(method){
          analytics.assert(window.heap[method]);
        });
      });

      it('should set window.heap.appid', function(){
        analytics.assert(!window.heap);
        analytics.initialize();
        analytics.assert(window.heap.appid === heap.options.appId);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.called(heap.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(heap, done);
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
        analytics.stub(window.heap, 'identify');
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        analytics.called(window.heap.identify, { trait: true });
      });

      it('should send username as handle', function(){
        analytics.identify({ username: 'username' });
        analytics.called(window.heap.identify, { handle: 'username' });
      });

      it('should send id as handle', function(){
        analytics.identify('id');
        analytics.called(window.heap.identify, { handle: 'id', id: 'id' });
      })

      it('should prefer username', function(){
        analytics.identify('id', { username: 'baz' });
        analytics.called(window.heap.identify, { handle: 'baz', id: 'id' });
      })
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.heap, 'track');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.heap.track, 'event');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window.heap.track, 'event', { property: true });
      });
    });
  });
});
