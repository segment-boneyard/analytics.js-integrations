
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

module.exports = function(analytics){
  analytics.addIntegration(Reactor);
  group = analytics.group();
  user = analytics.user();
};


var Reactor = module.exports.Integration = integration('Reactor')
    .readyOnLoad()
    .global('ReactorAmObject')
    .global('_rcr')
    .option('apikey', null);


Reactor.prototype.initialize = function(page) {
    (function(w,d,l,r,a,n){
        w['ReactorAmObject']=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)};
    })(window, document, '//www.reactor.am/static/collector.js', '_rcr');
}


Reactor.prototype.load = function() {
    (function(w,d,l,r,a,n){
        a=d.createElement('script');n=d.getElementsByTagName('script')[0];a.async=1;
        a.src=l;n.parentNode.insertBefore(a,n);
    })(window, document, '//www.reactor.am/static/collector.js', '_rcr');
    console.log('reactor loaded');
    _rcr('set_application_id', this.options.apikey);
}


Reactor.prototype.identify = function(userId, traits) {
    _rcr('collect', traits);
}


Reactor.prototype.track = function(eventname, options) {
    _rcr('event', eventname, options);
}
