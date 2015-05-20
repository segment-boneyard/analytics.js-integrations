
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Hellobar = require('./');

describe('Hellobar', function(){
  var analytics;
  var hellobar;
  var options = {
    apiKey: 'bb900665a3090a79ee1db98c3af21ea174bbc09f'
  };

  beforeEach(function(){
    analytics = new Analytics();
    hellobar = new Hellobar(options);
    analytics.use(Hellobar);
    analytics.use(tester);
    analytics.add(hellobar);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    hellobar.reset();
    sandbox();
  });

  after(function(){
    reset();
  });

  it('should have the right settings', function(){
    analytics.compare(Hellobar, integration('Hello Bar')
      .assumesPageview()
      .global('_hbq')
      .option('apiKey', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(hellobar, 'load');
    });

    afterEach(function(){
      reset();
    });

    describe('#initialize', function(){
      it('should create the window._hbq object', function(){
        analytics.assert(window._hbq === undefined);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._hbq);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(hellobar.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(hellobar, done);
    });
  });
});

/**
 * Remove the Hellobar DOM element.
 */

function reset() {
  var el = document.getElementById('hellobar_container');
  if (el) el.parentNode.removeChild(el);
}
