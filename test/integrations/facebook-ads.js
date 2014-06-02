
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
      sinon.stub(window._fbq, 'push');
    });

    it('should not send if event is not define', function(){
      test(facebook).track('toString', {});
      assert(!_fbq.push.called);
    })

    it('should send event if found', function(){
      test(facebook)
        .track('signup', {})
        .called(_fbq.push)
        .with([ 'track', 0, { currency: 'USD', value: '0.00' } ]);
    })

    it('should send revenue', function(){
      test(facebook)
        .track('login', { revenue: '$50' })
        .called(_fbq.push)
        .with([ 'track', 1, { value: '50.00', currency: 'USD' } ]);
    })
  })

})
