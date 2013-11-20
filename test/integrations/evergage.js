
describe('Evergage', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Evergage = require('integrations/lib/evergage');
  var equal = require('equals');
  var jquery = require('jquery');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var evergage;
  var settings = {
    account: 'segmentiotest',
    dataset: 'segio_b2b_anon'
  };

  beforeEach(function () {
    analytics.use(Evergage);
    evergage = new Evergage.Integration(settings);
    evergage.initialize(); // noop
  });

  afterEach(function () {
    evergage.reset();
  });

  it('should have the right settings', function () {
    test(evergage)
      .name('Evergage')
      .assumesPageview()
      .readyOnInitialize()
      .global('_aaq')
      .option('account', '')
      .option('dataset', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      evergage.load = sinon.spy();
    });

    it('should create window._aaq', function () {
      assert(!window._aaq);
      evergage.initialize();
      assert(window._aaq);
    });

    it('should push the account', function () {
      evergage.initialize();
      assert(equal(window._aaq[0], ['setEvergageAccount', settings.account]));
    });

    it('should push the dataset', function () {
      evergage.initialize();
      assert(equal(window._aaq[1], ['setDataset', settings.dataset]));
    });

    it('should push use site config', function () {
      evergage.initialize();
      assert(equal(window._aaq[2], ['setUseSiteConfig', true]));
    });

    it('should call #load', function () {
      evergage.initialize();
      assert(evergage.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window._aaq.push', function () {
      window._aaq = [];
      assert(!evergage.loaded());
      window._aaq.push = function(){};
      assert(evergage.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(evergage, 'load');
      evergage.initialize();
      evergage.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!evergage.loaded());
      evergage.load(function (err) {
        if (err) return done(err);
        assert(evergage.loaded());
        done();
      });
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      evergage.initialize();
      window._aaq.push = sinon.spy();
    });

    it('should send an id', function () {
      evergage.identify('id');
      assert(window._aaq.push.calledWith(['setUser', 'id']));
    });

    it('should not send just traits', function () {
      evergage.identify(null, { trait: true });
      assert(!window._aaq.push.called);
    });

    it('should send an id and traits', function () {
      evergage.identify('id', { trait: true });
      assert(window._aaq.push.calledWith(['setUserField', 'trait', true, 'page']));
      assert(window._aaq.push.calledWith(['setUser', 'id']));
    });

    it('should send an email', function () {
      evergage.identify('id', { email: 'name@example.com' });
      assert(window._aaq.push.calledWith(['setUserField', 'userEmail', 'name@example.com', 'page']));
      assert(window._aaq.push.calledWith(['setUser', 'id']));
    });

    it('should send a name', function () {
      evergage.identify('id', { name: 'name' });
      assert(window._aaq.push.calledWith(['setUserField', 'userName', 'name', 'page']));
      assert(window._aaq.push.calledWith(['setUser', 'id']));
    });
  });

  describe('#group', function () {
    beforeEach(function () {
      evergage.initialize();
      window._aaq.push = sinon.spy();
    });

    it('should send an id', function () {
      evergage.group('id');
      assert(window._aaq.push.calledWith(['setCompany', 'id']));
    });

    it('should not send just properties', function () {
      evergage.group(null, { property: true });
      assert(!window._aaq.push.called);
    });

    it('should send an id and properties', function () {
      evergage.group('id', { property: true });
      assert(window._aaq.push.calledWith(['setAccountField', 'property', true, 'page']));
      assert(window._aaq.push.calledWith(['setCompany', 'id']));
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      evergage.initialize();
      window._aaq.push = sinon.spy();
    });

    it('should send an event', function () {
      evergage.track('event');
      assert(window._aaq.push.calledWith(['trackAction', 'event', undefined]));
    });

    it('should send an event and properties', function () {
      evergage.track('event', { property: true });
      assert(window._aaq.push.calledWith(['trackAction', 'event', { property: true }]));
    });
  });

  describe('#page', function () {
    beforeEach(function (done) {
      evergage.once('load', function () {
        window.Evergage.init = sinon.spy();
        window._aaq.push = sinon.spy();
        done();
      });
      evergage.initialize();
    });

    it('should send a page view', function () {
      evergage.page();
      assert(window._aaq.push.calledWith(['namePage', undefined]));
      assert(window.Evergage.init.calledWith(true));
    });

    it('should send page properties', function () {
      evergage.page('category', 'name', {
        pageAttribute: 'pageAttributeValue'
      });
      assert(window._aaq.push.calledWith(['setCustomField', 'pageAttribute', 'pageAttributeValue', 'page']));
      assert(window._aaq.push.calledWith(['namePage', 'name']));
      assert(window.Evergage.init.calledWith(true));
    });
  });

});