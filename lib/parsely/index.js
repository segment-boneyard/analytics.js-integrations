
var integration = require('analytics.js-integration');
var onBody = require('on-body');


/* eslint-disable */
/**
 * Expose `Parsely` integration.
 */

var Parsely = module.exports = integration('Parsely')
  .assumesPageview()
  .global('PARSELY')
    .global('_parsely')
  .option('apikey', '');


Parsely.prototype.initialize = function() {
  var self = this;


    window._parsely = window._parsely || this.options;
    window._parsely.apikey = this.options['apikey'];

  (function(d) {
    b = d.body,
        e = d.createElement("div");
    e.innerHTML = '<span id="parsely-cfg" data-parsely-site="'+ window._parsely.apikey +'"></span>';
    e.id = "parsely-root";
    e.style.display = "none";
    b.appendChild(e);
  })(window.document);
  (function(s, p, d) {
    var h=d.location.protocol, i=p+"-"+s,
        e=d.getElementById(i), r=d.getElementById(p+"-root"),
        u=h==="https:"?"d1z2jf7jlzjs58.cloudfront.net"
            :"static."+p+".com";
    if (e) return;
    e = d.createElement(s); e.id = i; e.async = true;
    e.src = h+"//"+u+"/p.js"; r.appendChild(e);
  })("script", "parsely", window.document);

  onBody(function() {
    // need to wait for the body to load, otherwise DOM insert gives errors
    self.ready();
  });


};


Parsely.prototype.loaded = function(){

  return !!window._parsely;
};


/* eslint-enable */
