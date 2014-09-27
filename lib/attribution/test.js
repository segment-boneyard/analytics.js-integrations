
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Attribution', function () {
  var Attribution = plugin;
  var attribution;
  var analytics;
  var options = {
    projectId: 'projectToken'
  };

  beforeEach(function(){
    analytics = new Analytics;
    attribution = new Attribution(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(attribution);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    attribution.reset();
    sandbox();
  });

  it('has the right settings', function () {
    analytics.compare(Attribution, integration('Attribution')
      .global('_attrq')
      .option('projectId', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(attribution, 'load');
      analytics.initialize();
      analytics.page();
    });

    describe('#initialize', function(){
      it('creates window._attrq', function () {
        analytics.assert(window._attrq instanceof Array);
      });
    });
  });

  describe('loading', function(){
    it('loads', function(done){
      analytics.load(attribution, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._attrq, 'push');
      });

      it('pushes the event', function(){
        analytics.track('event', { x: 10 });
        analytics.called(window._attrq.push, [ 'track', {
          properties: { x: 10 },
          event: 'event',
        } ]);
      });

      it('adds the user_id', function(){
        analytics.user().identify('id');
        analytics.track('event');
        analytics.called(window._attrq.push, [ 'track', {
          properties: {},
          event: 'event',
        }]);
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window._attrq, 'push');
      });

      it('pushes the pageview', function(){
        analytics.page();
        analytics.called(window._attrq.push, [ 'track', {
          event: 'Loaded a Page',
          properties: {
            path: location.pathname,
            title: document.title,
            search: location.search,
            referrer: '',
            url: location.href,
          }
        } ]);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._attrq, 'push');
      });

      it('pushes an identify call', function(){
        analytics.identify('id');
        analytics.called(window._attrq.push, [ 'identify', { user_id: 'id', traits: { id: 'id' } } ]);
      });

      it('appends additional traits', function(){
        analytics.identify('id', { email: 'hello@example.com' });
        analytics.called(window._attrq.push, [ 'identify', { user_id: 'id', traits: { email: 'hello@example.com', id: 'id' } } ]);
      });
    });
  });
});
