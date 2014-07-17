
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
        console.log('beforeEach');
        analytics = new Analytics;
        analytics.use(plugin);
        analytics.use(tester);
    });

    afterEach(function(){
        analytics.restore();
        analytics.reset();
        // reactor.reset();
        sandbox();
        console.log('afterEach');
    });

    it('should have the right settings', function(){
        analytics.compare(Reactor, integration('Reactor')
            .readyOnLoad()
            .global('ReactorAmObject')
            .global('_rcr')
            .option('apikey', null));
    });

    it('global object installed', function(){
        analytics.assert(window.ReactorAmObj === window._rcr);
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
                describe('#load', function(){
                    beforeEach(function(){
                        reactor.initialize();
                        reactor.load();
                        console.log('after load');
                    });

                    it('script injected', function(){
                        var scripts = document.getElementsByTagName('script');
                        for (var i = 0; i < scripts.length; i++) {
                            if(scripts[i].src.indexOf('reactor') != -1)
                            {   
                                analytics.assert(true);
                                return;
                            }
                        };
                        analytics.assert(false);
                    });

                    it('should create window.ReactorAmObj', function(){
                      analytics.assert(!window.ReactorAmObj);
                      analytics.initialize();
                      console.log(window.ReactorAmObj);
                      analytics.assert('_rcr' === window.ReactorAmObj);
                    });

                    it('should create window._rcr', function(){
                      analytics.assert(!window._rcr);
                      analytics.initialize();
                      analytics.assert('function' === typeof window._rcr);
                    });
                });
            }); 
        });
    });
});