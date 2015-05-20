
/**
 * Module dependencies.
 */

var alias = require('alias');
var integration = require('analytics.js-integration');

/**
 * Expose `Trakio` integration.
 */

var Trakio = module.exports = integration('trak.io')
  .assumesPageview()
  .global('trak')
  .option('token', '')
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true)
  .tag('<script src="//d29p64779x43zo.cloudfront.net/v1/trak.io.min.js">');

/**
 * Options aliases.
 */

var optionsAliases = {
  initialPageview: 'auto_track_page_view'
};

/**
 * Initialize.
 *
 * https://docs.trak.io
 *
 * @api public
 */

Trakio.prototype.initialize = function(){
  var options = this.options;
  window.trak = window.trak || [];
  window.trak.io = window.trak.io || {};
  window.trak.push = window.trak.push || function(){};
  /* eslint-disable */
  window.trak.io.load = window.trak.io.load || function(e){var r = function(e){return function(){window.trak.push([e].concat(Array.prototype.slice.call(arguments,0))); }; } ,i=["initialize","identify","track","alias","channel","source","host","protocol","page_view"]; for (var s=0;s<i.length;s++) window.trak.io[i[s]]=r(i[s]); window.trak.io.initialize.apply(window.trak.io,arguments); };
  /* eslint-enable */
  window.trak.io.load(options.token, alias(options, optionsAliases));
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Trakio.prototype.loaded = function(){
  return !!(window.trak && window.trak.loaded);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Trakio.prototype.page = function(page){
  var category = page.category();
  var props = page.properties();
  var name = page.fullName();

  window.trak.io.page_view(props.path, name || props.title);

  if (category) window.trak.io.channel('category');

  // named pages
  if (name && this.options.trackNamedPages) {
    this.track(page.track(name));
  }

  // categorized pages
  if (category && this.options.trackCategorizedPages) {
    this.track(page.track(category));
  }
};

/**
 * Trait aliases.
 *
 * http://docs.trak.io/properties.html#special
 */

var traitAliases = {
  avatar: 'avatar_url',
  firstName: 'first_name',
  lastName: 'last_name'
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Trakio.prototype.identify = function(identify){
  var traits = identify.traits(traitAliases);
  var id = identify.userId();

  if (id) {
    window.trak.io.identify(id, traits);
  } else {
    window.trak.io.identify(traits);
  }
};

/**
 * Group.
 *
 * @param {String} id (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 *
 * TODO: add group
 * TODO: add `trait.company/organization` from trak.io docs http://docs.trak.io/properties.html#special
 */

/**
 * Track.
 *
 * @param {Track} track
 */

Trakio.prototype.track = function(track){
  var properties = track.properties();
  var channel = track.proxy('properties.channel');
  if (channel) {
    delete properties.channel;
    window.trak.io.track(track.event(), channel, properties);
  } else {
    window.trak.io.track(track.event(), properties);
  }
};

/**
 * Alias.
 *
 * @param {Alias} alias
 */

Trakio.prototype.alias = function(alias){
  if (!window.trak.io.distinct_id) return;
  var from = alias.from();
  var to = alias.to();

  if (to === window.trak.io.distinct_id()) return;

  if (from) {
    window.trak.io.alias(from, to);
  } else {
    window.trak.io.alias(to);
  }
};
