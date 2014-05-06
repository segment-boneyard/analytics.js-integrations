
describe('Google Tag Manager', function(){

  var GTM = require('integrations/lib/google-tag-manager');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');

  var gtm;
  var settings = {
    containerId: 'GTM-K5F78L'
  };

  beforeEach(function(){
    analytics.use(GTM);
    gtm = new GTM.Integration(settings);
    gtm.initialize();
  })

  afterEach(function(){
    gtm.reset();
  })

  it('should store the correct settings', function(){
    test(gtm)
      .name('Google Tag Manager')
      .assumesPageview()
      .readyOnLoad()
      .global('dataLayer')
      .option('containerId', '')
      .option('trackNamedPages', true)
      .option('trackCategorizedPages', true);
  })

  describe('#loaded', function(){
    afterEach(function(){
      gtm.reset();
    });

    it('should test window.dataLayer.push', function(){
      assert(!gtm.loaded());
      window.dataLayer = [];
      window.dataLayer.push = [].slice;
      assert(gtm.loaded());
    })
  })

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(gtm, 'load');
      gtm.initialize();
      gtm.load.restore();
    })

    it('should change loaded state', function(done){
      test(gtm).loads(done);
    })

    it('should push initial gtm.start event', function(done){
      test(gtm).loads(function(err){
        if (err) return done(err);
        var dl = window.dataLayer;
        assert(dl);
        assert('gtm.js' == dl[0].event);
        assert('number' == typeof dl[0]['gtm.start']);
        done();
      })
    })
  })

  describe('#track', function(){
    beforeEach(function(){
      window.dataLayer = [];
      window.dataLayer.push = sinon.spy();
    })

    it('should send event', function(){
      test(gtm)
        .track('some-event')
        .called(window.dataLayer.push)
        .with({ event: 'some-event' });
    })

    it('should send event with properties', function(){
      test(gtm)
        .track('event', { prop: true })
        .called(window.dataLayer.push)
        .with({ event: 'event', prop: true });
    })
  })

  describe('#page', function(){
    beforeEach(function(){
      gtm.initialize();
      window.dataLayer = [];
      window.dataLayer.push = sinon.spy();
    })

    it('should not track unamed pages by default', function(){
      test(gtm).page();
      assert(!window.dataLayer.push.called);
    })

    it('should track unamed pages if enabled', function(){
      gtm.options.trackAllPages = true;
      test(gtm)
        .page()
        .called(window.dataLayer.push)
        .with({ event: 'Loaded a Page' });
    })

    it('should track named pages by default', function(){
      test(gtm)
        .page(null, 'Name')
        .called(window.dataLayer.push)
        .with({ event: 'Viewed Name Page', name: 'Name' });
    });

    it('should track named pages with a category added', function(){
      test(gtm)
        .page('Category', 'Name')
        .called(window.dataLayer.push)
        .with({
          event: 'Viewed Category Name Page',
          category: 'Category',
          name: 'Name'
        });
    });

    it('should track categorized pages by default', function(){
      test(gtm)
        .page('Category', 'Name')
        .called(window.dataLayer.push)
        .with({
          event: 'Viewed Category Name Page',
          category: 'Category',
          name: 'Name'
        });
    });

    it('should not track name or categorized pages if disabled', function(){
      gtm.options.trackNamedPages = false;
      gtm.options.trackCategorizedPages = false;
      test(gtm).page(null, 'Name');
      test(gtm).page('Category', 'Name');
      assert(!window.dataLayer.push.called);
    });
  })

})
