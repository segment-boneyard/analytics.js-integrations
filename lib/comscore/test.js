
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Comscore = require('./');

describe('comScore', function(){
  var analytics;
  var comscore;
  var options = {
    c2: 'x'
  };

  beforeEach(function(){
    analytics = new Analytics();
    comscore = new Comscore(options);
    analytics.use(Comscore);
    analytics.use(tester);
    analytics.add(comscore);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    comscore.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Comscore, integration('comScore')
      .assumesPageview()
      .global('_comscore')
      .option('c1', '2')
      .option('c2', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(comscore, 'load');
    });

    describe('#initialize', function(){
      it('should create window._comscore', function(){
        analytics.assert(!window._comscore);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._comscore instanceof Array);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(comscore, done);
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
        analytics.stub(window.COMSCORE, 'beacon');
      });

      it('should call only on 2nd page', function(){
        analytics.didNotCall(window.COMSCORE.beacon, { c1: '2', c2: 'x' });
        analytics.page();
        analytics.called(window.COMSCORE.beacon, { c1: '2', c2: 'x' });
      });
    });
  });
});
