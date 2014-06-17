
var tester = require('analytics.js-integration-tester');
var analytics = require('analytics.js');
var AdWords = require('./index');
var assert = require('assert');

describe('AdWords', function(){
  var adwords;
  var test;
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
    test = tester(adwords);
  });

  it('should have the correct settings', function(){
    test
      .name('AdWords')
      .readyOnLoad()
      .option('conversionId', '')
      .option('remarketing', false)
      .option('events', {});
  });

  describe('#load', function(){
    beforeEach(function(){
      test.load.restore();
    });

    it('should load', function(done){
      test.load(done);
    });
  });

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
    });
  });

  describe('#page', function(){
    beforeEach(function(done){
      adwords.on('ready', done);
      sinon.spy(adwords, 'remarketing');
      sinon.spy(adwords, 'globalize');
      adwords.initialize();
    });

    it('should not load remarketing if option is not on', function(){
      test
        .page()
        .called(adwords.remarketing);
    });

    it('should load remarketing if option is on', function(){
      adwords.options.remarketing = true;
      test
        .page()
        .calledOnce(adwords.remarketing);
    });
  });

  describe('#track', function(){
    beforeEach(function(done){
      adwords.on('ready', done);
      sinon.spy(adwords, 'conversion');
      adwords.initialize();
    });

    it('should not send if event is not defined', function(){
      test
        .track('toString', {})
        .called(adwords.conversion);
    });

    it('should send event if its defined', function(){
      test
        .track('signup', {})
        .called(adwords.conversion, {
          conversionId: adwords.options.conversionId,
          label: adwords.options.events.signup,
          value: 0
        });
    });

    it('should send revenue', function(){
      test
        .track('login', { revenue: 90 })
        .called(adwords.conversion, {
          conversionId: adwords.options.conversionId,
          label: adwords.options.events.login,
          value: 90
        });
    })
  })
})
