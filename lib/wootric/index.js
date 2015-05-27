var integration = require('analytics.js-integration');
var omit = require('omit');

/**
 * Expose `Wootric` integration.
 */

var Wootric = module.exports = integration('Wootric')
  .assumesPageview()
    .option('accountToken', '')
    .global('wootricSettings')
    .global('wootric_survey_immediately')
    .global('wootric')
    .tag('library', '<script src="//d27j601g4x0gd5.cloudfront.net/segmentioSnippet.js"></script>')
    .tag('pixel', '<img src="//d8myem934l1zi.cloudfront.net/pixel.gif?account_token={{ accountToken }}&email={{ email }}&created_at={{ createdAt }}&url={{ url }}&random={{ random }}">')

/**
 * Initialize Wootric.
 *
 * @param {Facade} page
 */

Wootric.prototype.initialize = function(page){
  this.lastPageTracked = null;
  var self = this;
  window.wootricSettings = window.wootricSettings || {}
  window.wootricSettings.account_token = this.options.accountToken;
  this.load('library', function(){
    self.ready();
  });
};

/**
 * Has the Wootric library been loaded yet?
 *
 * @return {boolean}
 */

Wootric.prototype.loaded = function(){
  // We are always ready since we are just setting a global variable in initialize
  return !!window.wootric;
};

/**
 * Identify a user.
 *
 * @param {Facade} identify
 */

Wootric.prototype.identify = function(identify){
  var traits = identify.traits();
  var email = identify.email();
  var createdAt = identify.created();
  var language = traits.language;
  var unixDt = Date.parse(createdAt) || +createdAt;
  if (unixDt) {
    window.wootricSettings.created_at = unixDt;
  }
  if (language) {
    window.wootricSettings.language = language;
  }
  window.wootricSettings.email = email;
  //Set the rest of the traits as properties
  window.wootricSettings.properties = omit(['createdAt', 'email'], traits);
  window.wootric('run');
};

/**
 * Page.
 *
 * @param {Page} page
 */

Wootric.prototype.page = function(page){
  //Only track page if we haven't already tracked it
  if (this.lastPageTracked !== window.location){
    this.lastPageTracked = window.location;
    var settings = window.wootricSettings;
    var accountToken = settings.accountToken;
    var email = encodeURIComponent(settings.email);
    var createdAt = settings.created_at;
    this.load('pixel', { accountToken: accountToken, email: email, createdAt: createdAt, url: encodeURIComponent(window.location), random: Math.random() });
  }
};
