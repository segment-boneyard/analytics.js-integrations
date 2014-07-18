
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var load = require('load-script');

module.exports = function(analytics){
    analytics.addIntegration(Reactor);
    group = analytics.group();
    user = analytics.user();
};


var Reactor = module.exports.Integration = integration('Reactor')
    .readyOnLoad()
    .global('ReactorAmObject')
    .global('_rcr')
    .option('apikey', null)
    .tag('collector', '<script src="//www.reactor.am/static/collector.js">');


Reactor.prototype.initialize = function(page) {
    (function(w,d,r){
        w['ReactorAmObject']=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)};
    })(window, document, '_rcr');

    this.load('collector', this.ready);
    _rcr('set_application_id', this.options.apikey);
}


Reactor.prototype.identify = function(userId, traits) {
    _rcr('collect', traits);
}


Reactor.prototype.track = function(track, options) {
    _rcr('event', track.event(), track.properties());
}


Reactor.prototype.page = function(page) {
    var props = page.properties();
    _rcr('event', 'pageview', {
        page: path(props),
        url: props.url
    });
}


Reactor.prototype.loaded = function() {
    return !! window._rcr;
};

function path(properties) {
    if (!properties) return;
    var str = properties.path;
    return str;
}
