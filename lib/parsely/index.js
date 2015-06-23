
var integration = require('analytics.js-integration');
/**
 * Expose `Parsely` integration.
 */

var Parsely = module.exports = integration('Parsely')
  .assumesPageview()
  .global('PARSELY')
  .global('parsely')
  .option('apikey', '')
  .tag('http', '<script src="http://static.parsely.com/p.js">');


Parsely.prototype.initialize = function() {
  window.parsely = {apikey: this.options.apikey};
  var meta = document.createElement('meta');
  meta.id = 'parsely-cfg';
  meta.setAttribute('data-parsely-site', window.parsely.apikey);
  document.getElementsByTagName('head')[0].appendChild(meta);
};

Parsely.prototype.loaded = function(){
  return !!window._parsely;
};


