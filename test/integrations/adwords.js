
describe('AdWords', function(){

  var AdWords = require('integrations/lib/adwords');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');

  var settings = {
    conversionId: 978352801,
    events: {
      signup: '-kGkCJ_TsgcQofXB0gM',
      login: 'QbThCM_zogcQofXB0gM',
      play: 'b91fc77f'
    }
  };

  beforeEach(function(){
    analytics.use(AdWords);
    adwords = new AdWords.Integration(settings);
  })

  it('should have the correct settings', function(){
    test(adwords)
      .name('AdWords')
      .readyOnLoad()
      .option('conversionId', '')
      .option('remarketing', false)
      .option('events', {});
  })

  describe('#load', function(){
    it('should load', function(done){
      adwords.load(function(){ done(); });
    })
  })

  describe('#conversion', function(){
    beforeEach(function(){
      var els = document.getElementsByTagName('img');
      for (var i = 0; i < els.length; ++i) {
        if (!els[i].src) continue;
        if (/googleadservices/.test(els[i].src)) continue;
        els[i].parentNode.removeChild(els[i]);
      }

      sinon.spy(adwords, 'globalize');
    })

    it('should set globals correctly', function(done){
      adwords.conversion({ conversionId: 1, label: 'baz', value: 9 }, function(){
        assert(adwords.globalize.calledWith({
          google_conversion_id: 1,
          google_conversion_language: 'en',
          google_conversion_format: '3',
          google_conversion_color: 'ffffff',
          google_conversion_label: 'baz',
          google_conversion_value: 9,
          google_remarketing_only: false
        }));

        done();
      });
    })
  })

  describe('#page', function(){
    beforeEach(function(done){
      adwords.on('ready', done);
      sinon.spy(adwords, 'remarketing');
      sinon.spy(adwords, 'globalize');
      adwords.initialize();
    })

    it('should not load remarketing if option is not on', function(){
      test(adwords).page();
      assert(!adwords.remarketing.called);
    })

    it('should load remarketing if option is on', function(){
      adwords.options.remarketing = true;
      test(adwords).page();
      assert(adwords.remarketing.calledOnce);
    })
  })

  describe('#track', function(){
    beforeEach(function(done){
      adwords.on('ready', done);
      sinon.spy(adwords, 'conversion');
      adwords.initialize();
    })

    it('should not send if event is not defined', function(){
      test(adwords).track('toString', {});
      assert(!adwords.conversion.called);
    })

    it('should send event if its defined', function(){
      test(adwords).track('signup', {});
      assert(adwords.conversion.calledWith({
        conversionId: adwords.options.conversionId,
        label: adwords.options.events.signup,
        value: 0,
      }))
    })

    it('should send revenue', function(){
      test(adwords).track('login', { revenue: 90 });
      assert(adwords.conversion.calledWith({
        conversionId: adwords.options.conversionId,
        label: adwords.options.events.login,
        value: 90
      }));
    })
  })
})
