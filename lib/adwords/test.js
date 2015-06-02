
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var AdWords = require('./');
var sandbox = require('clear-env');

describe('AdWords', function() {
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

  beforeEach(function() {
    analytics = new Analytics();
    adwords = new AdWords(options);
    analytics.use(AdWords);
    analytics.use(tester);
    analytics.add(adwords);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    adwords.reset();
    sandbox();
  });

  it('should have the correct settings', function() {
    analytics.compare(AdWords, integration('AdWords')
      .option('conversionId', '')
      .option('remarketing', false)
      .mapping('events'));
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function() {
      beforeEach(function() {
        analytics.stub(window, 'google_trackConversion');
      });

      it('should not load remarketing if option is not on', function() {
        adwords.options.remarketing = false;
        analytics.page();
        analytics.called(window.google_trackConversion, {
          google_conversion_id: options.conversionId,
          google_custom_params: {},
          google_remarketing_only: false
        });
      });

      it('should load remarketing if option is on', function() {
        adwords.options.remarketing = true;
        analytics.page();
        analytics.called(window.google_trackConversion, {
          google_conversion_id: options.conversionId,
          google_custom_params: {},
          google_remarketing_only: true
        });
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window, 'google_trackConversion');
      });

      it('should not send if event is not defined', function() {
        analytics.track('toString', {});
        analytics.didNotCall(window.google_trackConversion);
      });

      it('should send event if it is defined', function() {
        analytics.track('signup', {});
        analytics.called(window.google_trackConversion, {
          google_conversion_id: options.conversionId,
          google_custom_params: {},
          google_conversion_language: 'en',
          google_conversion_format: '3',
          google_conversion_color: 'ffffff',
          google_conversion_label: options.events.signup,
          google_conversion_value: 0,
          google_remarketing_only: false
        });
      });

      it('should support array events', function() {
        adwords.options.events = [{ key: 'login', value: 'QbThCM_zogcQofXB0gM' }];
        analytics.track('login');
        analytics.called(window.google_trackConversion, {
          google_conversion_id: options.conversionId,
          google_custom_params: {},
          google_conversion_language: 'en',
          google_conversion_format: '3',
          google_conversion_color: 'ffffff',
          google_conversion_label: adwords.options.events[0].value,
          google_conversion_value: 0,
          google_remarketing_only: false
        });
      });

      it('should send revenue', function() {
        analytics.track('login', { revenue: 90 });
        analytics.called(window.google_trackConversion, {
          google_conversion_id: options.conversionId,
          google_custom_params: {},
          google_conversion_language: 'en',
          google_conversion_format: '3',
          google_conversion_color: 'ffffff',
          google_conversion_label: options.events.login,
          google_conversion_value: 90,
          google_remarketing_only: false
        });
      });

      it('should always send remarketing_only false', function() {
        adwords.options.remarketing = true;
        analytics.track('login', { revenue: 90 });
        analytics.called(window.google_trackConversion, {
          google_conversion_id: options.conversionId,
          google_custom_params: {},
          google_conversion_language: 'en',
          google_conversion_format: '3',
          google_conversion_color: 'ffffff',
          google_conversion_label: options.events.login,
          google_conversion_value: 90,
          google_remarketing_only: false
        });
      });
    });
  });
});
