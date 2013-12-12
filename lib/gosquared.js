
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
  .global('GoSquared')
  .global('_gs')
  .global('_gstc_lt')
  .option('siteToken', '');


/**
 * Initialize.
 *
 * http://www.gosquared.com/support
 *
 * @param {Object} page
 */

GoSquared.prototype.initialize = function (page) {
  var self = this;
  var options = this.options;

  // gosquared assumes a body in their script, so we need this wrapper
  onBody(function () {
    window.GoSquared = {};
    window.GoSquared.acct = options.siteToken;
    window.GoSquared.q = [];
    window._gstc_lt = new Date().getTime(); // time from `load`

    self.identify(new Identify({
      traits: user.traits(),
      userId: user.id()
    }));
    self.load();
  });
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

GoSquared.prototype.loaded = function () {
  return !! window._gs;
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
 * https://www.gosquared.com/customer/portal/articles/612063-tracker-functions
 *
 * @param {Page} page
 */

GoSquared.prototype.page = function (page) {
  var props = page.properties();
  var name = page.fullName();
  push('TrackView', props.path, name || props.title);
};


/**
 * Identify.
 *
 * https://www.gosquared.com/customer/portal/articles/612063-tracker-functions
 *
 * @param {Identify} identify
 */

GoSquared.prototype.identify = function (identify) {
  var traits = identify.traits({ userId: 'userID' });
  var username = identify.username();
  var email = identify.email();
  var id = identify.userId();
  var name = email || username || id;
  if (id || username) window.GoSquared.UserName = id || username;
  if (name) window.GoSquared.VisitorName = name;
  window.GoSquared.Visitor = traits;
};


/**
 * Track.
 *
 * https://www.gosquared.com/customer/portal/articles/609683-event-tracking
 *
 * @param {Track} track
 */

GoSquared.prototype.track = function (track) {
  push('TrackEvent', track.event(), track.properties());
};


/**
 * Helper to push onto the GoSquared queue.
 *
 * @param {Mixed} args...
 */

function push (args) {
  args = [].slice.call(arguments);
  window.GoSquared.q.push(args);
}
