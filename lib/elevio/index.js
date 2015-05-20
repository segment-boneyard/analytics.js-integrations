
var integration = require('analytics.js-integration');
var tick = require('next-tick');

/**
 * Expose `Elevio` integration.
 */

var Elevio = module.exports = integration('Elevio')
  .assumesPageview()
  .option('accountId', '')
  .global('_elev')
  .tag('<script src="https://static.elev.io/js/v3.js">');

/**
 * Initialize elevio.
 *
 * @param {Facade} page
 */

Elevio.prototype.initialize = function(page){
    var self = this;
    window._elev = window._elev || {};
    _elev.account_id = this.options.accountId;
    _elev.segment = true;
    this.load(function(){
      tick(self.ready);
    });
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
  var name = identify.name();
  var email = identify.email();
  var plan = identify.proxy('traits.plan');

  var user = {};
  user.via = 'segment';
  if (email) user.email = email;
  if (name) user.name = name;
  if (plan) user.plan = [plan];

  window._elev.user = user;
};
