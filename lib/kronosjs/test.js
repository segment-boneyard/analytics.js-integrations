var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Kronos.js', function(){
  var KronosJs = plugin;
  var kronos;
  var analytics;
  var options = {
    url: 'https://kronos.locu.com',
    namespace: 'kronos_namespace'
  };

  beforeEach(function(){
    analytics = new Analytics;
    kronos = new KronosJs(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(kronos);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    kronos.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(KronosJs, integration('KronosJs')
      .global('kronosClient')
      .option('url')
      .option('namespace')
      .option('pageStream', null)
      .tag('<script src="//cdnjs.cloudflare.com/ajax/libs/kronos.js/0.7.0/kronos.min.js">'));
  });

  describe('loading', function(){
    beforeEach(function(){
     analytics.spy(kronos, 'load');
    });

    describe('#initialize', function(){
      it('should not provide a window.kronosClient', function(){
        analytics.assert(!window.kronosClient);
        analytics.initialize();
        analytics.page();
        analytics.assert(!window.kronosClient);
      });

    });
  });

  describe('loading', function(){
    beforeEach(function(){
      analytics.spy(kronos, 'load');
    });

    it('should create window.kronosClient', function(done){
      analytics.load(kronos, function(){
        analytics.assert(window.kronosClient);
        done();
      });
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
        analytics.stub(window.kronosClient, 'put');
      });

      it('should not track pages without a page stream', function(){
        kronos.options.pageStream = '';
        analytics.page();
        analytics.didNotCall(window.kronosClient.put);
        kronos.options.pageStream = '';
        analytics.page();
        analytics.didNotCall(window.kronosClient.put);
        kronos.options.pageStream = null;
        analytics.page();
        analytics.didNotCall(window.kronosClient.put);
      });

      it('should track pages with a page stream', function(){
        kronos.options.pageStream = 'product.pageviews';
        analytics.page();
        analytics.called(window.kronosClient.put, 'product.pageviews', {
          pageProperties: {
            path: location.pathname,
            referrer: '',
            title: document.title,
            search: location.search,
            url: location.href }});
      });

      it('should track named pages by default', function(){
        kronos.options.pageStream = 'product.pageviews';
        analytics.page('Name');
        analytics.called(window.kronosClient.put, 'product.pageviews', {
          pageProperties: {
            name: 'Name',
            path: location.pathname,
            referrer: '',
            title: document.title,
            search: location.search,
            url: location.href }});
      });

      it('should track named pages with categories', function(){
        kronos.options.pageStream = 'product.pageviews';
        analytics.page('Category', 'Name');
        analytics.called(window.kronosClient.put, 'product.pageviews', {
          pageProperties: {
            name: 'Name',
            category: 'Category',
            path: location.pathname,
            referrer: '',
            title: document.title,
            search: location.search,
            url: location.href }});
      });

      it('should pass properties and traits', function(){
        kronos.options.pageStream = 'product.pageviews';
        analytics.identify('the_id', { trait: true, prop: 'prop' });
        analytics.page('Category', 'Name', { prop: true, title: 'new!' });
        analytics.called(window.kronosClient.put, 'product.pageviews', {
          userId: 'the_id',
          trait: true,
          prop: 'prop',
          pageProperties: {
            name: 'Name',
            prop: true,
            category: 'Category',
            path: location.pathname,
            referrer: '',
            title: 'new!',
            search: location.search,
            url: location.href }});
      });

    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.kronosClient, 'put');
      });

      it('should not write to Kronos and should stash the traits away', function(){
        analytics.identify('id');
        analytics.didNotCall(window.kronosClient.put);
        analytics.assert(kronos.traits);
      });

      it('should pass an id', function(){
        analytics.identify('the_id');
        analytics.assert(window.kronosClient);
        analytics.deepEqual(kronos.traits, { userId: 'the_id' });
      });

      it('should pass a trait', function(){
        analytics.identify({ trait: true });
        analytics.deepEqual(kronos.traits, { trait: true });
      });

      it('should pass an id and traits', function(){
        analytics.identify('the_id', { trait: true });
        analytics.deepEqual(kronos.traits,
                            { userId: 'the_id', trait: true });
      });

      it('it should handle multiple identify calls', function(){
        analytics.identify({ trait1: 1, trait2: 2 });
        analytics.identify({ trait1: -1, trait3: 3 });
        analytics.identify('the_id');
        analytics.deepEqual(kronos.traits,
                            { userId: 'the_id', trait1: -1, trait2: 2,
                              trait3: 3 });
      });

    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.kronosClient, 'put');
      });

      it('should pass an empty event', function(){
        analytics.track('event');
        analytics.called(window.kronosClient.put, 'event', {});
      });

      it('should pass an event and properties', function(){
        analytics.track('event', { prop1: 'val1', prop2: 'val2' });
        analytics.called(window.kronosClient.put, 'event',
                         { prop1: 'val1', prop2: 'val2' });
      });

      it('should pass an event and properties with identity traits', function(){
        analytics.identify('the_id', { trait: true });
        analytics.track('event', { prop1: 'val1', prop2: 'val2' });
        analytics.called(window.kronosClient.put, 'event',
                         { prop1: 'val1', prop2: 'val2', trait: true,
                           userId: 'the_id' });
      });

      it('override properties with traits', function(){
        analytics.identify('the_id', { trait: true, prop2: 'trait' });
        analytics.track('event', { prop1: 'val1', prop2: 'prop' });
        analytics.called(window.kronosClient.put, 'event',
                         { prop1: 'val1', prop2: 'trait', trait: true,
                           userId: 'the_id' });
      });
    });
  });
});