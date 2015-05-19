
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Taplytics', function(){
  var Taplytics = plugin;
  var taplytics;
  var analytics;
  var options = {
    token: '82c35fe2ac8d43e09509e06a628cd6fc'
  };

  beforeEach(function(){
    analytics = new Analytics;
    taplytics = new Taplytics(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(taplytics);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    taplytics.reset();
    sandbox();
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(taplytics, 'load');
      analytics.initialize();
    });

    describe('#initialize', function(){
      it('should create window._tlq', function(){
        analytics.assert(window._tlq instanceof Array);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(taplytics, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
    });

    it('should set window.Taplytics', function(){
      analytics.assert(window.Taplytics);
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._tlq, 'push');
      });

      it('should track events with no properties', function(){
        analytics.track('NAME');
        analytics.calledOnce(window._tlq.push);
        analytics.called(window._tlq.push, ['track', 'NAME', {}]);
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window._tlq, 'push');
      });

      it('should track normal page views', function(){
        analytics.page();
        analytics.calledOnce(window._tlq.push);
        analytics.called(window._tlq.push, ['page']);
      });

      it('should track named page views', function(){
        analytics.page('NAME');
        analytics.calledOnce(window._tlq.push);
        analytics.called(window._tlq.push, ['page', 'NAME']);
      });

      it ('should track catagorized and named page views', function(){
        analytics.page('CATEGORY', 'NAME');
        analytics.calledOnce(window._tlq.push);
        analytics.called(window._tlq.push, ['page', 'CATEGORY', 'NAME']);
      });

      it('should track catagorized, named pages with properties', function(){
        analytics.page('CATEGORY', 'NAME', {
          test: 1
        });

        analytics.calledOnce(window._tlq.push);
        analytics.called(window._tlq.push, ['page', 'CATEGORY', 'NAME', {
          test: 1
        }]);
      });
    });
  });

  it('should have the right settings', function(){
    analytics.compare(Taplytics, integration('Taplytics')
      .global('_tlq')
      .global('Taplytics')
      .option('token', '')
      .option('options', {})
      .tag('<script id="taplytics" src="https://s3.amazonaws.com/cdn.taplytics.com/taplytics.min.js">')
      .assumesPageview());
  });

});