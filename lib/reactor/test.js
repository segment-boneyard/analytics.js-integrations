
var integration = require('analytics.js-integration');
var Analytics = require('analytics.js').constructor;

describe('Reactor.am', function(){
    var analytics;

	beforeEach(function(){
	    analytics = new Analytics;
	});

	it('should do something', function(){
		analytics.assert(true);
	});

	describe('something', function(){
		it('should do something', function(){
				analytics.assert(true);
			});			
	});
});