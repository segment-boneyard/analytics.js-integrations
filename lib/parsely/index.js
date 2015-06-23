
var integration = require('analytics.js-integration');
/**
 * Expose `Parsely` integration.
 */

var Parsely = module.exports = integration('Parsely')
  .assumesPageview()
  .global('PARSELY')
  .global('parsely')
  .option('apikey', '');


Parsely.prototype.initialize = function() {
  window.parsely = {apikey: this.options.apikey} || window.parsely;

  // append the meta tag we need first before JS fires
  var meta = document.createElement('meta');
  meta.id = 'parsely-cfg';
  meta.setAttribute('data-parsely-site', window.parsely.apikey);
  document.getElementsByTagName('head')[0].appendChild(meta);

  // now that meta exists, fire the JS
  var fileref = document.createElement('script');
  fileref.setAttribute('type', 'text/javascript');
  fileref.setAttribute('src', 'http://static.parsely.com/p.js');
  document.getElementsByTagName('head')[0].appendChild(fileref);
  this.ready();
};

Parsely.prototype.loaded = function() {
  return !!window.parsely;
};

