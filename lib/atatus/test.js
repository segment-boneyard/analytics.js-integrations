
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Atatus', function(){
  var Atatus = plugin;
  var atatus;
  var analytics;
  var options = {
    apiKey: 'b5598f48388b4e2da7de03f0cf39ea64'
  };
  var onerror = window.onerror;

  beforeEach(function(){
    analytics = new Analytics;
    atatus = new Atatus(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(atatus);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    atatus.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Atatus, integration('Atatus')
      .global('atatus')
      .option('apiKey', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(atatus, 'load');
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(atatus.load);
      });
    });
  });

  describe('loading', function(){
    it('should load and set an onerror handler', function(done){
      analytics.load(atatus, function(err){
        if (err) return done(err);
        analytics.notEqual(window.onerror, onerror);
        analytics.equal('function', typeof window.onerror);
        done();
      });
      //analytics.load(atatus, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.atatus, 'setCustomData');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.atatus.setCustomData, { person: { id: 'id' } });
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        analytics.called(window.atatus.setCustomData, { person: { trait: true } });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.atatus.setCustomData, { person: { id: 'id', trait: true } });
      });
    });
  });
});
