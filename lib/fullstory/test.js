
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

describe('FullStory', function(){
  var FullStory = plugin;
  var fullstory;
  var analytics;
  var options = {
    fs_org: '1JO'
  };

  beforeEach(function(){
    analytics = new Analytics;
    fullstory = new FullStory(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(fullstory);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    sandbox();
  });

  after(function(){
    fullstory.reset();
  });

  it('should have the right settings', function(){
    analytics.compare(FullStory, integration('FullStory')
      .assumesPageview()
      .option('fs_org', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(window, 'fullstory');
      analytics.stub(fullstory, 'load');
    });

    afterEach(function(){
      fullstory.reset();
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(fullstory.load);
      });

      it('should create the window.FS variable', function(){
        analytics.assert(window.FS);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(fullstory, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });
    
    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.FS, 'identify');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.FS.identify, 'id');
      });
    });
  });

});