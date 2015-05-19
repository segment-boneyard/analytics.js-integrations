
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Twitter = require('./');

describe('Twitter Ads', function(){
  var analytics;
  var twitter;
  var options = {
    events: {
      signup: 'c36462a3',
      login: '6137ab24',
      play: 'e3196de1'
    }
  };

  beforeEach(function(){
    analytics = new Analytics();
    twitter = new Twitter(options);
    analytics.use(Twitter);
    analytics.use(tester);
    analytics.add(twitter);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    twitter.reset();
    sandbox();
  });

  it('should have the correct settings', function(){
    analytics.compare(Twitter, integration('Twitter Ads')
      .option('page', '')
      .mapping('events'));
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.spy(twitter, 'load');
      });

      it('should not send if `page` option is not defined', function(){
        analytics.page();
        analytics.didNotCall(twitter.load);
      });

      it('should send if `page` option is defined', function(){
        twitter.options.page = 'e3196de1';
        analytics.page();
        analytics.loaded('<img src="http://analytics.twitter.com/i/adsct?txn_id=e3196de1&p_id=Twitter">');
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.spy(twitter, 'load');
      });

      it('should not send if event is not defined', function(){
        analytics.track('toString');
        analytics.didNotCall(twitter.load);
      });

      it('should send correctly', function(){
        analytics.track('play');
        analytics.loaded('<img src="http://analytics.twitter.com/i/adsct?txn_id=e3196de1&p_id=Twitter">');
      });

      it('should support array events', function(){
        twitter.options.events = [{ key: 'event', value: 12 }];
        analytics.track('event');
        analytics.loaded('<img src="http://analytics.twitter.com/i/adsct?txn_id=12&p_id=Twitter">');
      });
    });
  });
});
