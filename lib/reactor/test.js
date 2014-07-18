
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('../../test/sandbox');

describe('Reactor.am', function(){
    var Reactor = plugin.Integration;
    var analytics;
    var reactor;

    beforeEach(function(){
        analytics = new Analytics;
        analytics.use(plugin);
        analytics.use(tester);
    });

    afterEach(function(){
        analytics.restore();
        analytics.reset();
        // reactor.reset();
        sandbox();
    });

    it('should have the right settings', function(){
        analytics.compare(Reactor, integration('Reactor')
            .readyOnLoad()
            .global('ReactorAmObject')
            .global('_rcr')
            .option('apikey', null));
    });

    it('global object installed', function(){
        analytics.assert(window.ReactorAmObject === window._rcr);
    });

    describe('Universal', function(){
        var settings = {
            apikey: 'testkey'
        }

        beforeEach(function(){
          reactor = new Reactor(settings);
          analytics.add(reactor);
        });

        afterEach(function(){
          reactor.reset();
        });

        describe('before loading', function(){
            beforeEach(function(){
                analytics.stub(reactor, 'load');
            });

            describe('#initialize', function(){
                it('should create window.ReactorAmObject', function(){
                  analytics.assert(!window.ReactorAmObject);
                  analytics.initialize();
                  analytics.assert('_rcr' === window.ReactorAmObject);
                });

                it('should create window._rcr', function(){
                  analytics.assert(!window._rcr);
                  analytics.initialize();
                  analytics.assert('function' === typeof window._rcr);
                });

                it('should call #load', function(){
                  analytics.initialize();
                  analytics.page();
                  analytics.called(reactor.load);
                });
            }); 
        });

        describe('loading', function(){
            it('should load', function(done){
                analytics.load(reactor, done);
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
                    analytics.stub(window, '_rcr');
                });

                it('should send a collect request', function(){
                    analytics.identify();
                    analytics.called(window._rcr, 'collect');
                });

                it('should send a event request', function(){
                    var payload = { data: 'data_content'};
                    analytics.track('event_name', payload);
                    analytics.called(window._rcr, 'event', 'event_name', payload);
                });
            });
        });  
    });
});