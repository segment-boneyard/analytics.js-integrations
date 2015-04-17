
var integration = require('analytics.js-integration');

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

  if (!document.getElementById('outbound-js')) {
      // Create an async script element based on your key.
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'outbound-js';
      script.async = true;
      script.src = '//api.ob-dev.com/cdn/js/pub-b55397c1b62e3e452716fc2b556a65ef.js';

      // Insert our script next to the first script element.
      var first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(script, first);
  }
  this.load(this.ready);
};

Outbound.prototype.loaded = function(){
  return window.outbound;
};

Outbound.prototype.identify = function(identify){
  var firstLevelAttributes = ['user_id', 'first_name', 'last_name', 'email', 'phone_number', 'apns', 'gcm'];
  var allAttributes = identify.traits();
  var userAttributes = {
    attributes: {}
  };
  for (var attr in allAttributes){
    for (var i = 0; i < firstLevelAttributes.length; i++){
      if (firstLevelAttributes[i] === attr){
        userAttributes[attr] = allAttributes[attr];
        delete userAttributes.attributes[attr];
        break;
      } else if (attr === "id") {
        delete userAttributes.attributes[attr];
      } else {
        userAttributes.attributes[attr] = allAttributes[attr];
      }
    }
  }
  outbound.identify(identify.userId(), userAttributes);
};

Outbound.prototype.track = function(track){
  window.outbound.track(track.event(), track.properties());
};
