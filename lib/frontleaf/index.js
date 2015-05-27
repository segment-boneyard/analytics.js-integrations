
/**
 * Module dependencies.
 */

var bind = require('bind');
var each = require('each');
var integration = require('analytics.js-integration');
var is = require('is');

/**
 * hasOwnProperty reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `Frontleaf` integration.
 */

var Frontleaf = module.exports = integration('Frontleaf')
  .global('_fl')
  .global('_flBaseUrl')
  .option('baseUrl', 'https://api.frontleaf.com')
  .option('stream', '')
  .option('token', '')
  .option('trackCategorizedPages', false)
  .option('trackNamedPages', false)
  .tag('<script id="_fl" src="{{ baseUrl }}/lib/tracker.js">');

/**
 * Initialize.
 *
 * http://docs.frontleaf.com/#/technical-implementation/tracking-customers/tracking-beacon
 *
 * @api public
 */

Frontleaf.prototype.initialize = function(){
  window._fl = window._fl || [];
  window._flBaseUrl = window._flBaseUrl || this.options.baseUrl;
  this._push('setApiToken', this.options.token);
  this._push('setStream', this.options.stream);
  // TODO: Do we need this to be bound?
  bind(this, this.loaded);
  this.load({ baseUrl: window._flBaseUrl }, this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Frontleaf.prototype.loaded = function(){
  return is.array(window._fl) && window._fl.ready === true;
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Frontleaf.prototype.identify = function(identify){
  var userId = identify.userId();
  if (userId) {
    this._push('setUser', {
      id: userId,
      name: identify.name() || identify.username(),
      data: clean(identify.traits())
    });
  }
};

/**
 * Group.
 *
 * @api public
 * @param {Group} group
 */

Frontleaf.prototype.group = function(group){
  var groupId = group.groupId();
  if (groupId) {
    this._push('setAccount', {
      id: groupId,
      name: group.proxy('traits.name'),
      data: clean(group.traits())
    });
  }
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

Frontleaf.prototype.page = function(page){
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

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
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Frontleaf.prototype.track = function(track){
  var event = track.event();
  this._push('event', event, clean(track.properties()));
};

/**
 * Push a command onto the global Frontleaf queue.
 *
 * @api private
 * @param {String} command
 * @return {Object} args
 */

Frontleaf.prototype._push = function(command){
  var args = [].slice.call(arguments, 1);
  window._fl.push(function(t){ t[command].apply(command, args); });
};

/**
 * Clean all nested objects and arrays.
 *
 * @api private
 * @param {Object} obj
 * @return {Object}
 */

function clean(obj){
  var ret = {};

  // Remove traits/properties that are already represented
  // outside of the data container
  // TODO: Refactor into `omit` call
  var excludeKeys = ['id', 'name', 'firstName', 'lastName'];
  each(excludeKeys, function(omitKey){
    clear(obj, omitKey);
  });

  // Flatten nested hierarchy, preserving arrays
  obj = flatten(obj);

  // Discard nulls, represent arrays as comma-separated strings
  // FIXME: This also discards `undefined`s. Is that OK?
  for (var key in obj) {
    if (has.call(obj, key)) {
      var val = obj[key];
      if (val == null) {
        continue;
      }

      if (is.array(val)) {
        ret[key] = val.toString();
        continue;
      }

      ret[key] = val;
    }
  }

  return ret;
}

/**
 * Remove a property from an object if set.
 *
 * @api private
 * @param {Object} obj
 * @param {String} key
 */

function clear(obj, key){
  if (obj.hasOwnProperty(key)) {
    delete obj[key];
  }
}

/**
 * Flatten a nested object into a single level space-delimited
 * hierarchy.
 *
 * Based on https://github.com/hughsk/flat
 *
 * @api private
 * @param {Object} source
 * @return {Object}
 */

function flatten(source){
  var output = {};

  function step(object, prev){
    for (var key in object) {
      if (has.call(object, key)) {
        var value = object[key];
        var newKey = prev ? prev + ' ' + key : key;

        if (!is.array(value) && is.object(value)) {
          return step(value, newKey);
        }

        output[newKey] = value;
      }
    }
  }

  step(source);

  return output;
}
