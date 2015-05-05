var integration = require('analytics.js-integration');
var omit = require('omit');

var Outbound = module.exports = integration('Outbound')
  .global('outbound')
  .option('publicApiKey', '')
  .tag('<script src="//cdn.outbound.io/{{ publicApiKey }}.js">');

Outbound.prototype.initialize = function(page){
  window.outbound = window.outbound || [];
  window.outbound.methods = ['identify', 'track', 'registerApnsToken', 'registerGcmToken', 'disableApnsToken', 'disableGcmToken'];

  window.outbound.factory = function(method){
      return function(){
          var args = Array.prototype.slice.call(arguments);
          args.unshift(method);
          window.outbound.push(args);
          return window.outbound;
      };
  };

  for (var i = 0; i < window.outbound.methods.length; i++) {
      var key = window.outbound.methods[i];
      window.outbound[key] = window.outbound.factory(key);
  }

  this.load(this.ready);
};

Outbound.prototype.loaded = function(){
  return window.outbound;
};

Outbound.prototype.identify = function(identify){
  var traitsToOmit = [
    'id', 'userId',
    'email',
    'phone',
    'firstName',
    'lastName'
  ];
  var userId = identify.userId() || identify.anonymousId();
  var attributes = {
    attributes: omit(traitsToOmit, identify.traits()),
    email: identify.email(),
    phoneNumber: identify.phone(),
    firstName: identify.firstName(),
    lastName: identify.lastName()
  };
  outbound.identify(userId, attributes);
};

Outbound.prototype.track = function(track){
  window.outbound.track(track.event(), track.properties());
};
