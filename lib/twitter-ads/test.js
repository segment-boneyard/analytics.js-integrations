
describe('Twitter Ads', function(){

  var Twitter = require('integrations/lib/twitter-ads');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var twitter;

  var settings = {
    events: {
      signup: 'c36462a3',
      login: '6137ab24',
      play: 'e3196de1'
    }
  };

  beforeEach(function(){
    analytics.use(Twitter);
    twitter = new Twitter.Integration(settings);
    twitter.initialize();
  })

  it('should have the correct settings', function(){
    test(twitter)
      .name('Twitter Ads')
      .readyOnInitialize()
      .option('events', {});
  })

  describe('#track', function(){
    before(function(){
      sinon.spy(Twitter, 'load');
    })

    afterEach(function(){
      Twitter.load.reset();
    })

    it('should not send if event is not defined', function(){
      test(twitter).track('toString', {});
      assert(!Twitter.load.called);
    })

    it('should send event if found', function(){
      test(twitter)
        .track('signup')
        .called(Twitter.load)
        .with({ txn_id: 'c36462a3', p_id: 'Twitter' });
    })

    it('should send correctly', function(){
      test(twitter).track('play');
      var img = Twitter.load.returnValues[0];
      assert(img);
      assert(img.src == 'http://analytics.twitter.com/i/adsct?txn_id=e3196de1&p_id=Twitter');
    })
  })

})
