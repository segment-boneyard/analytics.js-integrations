
describe('Frontleaf', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var Frontleaf = require('integrations/lib/frontleaf');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var intervals = require('clear-intervals');
  var timeouts = require('clear-timeouts');
  var equals = require('equals');
  var is = require('is');

  var frontleaf;
  var settings = {
    baseUrl: 'https://demo.frontleaf.com',
    token: 'alHTmBjMiewZnPLycFeBQxaidbBeouXG',
    stream: 'segment.io'
  };

  beforeEach(function () {
    analytics.use(Frontleaf);
    frontleaf = new Frontleaf.Integration(settings);
    frontleaf.initialize(); // noop
  });

  afterEach(function() {
    frontleaf.reset();
  })

  it('should have the right settings', function () {
    test(frontleaf)
      .name('Frontleaf')
      .assumesPageview()
      .readyOnInitialize()
      .global('_fl')
      .global('_flBaseUrl')
      .option('token', '')
      .option('stream', '');
  });

  describe('#initialize', function () {
    beforeEach(function () {
      frontleaf.load = sinon.spy();
    });

    it('should create window._fl', function () {
      assert(!window._fl);
      frontleaf.initialize();
      assert(is.array(window._fl));
    });

    it('should create window._flBaseUrl', function () {
      assert(!window._flBaseUrl);
      frontleaf.initialize();
      assert(window._flBaseUrl);
      assert(window._flBaseUrl === settings.baseUrl);
    });

    it('should call #load', function () {
      frontleaf.initialize();
      assert(frontleaf.load.called);
    });
  });

  describe('#load', function () {
    beforeEach(function () {
      var loadStub = sinon.stub(frontleaf, 'load');
      frontleaf.initialize();
      loadStub.restore();
    });

    it('should load fl library', function (done) {
      assert(is.array(window._fl));
      assert(!window._fl.ready);

      frontleaf.load(function (err) {
        if (err) return done(err);
        assert(window._fl.ready, 'Expected window._fl to be ready');
        done();
      });
    });
  });

  describe('#loaded', function () {
    it('should test window._fl and window._fl.ready', function () {
      window._fl = undefined;
      assert(!frontleaf.loaded());

      window._fl = document.createElement('div');
      assert(!frontleaf.loaded());

      window._fl = {};
      assert(!frontleaf.loaded());

      window._fl.ready = true;
      assert(!frontleaf.loaded());

      window._fl = [];
      window._fl.ready = true;
      assert(frontleaf.loaded());
    });
  });

  describe('#identify', function () {
    beforeEach(function (done) {
      frontleaf.initialize();
      frontleaf.load(function (err) {
        if (err) return done(err);
        sinon.spy(frontleaf, '_push');
        window._fl.push = sinon.spy();
        done();
      });
    });

    it('should not send without an id', function () {
      test(frontleaf).identify();
      assert(!frontleaf._push.called);
    });

    it('should call setUser', function () {
      test(frontleaf).identify('id');
      assert(frontleaf._push.calledWith('setUser',
          sinon.match.has('id', 'id').and(sinon.match.has('data', {}))));

      // token and stream calls occur prior to spy
      assert(window._fl.push.calledOnce, 'Incorrect call count');
    });

    it('should send traits', function () {
      test(frontleaf).identify('id2', { email: 'test+segmentio@frontleaf.com' });
      assert(frontleaf._push.calledWith('setUser',
          sinon.match.has('id', 'id2').and(sinon.match.has('data', {
            email: 'test+segmentio@frontleaf.com'
          }))));
    });

    it('should send name', function () {
      test(frontleaf).identify('id3', { firstName: 'Missy', lastName: 'Tester' });
      assert(frontleaf._push.calledWith('setUser',
          sinon.match.has('id', 'id3').and(sinon.match.has('name', 'Missy Tester'))));

      test(frontleaf).identify('id4', { name: 'Missy Tester' });
      assert(frontleaf._push.calledWith('setUser',
          sinon.match.has('id', 'id4').and(sinon.match.has('name', 'Missy Tester'))));

      test(frontleaf).identify('id4', { username: 'Missy_Tester' });
      assert(frontleaf._push.calledWith('setUser',
          sinon.match.has('id', 'id4').and(sinon.match.has('name', 'Missy_Tester'))));
    });
  });

  describe('#group', function () {
    beforeEach(function (done) {
      frontleaf.initialize();
      frontleaf.load(function (err) {
        if (err) return done(err);
        sinon.spy(frontleaf, '_push');
        window._fl.push = sinon.spy();
        done();
      });
    });

    it('should not send without an id', function () {
      test(frontleaf).group();
      assert(!frontleaf._push.called);
    });

    it('should call setAccount', function () {
      test(frontleaf).group('id');
      assert(frontleaf._push.calledWith('setAccount',
          sinon.match.has('id', 'id').and(sinon.match.has('data', {}))));

      // token and stream calls occur prior to spy
      assert(window._fl.push.calledOnce, 'Incorrect call count');
    });

    it('should send traits', function () {
      test(frontleaf).group('id2', { industry: 'transportation' });
      assert(frontleaf._push.calledWith('setAccount',
          sinon.match.has('id', 'id2').and(sinon.match.has('data', {
            industry: 'transportation'
          }))));
    });

    it('should send name', function () {
      test(frontleaf).group('id4', { name: 'Zipcar' });
      assert(frontleaf._push.calledWith('setAccount',
          sinon.match.has('id', 'id4').and(sinon.match.has('name', 'Zipcar'))));
    });
  });

  describe('#track', function () {
    beforeEach(function (done) {
      frontleaf.initialize();
      frontleaf.load(function (err) {
        if (err) return done(err);
        sinon.spy(frontleaf, '_push');
        window._fl.push = sinon.spy();
        done();
      });
    });

    it('should not send without an event (text)', function () {
      test(frontleaf).track();
      assert(!frontleaf._push.called);
    });

    it('should call event', function () {
      test(frontleaf).track('id');
      assert(frontleaf._push.calledWith('event', 'id', {}));

      // token and stream calls occur prior to spy
      assert(window._fl.push.calledOnce, 'Incorrect call count');
    });

    it('should send traits', function () {
      test(frontleaf).track('id2', { amount: 125 });
      assert(frontleaf._push.calledWith('event', 'id2', { amount: 125 }));
    });
  });

});
