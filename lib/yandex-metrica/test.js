
describe('Yandex Metrica', function(){

  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var tick = require('next-tick');
  var Yandex = require('integrations/lib/yandex-metrica');

  var yandex;
  var settings = {
    counterId: 22522351
  };

  beforeEach(function(){
    analytics.use(Yandex);
    yandex = new Yandex.Integration(settings);
    yandex.initialize(); // noop
  });

  afterEach(function(){
    yandex.reset();
    window['yaCounter' + settings.counterId] = undefined;
  });

  it('should have the right settings', function(){
    test(yandex)
      .name('Yandex Metrica')
      .assumesPageview()
      .readyOnInitialize()
      .global('yandex_metrika_callbacks')
      .global('Ya')
      .option('counterId', null);
    });

  describe('#initialize', function(){
    beforeEach(function(){
      yandex.load = sinon.spy();
    });

    it('should push onto the yandex_metrica_callbacks', function(){
      assert(!window.yandex_metrika_callbacks);
      yandex.initialize();
      assert(window.yandex_metrika_callbacks.length === 1);
    });

    it('should call #load', function(){
      yandex.initialize();
      assert(yandex.load.called);
    });
  });

  describe('#loaded', function(){
    it('should test window.Ya.Metrika', function(){
      window.Ya = {};
      assert(!yandex.loaded());
      window.Ya.Metrika = {};
      assert(yandex.loaded());
    });
  });

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(yandex, 'load');
      yandex.initialize();
      yandex.load.restore();
    });

    it('should change loaded state', function (done) {
      assert(!yandex.loaded());
      yandex.load(function (err) {
        if (err) return done(err);
        assert(yandex.loaded());
        done();
      });
    });

    it('should create a yaCounter object', function (done) {
      yandex.load(function (err) {
        if (err) return done(err);
        tick(function(){
          assert(window['yaCounter' + yandex.options.counterId]);
          done();
        });
      });
    });
  });

});
