
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Userlike', function(){
  var Userlike = plugin;
  var userlike;
  var analytics;
  var options = {
    secretKey: 'c3e839df9320d85ff590d07477c32cff837c02d7d4acaa18af91205800606b6c'
  };

  beforeEach(function(){
    analytics = new Analytics;
    userlike = new Userlike(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(userlike);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    userlike.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Userlike, integration('Userlike')
      .assumesPageview()
      .global('userlikeConfig')
      .global('userlikeData')
      .option('secretKey', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.identify({ email: 'email', name: 'name' });
      analytics.stub(userlike, 'load');
    });

    describe('#initialize', function(){
      it('should create window.userlikeData', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window.userlikeData, {
          custom:{
            segmentio:{
              secretKey: options.secretKey,
              visitor: {
                name: 'name',
                email: 'email'
              }
            }
          }
        });
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(userlike.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(userlike, done);
    });
  });
});