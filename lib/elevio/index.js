
var integration = require('analytics.js-integration');
var tick = require('next-tick');

/**
 * Expose `Elevio` integration.
 */

var Elevio = module.exports = integration('Elevio')
  .assumesPageview()
  .option('accountId', '')
  .global('_elev')

/**
 * Initialize elevio.
 *
 * @param {Facade} page
 */

Elevio.prototype.initialize = function(page){
  var self = this;
  this.load(function(){
    tick(self.ready);
  });
}

Elevio.prototype.load = function(callback){
    window._elev = window._elev || {};(function(){var i,e;i=document.createElement("script"),i.type='text/javascript';i.async=1,i.src="https://static.elev.io/js/v3.js",e=document.getElementsByTagName("script")[0],e.parentNode.insertBefore(i,e);})();
    // window._elev = window._elev || {};(function(){var i,e;i=document.createElement("script"),i.type='text/javascript';i.async=1,i.src="http://widget.elev.dev:8000/scripts/v3.js",e=document.getElementsByTagName("script")[0],e.parentNode.insertBefore(i,e);})();
    _elev.account_id = this.options.accountId;
    _elev.segment = true;
    callback();
};

/**
 * Has the elevio library been loaded yet?
 *
 * @return {Boolean}
 */

Elevio.prototype.loaded = function(){
  return !! (window._elev);
};

/**
 * Identify a user.
 *
 * @param {Facade} identify
 */

Elevio.prototype.identify = function(identify){
    var name;
    if (identify.firstName() !== undefined) {
        name = identify.firstName();
        if (identify.lastName() !== undefined) {
            name += ' ' + identify.lastName();
        }
    } else if (identify.name() !== undefined) {
        name = identify.name();
    }
  var email = identify.email();
  var plan = identify.traits().plan;

  var user = {};
  user.via = 'segment';
  if (email) user.email = email;
  if (name) user.name = name;
  if (plan) user.plan = [plan];

  window._elev.user = user;
};
