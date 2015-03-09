
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');
var equals = require('equals');
var cookie = require('cookie');
var uuid = require('uuid');
var spy = require('segmentio/spy');
var assert = require('component/assert');
var protocol = require('protocol');
var json = require('segmentio/json@1.0.0');
var type = require('component/type@1.0.0');
var store = require('store');

describe('Segment.io', function(){
  var Segment = plugin;
  var segment;
  var analytics;
  var options = {
    apiKey: 'oq0vdlg7yi'
  };

  before(function(){
    // Just to make sure that `cookie()`
    // doesn't throw URIError we add a cookie
    // that will cause `decodeURIComponent()` to throw.
    document.cookie = 'bad=%';
  });

  beforeEach(function(){
    protocol.reset();
    analytics = new Analytics;
    segment = new Segment(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(segment);
    analytics.assert(plugin.global == window);
    resetCookies();
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    resetCookies();
    segment.reset();
    sandbox();
  });

  function resetCookies() {
    store('s:context.referrer', null);
    cookie('s:context.referrer', null, { maxage: -1, path: '/' });
  }

  it('should have the right settings', function(){
    analytics.compare(Segment, integration('Segment.io')
      .option('apiKey', ''));
  });

  it('should always be turned on', function(done){
    var Analytics = analytics.constructor;
    var ajs = new Analytics;
    ajs.use(Segment);
    ajs.initialize({ 'Segment.io': options });
    ajs.ready(function(){
      var segment = ajs._integrations['Segment.io'];
      segment.ontrack = spy();
      ajs.track('event', {}, { All: false });
      assert(segment.ontrack.called);
      done();
    });
  });

  describe('Segment.storage()', function(){
    it('should return cookie() when the protocol isnt file://', function(){
      analytics.assert(Segment.storage(), cookie);
    });

    it('should return store() when the protocol is file://', function(){
      analytics.assert(Segment.storage(), cookie);
      protocol('file:');
      analytics.assert(Segment.storage(), store);
    });

    it('should return store() when the protocol is chrome-extension://', function(){
      analytics.assert(Segment.storage(), cookie);
      protocol('chrome-extension:');
      analytics.assert(Segment.storage(), store);
    });
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(segment, 'load');
    });

    describe('#normalize', function(){
      var object;

      beforeEach(function(){
        segment.cookie('s:context.referrer', null);
        analytics.initialize();
        object = {};
      });

      it('should add .anonymousId', function(){
        analytics.user().anonymousId('anon-id');
        segment.normalize(object);
        analytics.assert('anon-id' == object.anonymousId);
      });

      it('should add .sentAt', function(){
        segment.normalize(object);
        analytics.assert(object.sentAt);
        analytics.assert(type(object.sentAt) == 'date');
      });

      it('should add .userId', function(){
        analytics.user().id('user-id');
        segment.normalize(object);
        analytics.assert('user-id' == object.userId);
      });

      it('should not replace the .userId', function(){
        analytics.user().id('user-id');
        object.userId = 'existing-id';
        segment.normalize(object);
        analytics.assert('existing-id' == object.userId);
      });

      it('should always add .anonymousId even if .userId is given', function(){
        var object = { userId: 'baz' };
        segment.normalize(object);
        analytics.assert(36 == object.anonymousId.length);
      });

      it('should add .context', function(){
        segment.normalize(object);
        analytics.assert(object.context);
      });

      it('should not rewrite context if provided', function(){
        var ctx = {};
        var object = { context: ctx };
        segment.normalize(object);
        analytics.assert(ctx == object.context);
      });

      it('should copy .options to .context', function(){
        var opts = {};
        var object = { options: opts };
        segment.normalize(object);
        analytics.assert(opts == object.context);
        analytics.assert(null == object.options);
      });

      it('should add .writeKey', function(){
        segment.normalize(object);
        analytics.assert(segment.options.apiKey == object.writeKey);
      });

      it('should add .messageId', function(){
        segment.normalize(object);
        analytics.assert(36 == object.messageId.length);
      });

      it('should add .library', function(){
        segment.normalize(object);
        analytics.assert(object.context.library);
        analytics.assert('analytics.js' == object.context.library.name);
        analytics.assert(analytics.VERSION == object.context.library.version);
      });

      it('should allow override of .library', function(){
        var ctx = {
          library: {
            name: 'analytics-wordpress',
            version: '1.0.3'
          }
        };
        var object = { context: ctx };
        segment.normalize(object);
        analytics.assert(object.context.library);
        analytics.assert('analytics-wordpress' == object.context.library.name);
        analytics.assert('1.0.3' == object.context.library.version);
      });

      it('should add .userAgent', function(){
        segment.normalize(object);
        analytics.assert(navigator.userAgent == object.context.userAgent);
      });

      it('should add .campaign', function(){
        plugin.global = { navigator: {}, location: {} };
        plugin.global.location.search = '?utm_source=source&utm_medium=medium&utm_term=term&utm_content=content&utm_campaign=name';
        plugin.global.location.hostname = 'localhost';
        segment.normalize(object);
        analytics.assert(object);
        analytics.assert(object.context);
        analytics.assert(object.context.campaign);
        analytics.assert('source' == object.context.campaign.source);
        analytics.assert('medium' == object.context.campaign.medium);
        analytics.assert('term' == object.context.campaign.term);
        analytics.assert('content' == object.context.campaign.content);
        analytics.assert('name' == object.context.campaign.name);
        plugin.global = window;
      });

      it('should add .referrer.id and .referrer.type', function(){
        plugin.global = { navigator: {}, location: {} };
        plugin.global.location.search = '?utm_source=source&urid=medium';
        plugin.global.location.hostname = 'localhost';
        segment.normalize(object);
        analytics.assert(object);
        analytics.assert(object.context);
        analytics.assert(object.context.referrer);
        analytics.assert('medium' == object.context.referrer.id);
        analytics.assert('millennial-media' == object.context.referrer.type);
        plugin.global = window;
      });

      it('should add .referrer.id and .referrer.type from cookie', function(){
        segment.cookie('s:context.referrer', '{"id":"baz","type":"millennial-media"}');
        plugin.global = { navigator: {}, location: {} };
        plugin.global.location.search = '?utm_source=source';
        plugin.global.location.hostname = 'localhost';
        segment.normalize(object);
        analytics.assert(object);
        analytics.assert(object.context);
        analytics.assert(object.context.referrer);
        analytics.assert('baz' == object.context.referrer.id);
        analytics.assert('millennial-media' == object.context.referrer.type);
        plugin.global = window;
      });

      it('should add .referrer.id and .referrer.type from cookie when no query is given', function(){
        segment.cookie('s:context.referrer', '{"id":"medium","type":"millennial-media"}');
        plugin.global = { navigator: {}, location: {} };
        plugin.global.location.search = '';
        plugin.global.location.hostname = 'localhost';
        segment.normalize(object);
        analytics.assert(object);
        analytics.assert(object.context);
        analytics.assert(object.context.referrer);
        analytics.assert('medium' == object.context.referrer.id);
        analytics.assert('millennial-media' == object.context.referrer.type);
        plugin.global = window;
      });
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
        analytics.stub(segment, 'send');
      });

      it('should send section, name and properties', function(){
        analytics.page('section', 'name', { property: true }, { opt: true });
        var args = segment.send.args[0];
        analytics.assert('/p' == args[0]);
        analytics.assert('name' == args[1].name);
        analytics.assert('section' == args[1].category);
        analytics.assert(true == args[1].properties.property);
        analytics.assert(true == args[1].context.opt);
        analytics.assert(args[1].timestamp);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(segment, 'send');
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true }, { opt: true });
        var args = segment.send.args[0];
        analytics.assert('/i' == args[0]);
        analytics.assert('id' == args[1].userId);
        analytics.assert(true == args[1].traits.trait);
        analytics.assert(true == args[1].context.opt);
        analytics.assert(args[1].timestamp);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(segment, 'send');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { prop: true }, { opt: true });
        var args = segment.send.args[0];
        analytics.assert('/t' == args[0]);
        analytics.assert('event' == args[1].event);
        analytics.assert(true == args[1].context.opt);
        analytics.assert(true == args[1].properties.prop);
        analytics.assert(null == args[1].traits);
        analytics.assert(args[1].timestamp);
      });
    });

    describe('#group', function(){
      beforeEach(function(){
        analytics.stub(segment, 'send');
      });

      it('should send groupId and traits', function(){
        analytics.group('id', { trait: true }, { opt: true });
        var args = segment.send.args[0];
        analytics.assert('/g' == args[0]);
        analytics.assert('id' == args[1].groupId);
        analytics.assert(true == args[1].context.opt);
        analytics.assert(true == args[1].traits.trait);
        analytics.assert(args[1].timestamp);
      });
    });

    describe('#alias', function(){
      beforeEach(function(){
        analytics.stub(segment, 'send');
      });

      it('should send .userId and .previousId', function(){
        analytics.alias('to', 'from');
        var args = segment.send.args[0];
        analytics.assert('/a' == args[0]);
        analytics.assert('from' == args[1].previousId);
        analytics.assert('to' == args[1].userId);
        analytics.assert(args[1].timestamp);
      });

      it('should fallback to user.anonymousId if .previousId is omitted', function(){
        analytics.user().anonymousId('anon-id');
        analytics.alias('to');
        var args = segment.send.args[0];
        analytics.assert('/a' == args[0]);
        analytics.assert('anon-id' == args[1].previousId);
        analytics.assert('to' == args[1].userId);
        analytics.assert(args[1].timestamp);
      });

      it('should fallback to user.anonymousId if .previousId and user.id are falsey', function(){
        analytics.alias('to');
        var args = segment.send.args[0];
        analytics.assert('/a' == args[0]);
        analytics.assert(args[1].previousId);
        analytics.assert(36 == args[1].previousId.length);
        analytics.assert('to' == args[1].userId);
      });

      it('should rename `.from` and `.to` to `.previousId` and `.userId`', function(){
        analytics.alias('user-id', 'previous-id');
        var args = segment.send.args[0];
        analytics.assert('/a' == args[0]);
        analytics.assert('previous-id' == args[1].previousId);
        analytics.assert('user-id' == args[1].userId);
        analytics.assert(null == args[1].from);
        analytics.assert(null == args[1].to);
      });
    });

    describe('#send', function(){
      beforeEach(function(){
        analytics.spy(segment, 'session');
      });

      it('should use http: protocol when http:', function(done){
        protocol('http:');
        segment.send('/i', { userId: 'id' }, function(err, res){
          if (err) return done(err);
          assert.equal('http://api.segment.io/v1/i', res.url);
          done();
        });
      });

      it('should use https: protocol when https:', function(done){
        protocol('https:');
        segment.send('/i', { userId: 'id' }, function(err, res){
          if (err) return done(err);
          assert.equal('https://api.segment.io/v1/i', res.url);
          done();
        });
      });

      it('should use https: protocol when file:', function(done){
        protocol('file:');
        segment.send('/i', { userId: 'id' }, function(err, res){
          if (err) return done(err);
          assert.equal('https://api.segment.io/v1/i', res.url);
          done();
        });
      });

      it('should use https: protocol when chrome-extension:', function(done){
        protocol('chrome-extension:');
        segment.send('/i', { userId: 'id' }, function(err, res){
          if (err) return done(err);
          assert.equal('https://api.segment.io/v1/i', res.url);
          done();
        });
      });

      describe('/g', ensure('/g', { groupId: 'gid', userId: 'uid' }));
      describe('/p', ensure('/p', { userId: 'id', name: 'page', properties: {} }));
      describe('/a', ensure('/a', { userId: 'id', from: 'b', to: 'a' }));
      describe('/t', ensure('/t', { userId: 'id', event: 'my-event', properties: {} }));
      describe('/i', ensure('/i', { userId: 'id' }));
    });

    describe('#cookie', function(){
      beforeEach(function(){
        segment.cookie('foo', null);
      });

      it('should persist the cookie even when the hostname is "dev"', function(){
        plugin.global = { navigator: {}, location: {} };
        plugin.global.location.href = 'https://dev:300/path';
        analytics.assert(null == segment.cookie('foo'));
        segment.cookie('foo', 'bar');
        analytics.assert(segment.cookie('foo') === 'bar');
        plugin.global = window;
      });

      it('should persist the cookie even when the hostname is "127.0.0.1"', function(){
        plugin.global = { navigator: {}, location: {} };
        plugin.global.location.href = 'http://127.0.0.1:3000/';
        analytics.assert(null == segment.cookie('foo'));
        segment.cookie('foo', 'bar');
        analytics.assert(segment.cookie('foo') === 'bar');
        plugin.global = window;
      });

      it('should persist the cookie even when the hostname is "app.herokuapp.com"', function(){
        plugin.global = { navigator: {}, location: {} };
        plugin.global.location.href = 'https://app.herokuapp.com/about';
        plugin.global.location.hostname = 'app.herokuapp.com';
        analytics.assert(null == segment.cookie('foo'));
        segment.cookie('foo', 'bar');
        analytics.assert(segment.cookie('foo') === 'bar');
        plugin.global = window;
      });
    });

    // ensure the given endpoint succeeds with fixture.

    function ensure(endpoint, fixture){
      return function(){
        it('should succeed', function(done){
          segment.send(endpoint, fixture, function(err, req){
            if (err) return done(err);
            analytics.assert(json.parse(req.responseText).success);
            done();
          });
        })
      };
    }
  });
});
