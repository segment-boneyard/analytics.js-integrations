
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('AdWords', function(){
  var AdWords = plugin;
  var adwords;
  var analytics;
  var options = {
    conversionId: 978352801,
    events: {
      signup: '-kGkCJ_TsgcQofXB0gM',
      login: 'QbThCM_zogcQofXB0gM',
      play: 'b91fc77f'
    }
  };

  beforeEach(function(){
    analytics = new Analytics;
    adwords = new AdWords(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(adwords);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    adwords.reset();
    sandbox();
  });

  it('should have the correct settings', function(){
    analytics.compare(AdWords, integration('AdWords')
      .option('conversionId', '')
      .option('remarketing', false)
      .option('events', {}));
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#conversion', function(){
      beforeEach(function(){
        // remove adwords pixels
        var els = document.getElementsByTagName('img');
        for (var i = 0; i < els.length; ++i) {
          if (!els[i].src) continue;
          if (/googleadservices/.test(els[i].src)) continue;
          els[i].parentNode.removeChild(els[i]);
        }

        analytics.stub(adwords, 'globalize');
      });

      it('should set globals correctly', function(done){
        adwords.conversion({ conversionId: 1, label: 'baz', value: 9 }, function(){
          analytics.called(adwords.globalize, {
            google_conversion_id: 1,
            google_conversion_language: 'en',
            google_conversion_format: '3',
            google_conversion_color: 'ffffff',
            google_conversion_label: 'baz',
            google_conversion_value: 9,
            google_remarketing_only: false
          });

          done();
        });
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(adwords, 'remarketing');
        analytics.stub(adwords, 'globalize');
      });

      it('should not load remarketing if option is not on', function(){
        analytics.page();
        analytics.didNotCall(adwords.remarketing);
      });

      it('should load remarketing if option is on', function(){
        adwords.options.remarketing = true;
        analytics.page();
        analytics.calledOnce(adwords.remarketing);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(adwords, 'conversion');
      });

      it('should not send if event is not defined', function(){
        analytics.track('toString', {});
        analytics.didNotCall(adwords.conversion);
      });

      it('should send event if its defined', function(){
        analytics.track('signup', {});
        analytics.called(adwords.conversion, {
          conversionId: adwords.options.conversionId,
          label: adwords.options.events.signup,
          value: 0,
        });
      });

      it('should send revenue', function(){
        analytics.track('login', { revenue: 90 });
        analytics.called(adwords.conversion, {
          conversionId: adwords.options.conversionId,
          label: adwords.options.events.login,
          value: 90
        });
      });
    });
  });
});