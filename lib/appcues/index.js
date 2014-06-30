
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var Identify = require('facade').Identify;
var load = require('load-script');
var is = require('is');

/**
 * User reference.
 */

var user;


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Appcues);
  user = analytics.user();
};

/**
 * Expose `Appcues` integration.
 */

var Appcues = exports.Integration = integration('Appcues')
  .assumesPageview()
  .readyOnLoad()
  .global('Appcues')
  .global('AppcuesIdentity')
  .option('appcuesId', '');

/**
 * Initialize.
 *
 * http://appcues.com/docs/
 *
 * @param {Object}
 */

Appcues.prototype.initialize = function () {
  var e = email(user);

  // Don't load script if user can't be identified.
  if (user.id() != null && e) {
    this.load(function() {
      window.Appcues.init();
    });
  }
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Appcues.prototype.loaded = function(){
  return is.object(window.Appcues);
};

/**
 * Load the Appcues library.
 *
 * @param {Function} callback
 */

Appcues.prototype.load = function(callback){
  var script = load('//d2dubfq97s02eu.cloudfront.net/appcues-bundle.min.js', callback);
  script.setAttribute('data-appcues-id', this.options.appcuesId);
  script.setAttribute('data-user-id', user.id());

  // Try to assign the user's email as best as we can.
  var e = email(user);
  if (e) script.setAttribute('data-user-email', e);
};


/**
 * Identify.
 *
 * http://appcues.com/docs#identify
 *
 * @param {Identify} identify
 */

Appcues.prototype.identify = function (identify) {
  var _identify = function() {
    window.Appcues.identify(identify.traits());
  }
  if (!this.loaded()) {
    this.load(function() {
      window.Appcues.init();
      _identify();
    });
  } else {
    _identify();
  }
};

/**
 * Get email from `user`.
 *
 * @param {User} user
 * @return {String}
 */

function email(user) {
  var identify = new Identify({
    userId: user.id(),
    traits: user.traits()
  });
  return identify.email();
}