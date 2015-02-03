
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
    org: '1JO',
    debug: false
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
    fullstory.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(FullStory, integration('FullStory')
      .option('org', '')
      .option('debug', false));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(fullstory, 'load');
    });

    describe('#initialize', function(){
      it('should create window.FS', function(){
        analytics.assert(!window.FS);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.FS);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(fullstory.load);
      });
    });
  });

  describe('after loading', function(){
    beforeEach(function(){
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.FS, 'identify');
      });

      it('should default to anonymousId', function(){
        analytics.identify();
        analytics.called(window.FS.identify);
      });

      it('should only send strings as the id', function(){
        analytics.identify(1);
        analytics.called(window.FS.identify, '1');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.FS.identify, 'id');
      });

      it('should map name and email', function(){
        analytics.identify('id', { name: 'Test', email: 'test@test.com' });
        analytics.called(window.FS.identify, 'id', { displayName: 'Test', email: 'test@test.com' });
      });

      it('should map name and email for multi word keys/uppercase', function(){
        analytics.identify('id', { name: 'Test', "First Name": "Steven", last: "Miller", "Last Name": "Miller", Email: "test@test.com" });
        analytics.called(window.FS.identify, 'id', { displayName: 'Test', last_str: "Miller", email: 'test@test.com', firstName_str: "Steven", lastName_str: "Miller" });
      });

      it('should map integers properly', function(){
        analytics.identify('id', { name: 'Test', revenue: 7 });
        analytics.called(window.FS.identify, 'id', { displayName: 'Test', revenue_int: 7 });
      });

      it('should map floats properly', function(){
        analytics.identify('id1', { name: 'Example', amtAbandonedInCart: 3.84 });
        analytics.called(window.FS.identify, 'id1', { displayName: 'Example', amtAbandonedInCart_real: 3.84 });
      });

      it('should map dates properly', function(){
        analytics.identify('id2', { name: 'Test123', signupDate: new Date("2014-03-11T13:19:23Z") });
        analytics.called(window.FS.identify, 'id2', { displayName: 'Test123', signupDate_date: new Date("2014-03-11T13:19:23Z") });
      });

      it('should map booleans properly', function(){
        analytics.identify('id3', { name: 'Steven', registered: true });
        analytics.called(window.FS.identify, 'id3', { displayName: 'Steven', registered_bool: true });
      });
    });
  });
});
