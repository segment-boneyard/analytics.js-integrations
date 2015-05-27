
/**
 * Module dependencies.
 */

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
  .tag('pixel', '<img src="//d8myem934l1zi.cloudfront.net/pixel.gif?account_token={{ accountToken }}&email={{ email }}&created_at={{ createdAt }}&url={{ url }}&random={{ cacheBuster }}">');

/**
 * Initialize Wootric.
 *
 * @api public
 */

Wootric.prototype.initialize = function(){
  // We use this to keep track of the last page that Wootric has tracked to
  // ensure we don't accidentally send a duplicate page call
  this.lastPageTracked = null;
  window.wootricSettings = window.wootricSettings || {};
  window.wootricSettings.account_token = this.options.accountToken;

  var self = this;
  this.load('library', function(){
    self.ready();
  });
};

/**
 * Has the Wootric library been loaded yet?
 *
 * @api private
 * @return {boolean}
 */

Wootric.prototype.loaded = function(){
  // We are always ready since we are just setting a global variable in initialize
  return !!window.wootric;
};

/**
 * Identify a user.
 *
 * @api public
 * @param {Facade} identify
 */

Wootric.prototype.identify = function(identify){
  var traits = identify.traits();
  var email = identify.email();
  var createdAt = identify.created();
  var language = traits.language;
  // FIXME: Date.parse is only IE > 8 compatible
  var unixDt = Date.parse(createdAt) || +createdAt;

  if (unixDt) window.wootricSettings.created_at = unixDt;
  if (language) window.wootricSettings.language = language;
  window.wootricSettings.email = email;
  // Set the rest of the traits as properties
  window.wootricSettings.properties = omit(['createdAt', 'email'], traits);

  window.wootric('run');
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

Wootric.prototype.page = function(page){
  // Only track page if we haven't already tracked it
  if (this.lastPageTracked === window.location){
    return;
  }

  // Set this page as the last page tracked
  this.lastPageTracked = window.location;

  var wootricSettings = window.wootricSettings;
  this.load('pixel', {
    accountToken: this.options.accountToken,
    email: encodeURIComponent(wootricSettings.email),
    createdAt: wootricSettings.created_at,
    url: encodeURIComponent(page.url()),
    cacheBuster: Math.random()
  });
};
