
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Ramen = require('./');

describe('Ramen', function(){
  var analytics;
  var ramen;
  var options = {
    organization_id: '6389149'
  };

  beforeEach(function(){
    analytics = new Analytics();
    ramen = new Ramen(options);
    analytics.use(Ramen);
    analytics.use(tester);
    analytics.add(ramen);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    ramen.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Ramen, integration('Ramen')
      .global('Ramen')
      .global('ramenSettings')
      .option('organization_id', '')
      .tag('<script src="//cdn.ramen.is/assets/ramen.js">'));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(ramen, 'load');
    });

    describe('#initialize', function(){
      it('should not create window.Ramen', function(){
        analytics.assert(!window.ramenSettings);
        analytics.assert(!window.Ramen);
        analytics.initialize();
        analytics.page();
        analytics.assert(!window.ramenSettings);
        analytics.assert(!window.Ramen);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(ramen.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(ramen, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#group', function() {
      beforeEach(function(){
        analytics.stub(window.Ramen, 'go');
      });

      it('should not call Ramen.go if ramenSettings is blank', function(){
        analytics.group('id');
        analytics.assert(!window.ramenSettings);
        analytics.didNotCall(window.Ramen.go);
      });

      it('should set company ID & call Ramen.go() if ramenSettings exists', function() {
        window.ramenSettings = {
          organization_id: '1234567890',
          user: {email: 'ryan@ramen.is', name: 'Ryan', id: '1234'}
        };

        analytics.group('id');
        analytics.assert(window.ramenSettings.company.id === 'id');
        analytics.called(window.Ramen.go);
      });

      it('should set company traits & call Ramen.go()', function() {
        window.ramenSettings = {
          organization_id: '1234567890',
          user: {email: 'ryan@ramen.is', name: 'Ryan', id: '1234'}
        };

        analytics.group('id', {
          createdAt: 'February 13, 2009 11:31:30 PM',
          name: 'Pied Piper',
          url: 'http://piedpiper.com'
        });

        analytics.assert(window.ramenSettings.company.id === 'id');
        analytics.assert(window.ramenSettings.company.name === 'Pied Piper');
        analytics.assert(window.ramenSettings.company.url === 'http://piedpiper.com');
        analytics.assert(window.ramenSettings.company.created_at === 1234567890);
        analytics.called(window.Ramen.go);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.Ramen, 'go');
      });

      it('should not call Ramen.go if only id is passed', function(){
        analytics.identify('id');
        analytics.assert(!window.ramenSettings);
        analytics.didNotCall(window.Ramen.go);

        analytics.identify('id');
        analytics.assert(!window.ramenSettings);
        analytics.didNotCall(window.Ramen.go);
      });

      it('should call Ramen.go and set correct attributes if just email passed', function(){
        var email = 'email@example.com';
        analytics.identify('id', { email: email });
        analytics.assert(window.ramenSettings.organization_id === '6389149');
        analytics.assert(window.ramenSettings.user.id === 'id');
        analytics.assert(window.ramenSettings.user.name === email);
        analytics.assert(window.ramenSettings.user.email === email);
        analytics.called(window.Ramen.go);
      });

      it('should call Ramen.go and set correct attributes if email & name passed', function(){
        var email = 'email@example.com';
        var name = 'ryan+segment@ramen.is';
        analytics.identify('id', { email: email, name: name });
        analytics.assert(window.ramenSettings.organization_id === '6389149');
        analytics.assert(window.ramenSettings.user.id === 'id');
        analytics.assert(window.ramenSettings.user.name === name);
        analytics.assert(window.ramenSettings.user.email === email);
        analytics.called(window.Ramen.go);
      });

      it('should pass along company traits', function() {
        var email = 'email@example.com';
        var name = 'ryan+segment@ramen.is';
        var company = {
          name: 'Pied Piper, Inc.',
          url: 'http://piedpiper.com',
          id: '987',
          createdAt: 'February 13, 2009 11:31:30 PM'
        };

        analytics.identify('19', {email: email, name: name, company: company});

        var rs_company = window.ramenSettings.company;
        analytics.assert(rs_company.name === 'Pied Piper, Inc.');
        analytics.assert(rs_company.url === 'http://piedpiper.com');
        analytics.assert(rs_company.id === '987');
        analytics.assert(rs_company.created_at === 1234567890);
      });

      it('should pass along integration options', function(){
        var email = 'email@example.com';
        var name = 'ryan+segment@ramen.is';
        var auth_hash = 'authy_hasy';
        var auth_hash_timestamp = new Date() / 1000;
        var custom_links = [{href: 'https://ramen.is/support', title: 'Hello'}];
        var labels = ['use', 'ramen!'];
        var environment = 'staging';
        var logged_in_url = 'https://align.ramen.is/manage';
        var unknown_future_opt = '11';
        var unknown_future_user_opt = 'user 11';

        analytics.identify('id', {email: email, name: name},
          {
            integrations: {
              Ramen: {
                unknown_future_opt: unknown_future_opt,
                environment: environment,
                auth_hash_timestamp: auth_hash_timestamp,
                auth_hash: auth_hash,
                custom_links: custom_links,
                user: {
                  unknown_future_user_opt: unknown_future_user_opt,
                  labels: labels,
                  logged_in_url: logged_in_url
                }
              }
            }
          }
        );

        analytics.assert(window.ramenSettings.environment === environment);
        analytics.assert(window.ramenSettings._partner === 'segment.com');
        analytics.assert(window.ramenSettings.auth_hash === auth_hash);
        analytics.assert(window.ramenSettings.unknown_future_opt === unknown_future_opt);
        analytics.assert(window.ramenSettings.timestamp === auth_hash_timestamp);
        analytics.assert(window.ramenSettings.user.unknown_future_user_opt === unknown_future_user_opt);
        analytics.assert(window.ramenSettings.user.labels.length === 2);
        analytics.assert(window.ramenSettings.user.logged_in_url === logged_in_url);
        analytics.assert(window.ramenSettings.custom_links[0].title === 'Hello');
      });
    });
  });
});
