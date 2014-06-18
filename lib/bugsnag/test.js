
var tester = require('analytics.js-integration-tester');
var analytics = require('analytics.js');
var Bugsnag = require('./index');
var assert = require('assert');
var equal = require('equals');
var sinon = require('sinon');

describe('Bugsnag', function(){
  var bugsnag;
  var test;
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
  });

  after(function(){
    window.setTimeout = so;
    window.setInterval = si;
  });

  beforeEach(function(){
    analytics.use(Bugsnag);
    bugsnag = new Bugsnag.Integration(settings);
    test = tester(bugsnag);
  });

  afterEach(function(){
    bugsnag.reset();
  });

  it('should have the right settings', function(){
    test
      .name('Bugsnag')
      .readyOnLoad()
      .global('Bugsnag')
      .option('apiKey', '');
  });

  describe('#initialize', function(){
    it('should call #load', function(){
      test
        .initialize()
        .called(bugsnag.load);
    });
  });

  describe('#loaded', function(){
    it('should test window.Bugsnag', function(){
      assert(!test.loaded());
      window.Bugsnag = document.createElement('div');
      assert(!test.loaded());
      window.Bugsnag = {};
      assert(test.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      test.initialize();
      test.load.restore();
    });

    it('should change loaded state', function(done){
      assert(!test.loaded());
      test.load(function(err){
        if (err) return done(err);
        assert(test.loaded());
        window.Bugsnag.notify('baz');
        done();
      });
    });

    it('should set an onerror handler', function(done){
      var handler = window.onerror;
      test.load(function(err){
        if (err) return done(err);
        assert(handler !== window.onerror);
        assert('function' === typeof window.onerror);
        done();
      });
    });
  });

  describe('#identify', function(){
    beforeEach(function(){
      test.initialize();
    });

    it('should set metadata', function(){
      test
        .identify('id', { trait: true })
        .deepEqual(window.Bugsnag.metaData, { id: 'id', trait: true });
    });
  });
});