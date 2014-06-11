
var alias = require('alias');
var clone = require('clone');
var dates = require('convert-dates');
var integration = require('integration');
var iso = require('to-iso-string');
var load = require('load-script');
var indexof = require('indexof');
var del = require('obj-case').del;

/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Mixpanel);
};


/**
 * Expose `Mixpanel` integration.
 */

var Mixpanel = exports.Integration = integration('Mixpanel')
  .readyOnLoad()
  .global('mixpanel')
  .option('increments', [])
  .option('cookieName', '')
  .option('nameTag', true)
  .option('pageview', false)
  .option('people', false)
  .option('token', '')
  .option('trackAllPages', false)
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true);


/**
 * Options aliases.
 */

var optionsAliases = {
  cookieName: 'cookie_name'
};


/**
 * Initialize.
 *
 * https://mixpanel.com/help/reference/javascript#installing
 * https://mixpanel.com/help/reference/javascript-full-api-reference#mixpanel.init
 */

Mixpanel.prototype.initialize = function () {
  (function (c, a) {window.mixpanel = a; var b, d, h, e; a._i = []; a.init = function (b, c, f) {function d(a, b) {var c = b.split('.'); 2 == c.length && (a = a[c[0]], b = c[1]); a[b] = function () {a.push([b].concat(Array.prototype.slice.call(arguments, 0))); }; } var g = a; 'undefined' !== typeof f ? g = a[f] = [] : f = 'mixpanel'; g.people = g.people || []; h = ['disable', 'track', 'track_pageview', 'track_links', 'track_forms', 'register', 'register_once', 'unregister', 'identify', 'alias', 'name_tag', 'set_config', 'people.set', 'people.increment', 'people.track_charge', 'people.append']; for (e = 0; e < h.length; e++) d(g, h[e]); a._i.push([b, c, f]); }; a.__SV = 1.2; })(document, window.mixpanel || []);
  this.options.increments = lowercase(this.options.increments);
  var options = alias(this.options, optionsAliases);
  window.mixpanel.init(options.token, options);
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Mixpanel.prototype.loaded = function () {
  return !! (window.mixpanel && window.mixpanel.config);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Mixpanel.prototype.load = function (callback) {
  load('//cdn.mxpnl.com/libs/mixpanel-2.2.min.js', callback);
};


/**
 * Page.
 *
 * https://mixpanel.com/help/reference/javascript-full-api-reference#mixpanel.track_pageview
 *
 * @param {String} category (optional)
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Mixpanel.prototype.page = function (page) {
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  // all pages
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // categorized pages
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named pages
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};


/**
 * Trait aliases.
 */

var traitAliases = {
  created: '$created',
  email: '$email',
  firstName: '$first_name',
  lastName: '$last_name',
  lastSeen: '$last_seen',
  name: '$name',
  username: '$username',
  phone: '$phone'
};


/**
 * Identify.
 *
 * https://mixpanel.com/help/reference/javascript#super-properties
 * https://mixpanel.com/help/reference/javascript#user-identity
 * https://mixpanel.com/help/reference/javascript#storing-user-profiles
 *
 * @param {Identify} identify
 */

Mixpanel.prototype.identify = function (identify) {
  var username = identify.username();
  var email = identify.email();
  var id = identify.userId();

  // id
  if (id) window.mixpanel.identify(id);

  // name tag
  var nametag = email || username || id;
  if (nametag) window.mixpanel.name_tag(nametag);

  // traits
  var traits = identify.traits(traitAliases);
  if (traits.$created) del(traits, 'createdAt');
  window.mixpanel.register(traits);
  if (this.options.people) window.mixpanel.people.set(traits);
};


/**
 * Track.
 *
 * https://mixpanel.com/help/reference/javascript#sending-events
 * https://mixpanel.com/help/reference/javascript#tracking-revenue
 *
 * @param {Track} track
 */

Mixpanel.prototype.track = function (track) {
  var increments = this.options.increments;
  var increment = track.event().toLowerCase();
  var people = this.options.people;
  var props = track.properties();
  var revenue = track.revenue();

  // delete mixpanel's reserved properties, so they don't conflict
  delete props.distinct_id;
  delete props.ip;
  delete props.mp_name_tag;
  delete props.mp_note;
  delete props.token;

  // increment properties in mixpanel people
  if (people && ~indexof(increments, increment)) {
    window.mixpanel.people.increment(track.event());
    window.mixpanel.people.set('Last ' + track.event(), new Date);
  }

  // track the event
  props = dates(props, iso);
  window.mixpanel.track(track.event(), props);

  // track revenue specifically
  if (revenue && people) {
    window.mixpanel.people.track_charge(revenue);
  }
};


/**
 * Alias.
 *
 * https://mixpanel.com/help/reference/javascript#user-identity
 * https://mixpanel.com/help/reference/javascript-full-api-reference#mixpanel.alias
 *
 * @param {Alias} alias
 */

Mixpanel.prototype.alias = function (alias) {
  var mp = window.mixpanel;
  var to = alias.to();
  if (mp.get_distinct_id && mp.get_distinct_id() === to) return;
  // HACK: internal mixpanel API to ensure we don't overwrite
  if (mp.get_property && mp.get_property('$people_distinct_id') === to) return;
  // although undocumented, mixpanel takes an optional original id
  mp.alias(to, alias.from());
};

/**
 * Lowercase the given `arr`.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function lowercase(arr){
  var ret = new Array(arr.length);

  for (var i = 0; i < arr.length; ++i) {
    ret[i] = String(arr[i]).toLowerCase();
  }

  return ret;
}
