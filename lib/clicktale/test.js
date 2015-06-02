
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var ClickTale = require('./');

describe('ClickTale', function() {
  var analytics;
  var clicktale;
  var options = {
    partitionId: 'www14',
    projectId: '19370',
    recordingRatio: '0.0089'
  };

  beforeEach(function() {
    analytics = new Analytics();
    clicktale = new ClickTale(options);
    analytics.use(ClickTale);
    analytics.use(tester);
    analytics.add(clicktale);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    clicktale.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(ClickTale, integration('ClickTale')
      .assumesPageview()
      .global('WRInitTime')
      .global('ClickTale')
      .option('httpCdnUrl', 'http://s.clicktale.net/WRe0.js')
      .option('httpsCdnUrl', '')
      .option('projectId', '')
      .option('recordingRatio', 0.01)
      .option('partitionId', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(clicktale, 'load');
    });

    describe('#initialize', function() {
      it('should store the load time', function() {
        analytics.assert(!window.WRInitTime);
        analytics.initialize();
        analytics.page();
        analytics.equal('number', typeof window.WRInitTime);
      });

      it('should append the clicktale div', function() {
        analytics.initialize();
        analytics.page();
        analytics.assert(document.getElementById('ClickTaleDiv'));
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(clicktale, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window, 'ClickTaleSetUID');
        analytics.stub(window, 'ClickTaleField');
      });

      it('should send an id', function() {
        analytics.identify('id');
        analytics.called(window.ClickTaleSetUID, 'id');
      });

      it('should send traits', function() {
        analytics.identify({ trait: true });
        analytics.called(window.ClickTaleField, 'trait', true);
      });

      it('should send an id and traits', function() {
        analytics.identify('id', { trait: true });
        analytics.called(window.ClickTaleSetUID, 'id');
        analytics.called(window.ClickTaleField, 'trait', true);
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window, 'ClickTaleEvent');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called(window.ClickTaleEvent, 'event');
      });
    });
  });
});
