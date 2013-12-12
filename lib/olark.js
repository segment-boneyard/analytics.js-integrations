
var callback = require('callback');
var integration = require('integration');
var https = require('use-https');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Olark);
};


/**
 * Expose `Olark` integration.
 */

var Olark = exports.Integration = integration('Olark')
  .assumesPageview()
  .readyOnInitialize()
  .global('olark')
  .option('identify', true)
  .option('page', true)
  .option('siteId', '')
  .option('track', false);


/**
 * Initialize.
 *
 * http://www.olark.com/documentation
 *
 * @param {Object} page
 */

Olark.prototype.initialize = function (page) {
  window.olark||(function(c){var f=window,d=document,l=https()?"https:":"http:",z=c.name,r="load";var nt=function(){f[z]=function(){(a.s=a.s||[]).push(arguments)};var a=f[z]._={},q=c.methods.length;while(q--){(function(n){f[z][n]=function(){f[z]("call",n,arguments)}})(c.methods[q])}a.l=c.loader;a.i=nt;a.p={0:+new Date};a.P=function(u){a.p[u]=new Date-a.p[0]};function s(){a.P(r);f[z](r)}f.addEventListener?f.addEventListener(r,s,false):f.attachEvent("on"+r,s);var ld=function(){function p(hd){hd="head";return["<",hd,"></",hd,"><",i,' onl' + 'oad="var d=',g,";d.getElementsByTagName('head')[0].",j,"(d.",h,"('script')).",k,"='",l,"//",a.l,"'",'"',"></",i,">"].join("")}var i="body",m=d[i];if(!m){return setTimeout(ld,100)}a.P(1);var j="appendChild",h="createElement",k="src",n=d[h]("div"),v=n[j](d[h](z)),b=d[h]("iframe"),g="document",e="domain",o;n.style.display="none";m.insertBefore(n,m.firstChild).id=z;b.frameBorder="0";b.id=z+"-loader";if(/MSIE[ ]+6/.test(navigator.userAgent)){b.src="javascript:false"}b.allowTransparency="true";v[j](b);try{b.contentWindow[g].open()}catch(w){c[e]=d[e];o="javascript:var d="+g+".open();d.domain='"+d.domain+"';";b[k]=o+"void(0);"}try{var t=b.contentWindow[g];t.write(p());t.close()}catch(x){b[k]=o+'d.write("'+p().replace(/"/g,String.fromCharCode(92)+'"')+'");d.close();'}a.P(2)};ld()};nt()})({loader: "static.olark.com/jsclient/loader0.js",name:"olark",methods:["configure","extend","declare","identify"]});
  window.olark.identify(this.options.siteId);

  // keep track of the widget's open state
  var self = this;
  box('onExpand', function () { self._open = true; });
  box('onShrink', function () { self._open = false; });
};


/**
 * Page.
 *
 * @param {Page} page
 */

Olark.prototype.page = function (page) {
  if (!this.options.page || !this._open) return;
  var props = page.properties();
  var name = page.fullName();

  if (!name && !props.url) return;

  var msg = name ? name.toLowerCase() + ' page' : props.url;

  chat('sendNotificationToOperator', {
    body: 'looking at ' + msg // lowercase since olark does
  });
};


/**
 * Identify.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

Olark.prototype.identify = function (identify) {
  if (!this.options.identify) return;

  var username = identify.username();
  var traits = identify.traits();
  var id = identify.userId();
  var email = identify.email();
  var phone = identify.phone();
  var name = identify.name()
    || identify.firstName();

  visitor('updateCustomFields', traits);
  if (email) visitor('updateEmailAddress', { emailAddress: email });
  if (phone) visitor('updatePhoneNumber', { phoneNumber: phone });

  // figure out best name
  if (name) visitor('updateFullName', { fullName: name });

  // figure out best nickname
  var nickname = name || email || username || id;
  if (name && email) nickname += ' (' + email + ')';
  if (nickname) chat('updateVisitorNickname', { snippet: nickname });
};


/**
 * Track.
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Olark.prototype.track = function (track) {
  if (!this.options.track || !this._open) return;
  chat('sendNotificationToOperator', {
    body: 'visitor triggered "' + track.event() + '"' // lowercase since olark does
  });
};


/**
 * Helper method for Olark box API calls.
 *
 * @param {String} action
 * @param {Object} value
 */

function box (action, value) {
  window.olark('api.box.' + action, value);
}


/**
 * Helper method for Olark visitor API calls.
 *
 * @param {String} action
 * @param {Object} value
 */

function visitor (action, value) {
  window.olark('api.visitor.' + action, value);
}


/**
 * Helper method for Olark chat API calls.
 *
 * @param {String} action
 * @param {Object} value
 */

function chat (action, value) {
  window.olark('api.chat.' + action, value);
}
