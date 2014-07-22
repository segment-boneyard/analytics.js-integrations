
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var date = require('load-date');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Pingdom', function(){
  var Pingdom = plugin;
  var pingdom;
  var analytics;
  var options = {
    id: '5168f8c6abe53db732000000'
  };

  beforeEach(function(){
    analytics = new Analytics;
    pingdom = new Pingdom(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(pingdom);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    pingdom.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Pingdom, integration('Pingdom')
      .assumesPageview()
      .global('_prum')
      .global('PRUM_EPISODES')
      .option('id', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(pingdom, 'load');
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(pingdom.load);
      });

      it('should push the id onto window._prum', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._prum[0], [ 'id', options.id ]);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(pingdom, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    it('should mark the first byte', function(){
      analytics.equal(date.getTime(), window.PRUM_EPISODES.marks.firstbyte);
    });
  });
});