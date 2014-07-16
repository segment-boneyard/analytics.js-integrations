
var integration = require('analytics.js-integration');
var Analytics = require('analytics.js').constructor;
var tester = require('analytics.js-integration-tester');
var plugin = require('./');

// var Analytics = require('analytics.js');
// var tester = require('integration-tester');


describe('Reactor.am', function(){
	var Reactor = plugin;
	// var Reactor = plugin.Integration;

    var analytics = new Analytics;
	var reactor = new Reactor();

	// analytics.use(plugin);
	analytics.use(tester);
    analytics.add(reactor);

	it('reactor global object installed', function(){
		analytics.assert(window.ReactorAmObj === window._rcr);
	});	
});