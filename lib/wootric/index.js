var integration = require('analytics.js-integration');

/**
 * Expose `Wootric` integration.
 */

var Wootric = module.exports = integration('Wootric')
  .assumesPageview()
    .option('account_token', '')
    .global('wootricSettings')
    .global('wootric_survey_immediately')
    .global('wootric')
    //The integration object
    .global('_wootric')
    .tag('library', '<script src="http://d27j601g4x0gd5.cloudfront.net/segmentioSnippet.js"></script>')

/**
 * Initialize Wootric.
 *
 * @param {Facade} page
 */

Wootric.prototype.initialize = function(page){
  window._wootric = this;
  var self = this;
  if (window.wootricSettings) {
    window.wootricSettings.account_token = this.options.account_token;
  } else {
    window.wootricSettings = { account_token: this.options.account_token }
  }
  this.load('library', function(){
    self.ready();
  });
};

/**
 * Has the Wootric library been loaded yet?
 *
 * @return {Boolean}
 */

Wootric.prototype.loaded = function(){
  // We are always ready since we are just setting a global variable in initialize
  return window.wootric;
};

/**
 * Identify a user.
 *
 * @param {Facade} identify
 */

Wootric.prototype.identify = function(identify){
  var traits = identify.traits();
  var email = identify.email();
  var created_at = identify.created();
  var unixDt = Date.parse(created_at) || +created_at;
  if (unixDt) {
    window.wootricSettings.created_at = unixDt;
  }
  window.wootricSettings.email = email;
  //Set the rest of the traits as properties
  window.wootricSettings.properties = traits.properties;
  //remove the email and createdAt properties
  delete window.wootricSettings.properties.email;
  delete window.wootricSettings.properties.createdAt;
  window.wootric('run');
};

//Store the last page name tracked
Wootric.lastPageTracked = null;

/**
 * Page.
 *
 * @param {Page} page
 */

Wootric.prototype.page = function(page){
  var opts = this.options;
  //Only track page if we haven't already tracked it
  if (this.lastPageTracked !== window.location){
    this.lastPageTracked = window.location;
    var settings = window.wootricSettings;
    var account_token = settings.account_token;
    var email = settings.email;
    var created_at = settings.created_at;
    var i = new Image;
    i.src = "//d8myem934l1zi.cloudfront.net/pixel.gif?account_token="+account_token+"&email="+encodeURIComponent(email)+"&created_at="+created_at+"&url="+encodeURIComponent(window.location)+"&random="+Math.random()
  }
};
