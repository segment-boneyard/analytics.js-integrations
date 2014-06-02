
describe('Facebook Ads', function(){

  var Facebook = require('integrations/lib/facebook-ads');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var facebook;

  var settings = {
    events: {
      signup: 0,
      login: 1,
      play: 2
    }
  };

  beforeEach(function(){
    analytics.use(Facebook);
    facebook = new Facebook.Integration(settings);
    facebook.initialize();
  })

  it('should have the correct settings', function(){
    test(facebook)
      .name('Facebook Ads')
      .readyOnInitialize()
      .option('currency', 'USD')
      .option('events', {});
  })

  describe('#track', function(){
    before(function(){
      sinon.spy(Facebook, 'load');
    })

    afterEach(function(){
      Facebook.load.reset();
    })

    it('should not send if event is not define', function(){
      test(facebook).track('toString', {});
      assert(!Facebook.load.called);
    })

    it('should send event if found', function(){
      test(facebook)
        .track('signup', {})
        .called(Facebook.load)
        .with({ ev: 0, 'cd[currency]': 'USD', 'cd[value]': 0 });
    })

    it('should send revenue', function(){
      test(facebook)
        .track('login', { revenue: '$50' })
        .called(Facebook.load)
        .with({ ev: 1, 'cd[value]': 50, 'cd[currency]': 'USD' });
    })

    it('should send correctly', function(){
      test(facebook).track('play', { revenue: 90 });
      var img = Facebook.load.returnValues[0];
      assert(img);
      assert.equal(img.src, encodeURI('http://www.facebook.com/tr/'
        + '?cd[currency]=USD'
        + '&cd[value]=90'
        + '&ev=2'));
    })
  })

})
