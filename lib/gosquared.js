
var Identify = require('facade').Identify;
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');
var onBody = require('on-body');


/**
 * User reference.
 */

var user;


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(GoSquared);
  user = analytics.user(); // store reference for later
};


/**
 * Expose `GoSquared` integration.
 */

var GoSquared = exports.Integration = integration('GoSquared')
  .assumesPageview()
  .readyOnLoad()
  .global('_gs')
  .option('siteToken', '')
  .option('anonymizeIP', false)
  .option('cookieDomain', null)
  .option('useCookies', true)
  .option('trackHash', false)
  .option('trackLocal', false)
  .option('trackParams', true);

/**
 * Initialize.
 *
 * https://www.gosquared.com/developer/tracker
 * Options: https://www.gosquared.com/developer/tracker/configuration
 *
 * @param {Object} page
 */

GoSquared.prototype.initialize = function (page) {
  var self = this;
  var options = this.options;

  // gosquared assumes a body in their script, so we need this wrapper
  onBody(function () {

    // placeholder _gs function which is replaced after the tracker has loaded
    var _gs = window._gs = window._gs || function() {
     (_gs.q = _gs.q || []).push(arguments);
    };

    _gs(options.siteToken);

    // options. this is rather verbose
    _gs('set', 'anonymizeIP', options.anonymizeIP);
    if (options.cookieDomain) _gs('set', 'cookieDomain', options.cookieDomain);
    _gs('set', 'useCookies', options.useCookies);
    _gs('set', 'trackHash', options.trackHash);
    _gs('set', 'trackLocal', options.trackLocal);
    _gs('set', 'trackParams', options.trackParams);

    self.identify(new Identify({
      traits: user.traits(),
      userId: user.id()
    }));
    self.load();
  });
};


/**
 * Loaded? (checks if the tracker version is set)
 *
 * @return {Boolean}
 */

GoSquared.prototype.loaded = function () {
  return !! (window._gs && window._gs.v);
};


/**
 * Load the GoSquared library.
 *
 * @param {Function} callback
 */

GoSquared.prototype.load = function (callback) {
  load('//d1l6p2sc9645hc.cloudfront.net/tracker.js', callback);
};


/**
 * Page.
 *
 * https://www.gosquared.com/developer/tracker/pageviews
 *
 * @param {Page} page
 */

GoSquared.prototype.page = function (page) {
  var props = page.properties();
  var name = page.fullName();

  window._gs('track', props.path, name || props.title)
};


/**
 * Identify.
 *
 * https://www.gosquared.com/developer/tracker/tagging
 *
 * @param {Identify} identify
 */

GoSquared.prototype.identify = function (identify) {
  var traits = identify.traits({ userId: 'userID' });
  var username = identify.username();
  var email = identify.email();
  var id = identify.userId();

  if (id) window._gs('set', 'visitorID', id);

  var name =  email || username || id;
  if (name) window._gs('set', 'visitorName', name);

  window._gs('set', 'visitor', traits);
};


/**
 * Track.
 *
 * https://www.gosquared.com/developer/tracker/events
 *
 * @param {Track} track
 */

GoSquared.prototype.track = function (track) {
  window._gs('event', track.event(), track.properties());
};
