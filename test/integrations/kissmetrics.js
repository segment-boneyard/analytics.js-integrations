
describe('KISSmetrics', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var KISSmetrics = require('integrations/lib/kissmetrics');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var kissmetrics;
  var settings = {
    apiKey: '67f57ae9d61a6981fa07d141bec8c6c37e8b88c7'
  };

  before(function (done) {
    // setup global that tell kissmetrics to not fire jsonp breaking requests
    window.KM_DNT = true;
    window.KMDNTH = true;

    analytics.use(KISSmetrics);
    kissmetrics = new KISSmetrics.Integration(settings);
    kissmetrics.initialize(); // noop

    // initialize only once because kissmetrics has a bunch of timeouts
    kissmetrics.once('load', done);
    kissmetrics.initialize();
  });

  it('should have the right settings', function () {
    test(kissmetrics)
      .name('KISSmetrics')
      .assumesPageview()
      .readyOnInitialize()
      .global('_kmq')
      .global('KM')
      .global('_kmil')
      .option('apiKey', '')
      .option('trackNamedPages', true);
  });

  it('should create window._kmq', function () {
    assert(window._kmq instanceof Array);
  });

  it('should create window.KM', function () {
    assert(window.KM);
  });

  describe('#loaded', function () {
    var global;

    before(function () {
      global = window.KM;
    });

    after(function () {
      window.KM = global;
    });

    it('should test window.KM', function () {
      window.KM = undefined;
      assert(!kissmetrics.loaded());
      window.KM = document.createElement('div');
      assert(!kissmetrics.loaded());
      window.KM = {};
      assert(kissmetrics.loaded());
    });
  });

  describe('#page', function () {
    beforeEach(function () {
      window._kmq.push = sinon.spy();
    });

    it('should track named pages by default', function () {
      test(kissmetrics).page(null, 'Name');
      assert(window._kmq.push.calledWith(['record', 'Viewed Name Page', { name: 'Name' }]));
    });

    it('should track named pages with categories', function () {
      test(kissmetrics).page('Category', 'Name');
      assert(window._kmq.push.calledWith(['record', 'Viewed Category Name Page', {
        category: 'Category',
        name: 'Name'
      }]));
    });

    it('should track categorized pages by default', function () {
      test(kissmetrics).page('Category', 'Name');
      assert(window._kmq.push.calledWith(['record', 'Viewed Category Page', {
        category: 'Category',
        name: 'Name'
      }]));
    });

    it('should not track a named or categorized page when the option is off', function () {
      kissmetrics.options.trackNamedPages = false;
      kissmetrics.options.trackCategorizedPages = false;
      test(kissmetrics).page(null, 'Name');
      test(kissmetrics).page('Category', 'Name');
      assert(!window._kmq.push.called);
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      window._kmq.push = sinon.spy();
    });

    it('should send an id', function () {
      test(kissmetrics).identify('id');
      assert(window._kmq.push.calledWith(['identify', 'id']));
    });

    it('should send traits', function () {
      test(kissmetrics).identify(null, { trait: true });
      assert(window._kmq.push.calledWith(['set', { trait: true }]));
    });

    it('should send an id and traits', function () {
      test(kissmetrics).identify('id', { trait: true });
      assert(window._kmq.push.calledWith(['identify', 'id']));
      assert(window._kmq.push.calledWith(['set', { trait: true, id: 'id' }]));
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      window._kmq.push = sinon.spy();
    });

    it('should send an event', function () {
      test(kissmetrics).track('event');
      assert(window._kmq.push.calledWith(['record', 'event', {}]));
    });

    it('should send an event and properties', function () {
      test(kissmetrics).track('event', { property: true });
      assert(window._kmq.push.calledWith(['record', 'event', { property: true }]));
    });

    it('should alias revenue to "Billing Amount"', function () {
      test(kissmetrics).track('event', { revenue: 9.99 });
      assert(window._kmq.push.calledWith(['record', 'event', { 'Billing Amount': 9.99 }]));
    });
  });

  describe('#alias', function () {
    beforeEach(function () {
      window._kmq.push = sinon.spy();
    });

    it('should send a new id', function () {
      test(kissmetrics).alias('new');
      assert(window._kmq.push.calledWith(['alias', 'new', undefined]));
    });

    it('should send a new and old id', function () {
      test(kissmetrics).alias('new', 'old');
      assert(window._kmq.push.calledWith(['alias', 'new', 'old']));
    });
  });

});
