
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Parsely = require('./');

/* eslint-disable*/
describe('Parsely', function() {
  var analytics;
  var parsely;
  var options = {
    apikey: 'example.com'
  };

  beforeEach(function() {
    analytics = new Analytics();
    parsely = new Parsely(options);
    analytics.use(Parsely);
    analytics.use(tester);
    analytics.add(parsely);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    parsely.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(Parsely, integration('Parsely')
        .assumesPageview()
        .global('_parsely')
        .global('PARSELY')
        .option('apikey', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(parsely, 'load');
    });

    describe('#initialize', function() {
      it('should create the data-parsely-site div', function () {
        analytics.initialize();
        var div_exists = document.body.innerHTML.indexOf('data-parsely-site' > -1)
        analytics.assert(div_exists);
      });



    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(parsely, done);
    });


  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
      });

      describe('#initialize', function() {
        it('should make sure data-parsely-site was populated correctly', function() {
          var span_exists = document.getElementById('parsely-cfg').getAttribute('data-parsely-site');
          analytics.equal(span_exists, 'example.com');
        });
    });

  });

});
/* eslint-enable */
