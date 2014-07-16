
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

var Reactor = module.exports = integration('Reactor.am')
    .option('apikey', null);


Reactor.prototype.initialize = function(page) {

}


Reactor.prototype.load = function() {
    (function(w,d,l,r,a,n){
        w['ReactorAmObject']=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)};
        a=d.createElement('script');n=d.getElementsByTagName('script')[0];a.async=1;
        a.src=l;n.parentNode.insertBefore(a,n);
    })(window, document, '//www.reactor.am/static/collector.js', '_rcr');

    _rcr('set_application_id', this.options.apikey);
}


Reactor.prototype.identify = function(userId, traits) {
    _rcr('collect', traits);
}


Reactor.prototype.track = function(eventname, options) {
    _rcr('event', eventname, options);
}
