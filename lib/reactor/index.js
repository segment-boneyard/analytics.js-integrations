
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

var Reactor = module.exports = integration('Reactor.am')
    .option('apikey', null);


Reactor.prototype.initialize = function() {

}


Reactor.prototype.load = function() {
    (function(w,d,l,r,a,n){
        w['ReactorAmObject']=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)};
        a=d.createElement('script');n=d.getElementsByTagName('script')[0];a.async=1;
        a.src=l;n.parentNode.insertBefore(a,n);
    })(window, document, '//www.reactor.am/static/collector.js', '_rcr');
}


Reactor.prototype.identify = function(track, options) {
    console.log('reactor identify');
    _rcr('collect', {
        user_id: undefined, //string, must be unique
        first_name_s: undefined, //string
        middle_name_s: undefined, //string
        last_name_s: undefined, //string
        email_s: undefined, //string
        profile_picture_s: undefined, //string
        registration_date_d: undefined, //date
        gender_g: undefined, //gender, value 'man' or 'woman'
        active_b: undefined, //boolean

        //example of custom data format
        share_facebook_b: false, //boolean
        color_s: 'red', //string
        age_i: 25, //integer
        last_order_d: new Date(), //date
        last_order_f: 11.45 //float
    });
}


Reactor.prototype.track = function(eventname, options) {
    console.log('reactor event', eventname);
    _rcr('event', track);
}
