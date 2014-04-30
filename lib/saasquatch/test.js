
describe('SaaSquatch', function(){

  var SaaSquatch = require('integrations/lib/saasquatch');
  var test = require('integration-tester');
  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var sinon = require('sinon');
  var squatch;

  var settings = {
    tenantAlias: 'baz',
    accountId: 'foo'
  };

  beforeEach(function(){
    analytics.use(SaaSquatch);
    squatch = new SaaSquatch.Integration(settings);
    squatch.initialize();
  })

  afterEach(function(){
    squatch.reset();
  })

  it('should have the correct settings', function(){
    test(squatch)
      .name('SaaSquatch')
      .option('tenantAlias', '')
      .global('_sqh');
  })

  describe('#loaded', function(){
    it('should test window._sqh.push', function(){
      window._sqh = [];
      assert(!squatch.loaded());
      window._sqh.push = [].slice;
      assert(squatch.loaded());
    })
  })

  describe('#load', function(){
    beforeEach(function(){
      sinon.stub(squatch, 'load');
      squatch.initialize();
      squatch.load.restore();
    })

    it('should change the loaded state', function(done){
      test(squatch).loads(done);
    })
  })

  describe('#identify', function(){
    beforeEach(function(){
      squatch.initialize();
      window._sqh = [];
      window._sqh.push = sinon.spy();
      sinon.stub(squatch, 'load');
    })

    it('should not send if userId or email are missing', function(){
      test(squatch).identify();
      assert(!window._sqh.push.called);
    })

    it('should send if userId is given', function(){
      test(squatch)
        .identify('id')
        .called(window._sqh.push)
        .with(['init', {
          user_id: 'id',
          tenant_alias: 'baz',
          email: undefined,
          first_name: undefined,
          last_name: undefined,
          user_image: undefined
        }]);
    })

    it('should send if email is given', function(){
      test(squatch)
        .identify(null, { email: 'self@example.com' })
        .called(window._sqh.push)
        .with(['init', {
          user_id: null,
          tenant_alias: 'baz',
          email: 'self@example.com',
          first_name: undefined,
          last_name: undefined,
          user_image: undefined
        }])
    })

    it('should pass checksum', function(){
      test(squatch)
        .identify(null, { email: 'self@example.com' }, { SaaSquatch: { checksum: 'wee' } })
        .called(window._sqh.push)
        .with(['init', {
          user_id: null,
          tenant_alias: 'baz',
          email: 'self@example.com',
          first_name: undefined,
          last_name: undefined,
          user_image: undefined,
          checksum: 'wee'
        }])
    })

    it('should pass accountId', function(){
      test(squatch)
        .identify(null, { email: 'self@example.com', accountId: 123 })
        .called(window._sqh.push)
        .with(['init', {
          user_id: null,
          tenant_alias: 'baz',
          email: 'self@example.com',
          first_name: undefined,
          last_name: undefined,
          user_image: undefined,
          account_id: 123
        }])
    })

    it('should pass referral image', function(){
      test(squatch)
        .identify(1, { referralImage: 'img' })
        .called(window._sqh.push)
        .with(['init', {
          user_id: 1,
          tenant_alias: 'baz',
          email: undefined,
          first_name: undefined,
          last_name: undefined,
          user_image: undefined,
          fb_share_image: 'img'
        }])
    })

    it('should send only once', function(){
      test(squatch).identify('id');
      test(squatch).identify('id');
      assert(window._sqh.push.calledOnce);
    })

    it('should call #load after identify', function(){
      window._sqh = [];
      test(squatch).identify('my-id');
      assert(squatch.load.called);
    })
  })
})
