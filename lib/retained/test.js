
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');

describe('Retained', function(){
  var Retained = plugin;
  var retained;
  var analytics;
  var options = {
    appKey: 'app_ckey_108nabzrpkaxchhrvzeubiss'
  };

  beforeEach(function(){
    analytics = new Analytics;
    retained = new Retained(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(retained);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    retained.reset();
  });

  it('should have the right settings', function(){
    analytics.compare(Retained, integration('Retained')
      .assumesPageview()
      .readyOnLoad()
      .global('Retained')
      .option('appKey', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(retained, 'load');
    });

    afterEach(function(){
      analytics.restore();
      analytics.reset();
      retained.reset();
    });;

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(retained.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(retained, done);
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
        analytics.stub(window.Retained, 'identify');
      });

      it('should send traits', function(){
        analytics.identify({ email: 'name@example.com' });
        analytics.called(window.Retained.identify, {
          email: 'name@example.com',
          app_ckey: options.appKey,
        });
      });

      it('should accept a person_hash', function(){
        analytics.identify({ email: 'name@example.com' }, {
          Retained: { personHash: 'x' }
        });
        analytics.called(window.Retained.identify, {
          email: 'name@example.com',
          app_ckey: options.appKey,
          person_hash: 'x'
        });
      });

      it('should accept userHash as person_hash', function(){
        analytics.identify({ email: 'name@example.com' }, {
          Retained: { userHash: 'x' }
        });
        analytics.called(window.Retained.identify, {
          email: 'name@example.com',
          app_ckey: options.appKey,
          person_hash: 'x'
        });
      });

      it('should convert dates to unix timestamps', function(){
        var date = new Date();
        analytics.identify({ email: 'name@example.com', created_at: date });
        analytics.called(window.Retained.identify, {
          email: 'name@example.com',
          app_ckey: options.appKey,
          created_at: Math.floor(date/1000)
        });
      });

      it('should alias created to created_at', function(){
        var date = new Date();
        analytics.identify({ email: 'name@example.com', created: date });
        analytics.called(window.Retained.identify, {
          email: 'name@example.com',
          app_ckey: options.appKey,
          created_at: Math.floor(date/1000)
        });
      });

      it('should accept a plan ID', function(){
        analytics.identify({ email: 'name@example.com' }, {
          Retained: {
            plan_id: 'Basic'
          }
        })
        analytics.called(window.Retained.identify, {
          email: 'name@example.com',
          app_ckey: options.appKey,
          plan_id: 'Basic'
        })
      })

      it('should accept custom fields', function(){
        analytics.identify({ email: 'name@example.com' }, {
          Retained: {
            custom_fields: {
              test_field: 5
            }
          }
        })
        analytics.called(window.Retained.identify, {
          email: 'name@example.com',
          app_ckey: options.appKey,
          custom_fields: {
            test_field: 5
          }
        })
      })
    });

  });
});
