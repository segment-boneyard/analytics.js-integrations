
describe('Bing Ads', function(){

  var Bing = require('integrations/lib/bing-ads');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var bing;

  var settings = {
    siteId: 'fd080b41-0f80-421d-9f12-d6ba437e206d',
    domainId: '2823204',
    goals: {
      signup: 1,
      login: 2,
      play: 3
    }
  };

  beforeEach(function(){
    analytics.use(Bing);
    bing = new Bing.Integration(settings);
    bing.initialize();
  })

  it('should have the correct settings', function(){
    test(bing)
      .name('Bing Ads')
      .readyOnInitialize()
      .option('siteId', '')
      .option('goals', {})
      .option('domainId', '');
  })

  describe('#track', function(){
    before(function(){
      sinon.spy(Bing, 'load');
    })

    afterEach(function(){
      Bing.load.reset();
    })

    it('should not send if goal is not defined', function(){
      test(bing).track('toString', {});
      assert(!Bing.load.called);
    })

    it('should send goal if found', function(){
      test(bing)
        .track('signup', {})
        .called(Bing.load)
        .with(1, undefined, settings);
    })

    it('should send correctly', function(){
      test(bing).track('play', { revenue: 90 });
      var iframe = Bing.load.returnValues[0];
      assert(iframe);
      assert(iframe.src = 'http://flex.msn.com/mstag/tag/' + settings.siteId
        + '/analytics.html'
        + '?domainId=' + settings.domainId
        + '&revenue=90'
        + '&actionId=3'
        + '&dedup=1'
        + '&type=1');
    })
  })

})

