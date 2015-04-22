
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Facebook Conversion Tracking', function(){
  var Facebook = plugin;
  var facebook;
  var analytics;
  var options = {
    events: {
      signup: 0,
      login: 1,
      play: 2,
      'Loaded a Page': 3,
      'Viewed Name Page': 4,
      'Viewed Category Name Page': 5,
      'Viewed Product Category': 'Viewed Product Category',
      'Viewed Product': 'Viewed Product',
      'Added Product': 'Added Product',
      'Completed Order': 'Completed Order'
    }
  };

  beforeEach(function(){
    analytics = new Analytics;
    facebook = new Facebook(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(facebook);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    facebook.reset();
    sandbox();
  });

  it('should have the correct settings', function(){
    analytics.compare(Facebook, integration('Facebook Conversion Tracking')
      .option('currency', 'USD')
      .mapping('events'));
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(facebook, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window._fbq, 'push');
      });

      it('should track unnamed/categorized page', function(){
        analytics.page({ url: 'http://localhost:34448/test/' });
        analytics.called(window._fbq.push, ['track', 3, {
          currency: 'USD',
          value: '0.00'
        }]);
      });

      it('should track un-categorized page', function(){
        analytics.page('Name', { url: 'http://localhost:34448/test/' });
        analytics.called(window._fbq.push, ['track', 4, {
          currency: 'USD',
          value: '0.00'
        }]);
      });

      it('should track page view with fullname', function(){
        analytics.page('Category', 'Name', { url: 'http://localhost:34448/test/' });
        analytics.called(window._fbq.push, ['track', 5, {
          currency: 'USD',
          value: '0.00'
        }]);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._fbq, 'push');
      });

      it('should send event if found', function(){
        analytics.track('signup', {});
        analytics.called(window._fbq.push, ['track', 0, {
          currency: 'USD',
          value: '0.00'
        }]);
      });

      it('should support array events', function(){
        facebook.options.events = [{ key: 'event', value: 4 }];
        analytics.track('event');
        analytics.called(window._fbq.push, ['track', 4, {
          currency: 'USD',
          value: '0.00'
        }]);
      });

      it('should send revenue', function(){
        analytics.track('login', { revenue: '$50' });
        analytics.called(window._fbq.push, ['track', 1, {
          value: '50.00',
          currency: 'USD'
        }]);
      });

      it('should send ecommerce event - Viewed Product Category', function(){
        analytics.track('Viewed Product Category', { category: 'Games' });
        analytics.called(window._fbq.push, ['track', 'ViewContent', {
          content_ids: ['Games'],
          content_type: 'product_group'
        }]);
      });

      it('should send ecommerce event - Viewed Product', function(){
        analytics.track('Viewed Product', { id: '507f1f77bcf86cd799439011' });
        analytics.called(window._fbq.push, ['track', 'ViewContent', {
          content_ids: ['507f1f77bcf86cd799439011'],
          content_type: 'product'
        }]);
      });

      it('should send ecommerce event - Adding to Cart', function(){
        analytics.track('Added Product', { id: '507f1f77bcf86cd799439011' });
        analytics.called(window._fbq.push, ['track', 'AddToCart', {
          content_ids: ['507f1f77bcf86cd799439011'],
          content_type: 'product'
        }]);
      });

      it('should send ecommerce event - Completing an Order', function(){
        analytics.track('Completed Order', {
          products: [
            { id: '507f1f77bcf86cd799439011' },
            { id: '505bd76785ebb509fc183733' }
          ]
        });
        analytics.called(window._fbq.push, ['track', 'Purchase', {
          content_ids: ['507f1f77bcf86cd799439011', '505bd76785ebb509fc183733'],
          content_type: 'product'
        }]);
      });
    });
  });
});
