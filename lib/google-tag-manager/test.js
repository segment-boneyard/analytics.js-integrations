
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Google Tag Manager', function(){
  var GTM = plugin;
  var gtm;
  var analytics;
  var options = {
    containerId: 'GTM-K5F78L'
  };

  beforeEach(function(){
    analytics = new Analytics;
    gtm = new GTM(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(gtm);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    gtm.reset();
    sandbox();
  });

  it('should store the correct settings', function(){
    analytics.compare(GTM, integration('Google Tag Manager')
      .assumesPageview()
      .global('dataLayer')
      .option('containerId', '')
      .option('trackNamedPages', true)
      .option('trackCategorizedPages', true));
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(gtm, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    it('should push initial gtm.start event', function(){
      var dl = window.dataLayer;
      analytics.assert(dl);
      analytics.assert('gtm.js' == dl[0].event);
      analytics.assert('number' == typeof dl[0]['gtm.start']);
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.dataLayer, 'push');
      });

      it('should send event', function(){
        analytics.track('some-event');
        analytics.called(window.dataLayer.push, { event: 'some-event' });
      });

      it('should send event with properties', function(){
        analytics.track('event', { prop: true });
        analytics.called(window.dataLayer.push, { event: 'event', prop: true });
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window.dataLayer, 'push');
      });

      it('should not track unamed pages by default', function(){
        analytics.page();
        analytics.didNotCall(window.dataLayer.push);
      });

      it('should track unamed pages if enabled', function(){
        gtm.options.trackAllPages = true;
        analytics.page();
        analytics.called(window.dataLayer.push, {
          event: 'Loaded a Page',
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.origin + window.location.pathname
        });
      });

      it('should track named pages by default', function(){
        analytics.page('Name');
        analytics.called(window.dataLayer.push, {
          event: 'Viewed Name Page',
          name: 'Name',
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.origin + window.location.pathname
        });
      });

      it('should track named pages with a category added', function(){
        analytics.page('Category', 'Name')
        analytics.called(window.dataLayer.push, {
          event: 'Viewed Category Name Page',
          category: 'Category',
          name: 'Name',
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.origin + window.location.pathname
        });
      });

      it('should track categorized pages by default', function(){
        analytics.page('Category', 'Name')
        analytics.called(window.dataLayer.push, {
          event: 'Viewed Category Name Page',
          category: 'Category',
          name: 'Name',
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.origin + window.location.pathname
        });
      });

      it('should not track name or categorized pages if disabled', function(){
        gtm.options.trackNamedPages = false;
        gtm.options.trackCategorizedPages = false;
        analytics.page('Name');
        analytics.page('Category', 'Name');
        analytics.didNotCall(window.dataLayer.push);
      });
    });
  });
});