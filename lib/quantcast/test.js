
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Quantcast', function(){
  var Quantcast = plugin;
  var quantcast;
  var analytics;
  var options = {
    pCode: 'p-ZDsjJUtp583Se'
  };

  beforeEach(function(){
    analytics = new Analytics;
    quantcast = new Quantcast(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(quantcast);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    quantcast.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Quantcast, integration('Quantcast')
      .assumesPageview()
      .global('_qevents')
      .global('__qc')
      .option('pCode', null)
      .option('advertise', false));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(quantcast, 'load');
    });

    describe('#initialize', function(){
      it('should push the pCode', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(window._qevents[0].qacct === options.pCode);
      });

      it('should push the user id', function(){
        analytics.user().identify('id');
        analytics.initialize();
        analytics.page();
        analytics.assert(window._qevents[0].uid === 'id');
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(quantcast.load);
      });

      it('should push "refresh" with labels when given a page', function(){
        analytics.initialize();
        analytics.page('category', 'name');
        var pushed = window._qevents[0];
        analytics.assert(options.pCode == pushed.qacct);
        analytics.assert(null == pushed.event);
        analytics.assert('page.category.name' == pushed.labels);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(quantcast, done);
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
        analytics.stub(window._qevents, 'push');
      });

      it('should push a refresh event with pCode', function(){
        analytics.page();
        analytics.called(window._qevents.push, {
          event: 'refresh',
          labels: 'page.',
          qacct: options.pCode
        });
      });

      it('should push the page name as a label', function(){
        analytics.page('Page Name');
        analytics.called(window._qevents.push, {
          event: 'refresh',
          labels: 'page.Page Name',
          qacct: options.pCode
        });
      });

      it('should push the page name as a label without commas', function(){
        analytics.page('Page, Name');
        analytics.called(window._qevents.push, {
          event: 'refresh',
          labels: 'page.Page,Name',
          qacct: options.pCode
        });
      });

      it('should push the page category and name as labels', function(){
        analytics.page('Category', 'Page');
        analytics.called(window._qevents.push, {
          event: 'refresh',
          labels: 'page.Category.Page',
          qacct: options.pCode
        });
      });

      it('should add the properties labels to the label string', function(){
        analytics.page('Category', 'Page', { label: 'TestLabel' });
        analytics.called(window._qevents.push, {
          event: 'refresh',
          labels: 'page.Category.Page.TestLabel',
          qacct: options.pCode
        });
      });

      it('should push the user id', function(){
        analytics.user().identify('id');
        analytics.page();
        analytics.called(window._qevents.push, {
          event: 'refresh',
          labels: 'page.',
          qacct: options.pCode,
          uid: 'id'
        });
      });

      describe('when advertise is true', function(){
        it('should prefix with _fp.event', function(){
          quantcast.options.advertise = true;
          analytics.page('Page Name');
          analytics.called(window._qevents.push, {
            event: 'refresh',
            labels: '_fp.event.Page Name',
            qacct: options.pCode
          });
        });

        it('should send category and name', function(){
          quantcast.options.advertise = true;
          analytics.page('Category Name', 'Page Name');
          analytics.called(window._qevents.push, {
            event: 'refresh',
            labels: '_fp.event.Category Name Page Name',
            qacct: options.pCode
          });
        });
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._qevents, 'push');
      });

      afterEach(function(){
        analytics.restore();
      });

      it('should update the user id', function(){
        analytics.identify('id');
        analytics.assert(window._qevents[0].uid === 'id');
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._qevents, 'push');
      });

      it('should push a click event', function(){
        analytics.track('event');
        analytics.called(window._qevents.push, {
          event: 'click',
          labels: 'event.event',
          qacct: options.pCode
        });
      });

      it('should push revenue for the event', function(){
        analytics.track('event', { revenue: 10.45 });
        analytics.called(window._qevents.push, {
          event: 'click',
          labels: 'event.event',
          qacct: options.pCode,
          revenue: '10.45'
        });
      });

      it('should push custom labels for the event', function(){
        analytics.track('event', { label: 'newLabel,OtherLables' });
        analytics.called(window._qevents.push, {
          event: 'click',
          labels: 'event.event.newLabel,OtherLables',
          qacct: options.pCode
        });
      });

      it('should push the user id', function(){
        analytics.user().identify('id');
        analytics.track('event');
        analytics.called(window._qevents.push, {
          event: 'click',
          labels: 'event.event',
          qacct: options.pCode,
          uid: 'id'
        });
      });

      it('should push the orderid', function(){
        analytics.track('event', { orderId: '123' });
        analytics.called(window._qevents.push, {
          event: 'click',
          labels: 'event.event',
          qacct: options.pCode,
          orderid: '123'
        });
      });

      it('should handle completed order events', function(){
        analytics.track('completed order', {
          orderId: '780bc55',
          category: 'tech',
          total: 99.99,
          shipping: 13.99,
          tax: 20.99,
          products: [{
            quantity: 1,
            price: 24.75,
            name: 'my product',
            sku: 'p-298'
          }, {
            quantity: 3,
            price: 24.75,
            name: 'other product',
            sku: 'p-299'
          }]
        });
        analytics.called(window._qevents.push, {
          event: 'refresh',
          labels: 'event.completed order',
          orderid: '780bc55',
          qacct: options.pCode,
          revenue: '99.99'
        });
      });

      it('should handle completed order events', function(){
        analytics.track('completed order', {
          orderId: '780bc55',
          category: 'tech',
          total: 99.99,
          shipping: 13.99,
          repeat: true,
          tax: 20.99,
          products: [{
            quantity: 1,
            price: 24.75,
            name: 'my product',
            sku: 'p-298'
          }, {
            quantity: 3,
            price: 24.75,
            name: 'other product',
            sku: 'p-299'
          }]
        });
        analytics.called(window._qevents.push, {
          event: 'refresh',
          labels: 'event.completed order.New',
          orderid: '780bc55',
          qacct: options.pCode,
          revenue: '99.99'
        });
      });

      describe('when advertise is true', function(){
        it('should prefix with _fp.event', function(){
          quantcast.options.advertise = true;
          analytics.track('event');
          analytics.called(window._qevents.push, {
            event: 'click',
            labels: '_fp.event.event',
            qacct: options.pCode
          });
        });

        it('should handle completed order events', function(){
          quantcast.options.advertise = true;
          analytics.track('completed order', {
            orderId: '780bc55',
            category: 'tech',
            total: 99.99,
            shipping: 13.99,
            tax: 20.99,
            products: [{
              quantity: 1,
              price: 24.75,
              name: 'my product',
              sku: 'p-298'
            }, {
              quantity: 3,
              price: 24.75,
              name: 'other product',
              sku: 'p-299'
            }]
          });
          analytics.called(window._qevents.push, {
            event: 'refresh',
            labels: '_fp.event.completed order,_fp.pcat.tech',
            orderid: '780bc55',
            qacct: options.pCode,
            revenue: '99.99'
          });
        });
      });
    });
  });
});