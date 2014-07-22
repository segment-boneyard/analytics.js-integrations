
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Lucky Orange', function(){
  var Lucky = plugin;
  var lucky;
  var analytics;
  var options = {
    siteId: '17181'
  };

  beforeEach(function(){
    analytics = new Analytics;
    lucky = new Lucky(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(lucky);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    lucky.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Lucky, integration('Lucky Orange')
      .assumesPageview()
      .global('_loq')
      .global('__wtw_lucky_site_id')
      .global('__wtw_lucky_is_segment_io')
      .global('__wtw_custom_user_data')
      .option('siteId', null));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(lucky, 'load');
    });

    describe('#initialize', function(){
      it('should create window._loq', function(){
        analytics.assert(!window._loq);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._loq instanceof Array);
      });

      it('should initialize the lucky variables', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(window.__wtw_lucky_site_id === options.siteId);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(lucky.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(lucky, done);
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
        analytics.stub(window._loq, 'push');
      });

      it('should send name', function(){
        analytics.identify({ email: 'test@example.com' });
        analytics.deepEqual(window.__wtw_custom_user_data, { email: 'test@example.com' });
      });

      it('should send name', function(){
        analytics.identify({ name: 'test' });
        analytics.deepEqual(window.__wtw_custom_user_data, { name: 'test' });
      });

      it('should send traits', function(){
        analytics.identify('id', { name: 'test', email: 'test@example.com' });
        analytics.deepEqual(window.__wtw_custom_user_data, { id: 'id', name: 'test', email: 'test@example.com' });
      });
    });
  });
});