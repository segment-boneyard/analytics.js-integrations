
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

// got acquired and closed userfox, so we should remove
describe.skip('Userfox', function(){
  var Userfox = plugin.Integration;
  var userfox;
  var analytics;
  var options = {
    clientId: '4v2erxr9c5vzqsy35z9gnk6az'
  };

  beforeEach(function(){
    analytics = new Analytics;
    userfox = new Userfox(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(userfox);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    sandbox();
  });

  after(function(){
    userfox.reset();
  });

  it('should store the right settings', function(){
    analytics.compare(Userfox, integration('userfox')
      .readyOnLoad()
      .assumesPageview()
      .global('_ufq')
      .option('clientId', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(userfox, 'load');
    });

    afterEach(function(){
      userfox.reset();
    });

    describe('#initialize', function(){
      it('should create window._ufq', function(){
        analytics.assert(!window._ufq);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._ufq instanceof Array);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(userfox.load);
      });
    });
  });

  // userfox: is it dead ?

  describe('loading', function(){
    it.skip('should load', function(done){
      analytics.load(userfox, done);
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
        analytics.stub(window._ufq, 'push');
      });

      it('should initialize the library with an email', function(){
        analytics.identify('id', { email: 'name@example.com' });
        analytics.called(window._ufq.push, ['init', {
          clientId: options.clientId,
          email: 'name@example.com'
        }]);
      });

      it('should send traits', function(){
        analytics.identify({ email: 'name@example.com', trait: true });
        analytics.called(window._ufq.push, ['track', {
          email: 'name@example.com',
          trait: true
        }]);
      });

      it('should convert dates to a format userfox supports', function(){
        var date = new Date();
        analytics.identify({
          email: 'name@example.com',
          date: date
        });
        analytics.called(window._ufq.push, ['track', {
          email: 'name@example.com',
          date: Math.round(date.getTime() / 1000).toString()
        }]);
      });

      it('should alias a created trait to signup_date', function(){
        var date = new Date();
        analytics.identify({
          email: 'name@example.com',
          created: date
        });
        analytics.called(window._ufq.push, ['track', {
          email: 'name@example.com',
          signup_date: Math.round(date.getTime() / 1000).toString()
        }]);
      });
    });
  });
});