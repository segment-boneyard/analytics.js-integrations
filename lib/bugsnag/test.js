
describe('Bugsnag', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var Bugsnag = require('integrations/lib/bugsnag');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');

  var bugsnag;
  var settings = {
    apiKey: 'x'
  };

  // HACK: bugsnag overrides, setTimeout
  // it doesn't break tests but since those
  // tests load bugsnag <script> multiple
  // times so that break things.
  var so, si;
  before(function(){
    so = window.setTimeout;
    si = window.setInterval;
  })

  after(function(){
    window.setTimeout = so;
    window.setInterval = si;
  })

  beforeEach(function(){
    analytics.use(Bugsnag);
    bugsnag = new Bugsnag.Integration(settings);
  });

  afterEach(function(){
    bugsnag.reset();
  });

  it('should have the right settings', function(){
    test(bugsnag)
      .name('Bugsnag')
      .readyOnLoad()
      .global('Bugsnag')
      .option('apiKey', '');
  });

  describe('#initialize', function(){
    beforeEach(function(){
      sinon.stub(bugsnag, 'load');
    });

    it('should call #load', function(){
      bugsnag.initialize();
      assert(bugsnag.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.Bugsnag', function(){
      assert(!bugsnag.loaded());
      window.Bugsnag = document.createElement('div');
      assert(!bugsnag.loaded());
      window.Bugsnag = {};
      assert(bugsnag.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(bugsnag, 'load');
      bugsnag.initialize();
      bugsnag.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!bugsnag.loaded());
      bugsnag.load(function (err) {
        if (err) return done(err);
        assert(bugsnag.loaded());
        window.Bugsnag.notify('baz');
        done();
      });
    });

    it('should set an onerror handler', function (done) {
      var handler = window.onerror;
      bugsnag.load(function (err) {
        if (err) return done(err);
        assert(handler !== window.onerror);
        assert('function' === typeof window.onerror);
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function (done) {
      bugsnag.initialize();
      bugsnag.once('load', done);
    });

    it('should set metadata', function(){
      test(bugsnag)
      .identify('id', { trait: true })
      .changed(window.Bugsnag.metaData)
      .to({ id: 'id', trait: true });
    });
  });

});
