
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Blueshift', function(){
  var Blueshift = plugin;
  var bsft;
  var analytics;
  var options = {
    apiKey: 'x',
    retarget: false
  };

  beforeEach(function(){
    analytics = new Analytics();
    bsft = new Blueshift(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(bsft);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    bsft.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Blueshift, integration('Blueshift')
      .global('blueshift')
      .global('_blueshiftid', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(bsft, 'load');
    });

    describe('#initialize', function(){
      it('should create the window.blueshift object', function(){
        analytics.assert(!window.blueshift);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.blueshift);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(bsft.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(bsft, done);
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
        analytics.stub(window.blueshift, 'retarget');
        analytics.stub(window.blueshift, 'pageload');
      });

      it('should track all pages', function(){
        analytics.page('Category', 'Page Name');
        analytics.didNotCall(window.blueshift.retarget);
        analytics.called(window.blueshift.pageload);
      });

      it('should call retarget on page event, if enabled', function(){
        bsft.options.retarget = true;
        analytics.page('Category', 'Page Name');
        analytics.called(window.blueshift.retarget);
        analytics.called(window.blueshift.pageload);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.blueshift, 'identify');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.blueshift.identify, { id: 'id', _bsft_source: 'segment.com' });
      });

      it('should not call identify if an id is not sent', function(){
        analytics.identify();
        analytics.didNotCall(window.blueshift.identify);
      });

      it('should not send only traits', function(){
        analytics.identify({ trait: true });
        analytics.didNotCall(window.blueshift.identify);
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.blueshift.identify, { id: 'id', trait: true, _bsft_source: 'segment.com' });
      });
    });

    describe('#group', function(){
      beforeEach(function(){
        analytics.stub(window.blueshift, 'track');
      });

      it('should call track with event equal group', function(){
        analytics.group('123', { name: 'test',  industry: 'Technology' });
        analytics.called(window.blueshift.track, 'group', {
          name: 'test',
          industry: 'Technology',
          id: '123',
          _bsft_source: 'segment.com'
        });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.blueshift, 'track');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.blueshift.track, 'event', { _bsft_source: 'segment.com' });
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window.blueshift.track, 'event', { property: true, _bsft_source: 'segment.com' });
      });
    });
  });
});
