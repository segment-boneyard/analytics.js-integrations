
describe('Inspectlet', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var Inspectlet = require('integrations/lib/inspectlet');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var inspectlet;
  var open = XMLHttpRequest.prototype.open;
  var settings = {
    wid: 'x'
  };

  beforeEach(function () {
    analytics.use(Inspectlet);
    inspectlet = new Inspectlet.Integration(settings);
    inspectlet.initialize(); // noop
  });

  afterEach(function () {
    inspectlet.reset();
  });

  after(function () {
    XMLHttpRequest.prototype.open = open; // inspectlet clobbers it
  });

  it('should have the right settings', function () {
    test(inspectlet)
      .name('Inspectlet')
      .assumesPageview()
      .readyOnLoad()
      .global('__insp')
      .global('__insp_')
      .option('wid', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      inspectlet.load = sinon.spy();
    });

    it('should create the inspectlet queue', function () {
      assert(!window.__insp);
      inspectlet.initialize();
      assert(window.__insp);
    });

    it('should push the wid', function () {
      inspectlet.initialize();
      assert(equal(window.__insp, [['wid', settings.wid]]));
    });

    it('should call #load', function () {
      inspectlet.initialize();
      assert(inspectlet.load.called);
    });
  });

  describe('#loaded', function () {
    it('should test window.__insp_', function () {
      assert(!inspectlet.loaded());
      window.__insp_ = {};
      assert(inspectlet.loaded());
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      sinon.stub(inspectlet, 'load');
      inspectlet.initialize();
      inspectlet.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!inspectlet.loaded());
      inspectlet.load(function (err) {
        if (err) return done(err);
        assert(inspectlet.loaded());
        done();
      });
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      window.__insp = [];
      sinon.stub(window.__insp, 'push');
    });

    it('should tag the session', function () {
      test(inspectlet).track('event');
      assert(window.__insp.push.calledWith(['tagSession', 'event']));
    });
  });

});
